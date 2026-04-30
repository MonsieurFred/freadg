import { createClient } from '@/lib/supabase/server'
import { type Ingredient, type MealType, type Recipe, type RecipeWithIngredients } from '@/types/database'
import { CATALOG_RECIPES, filterMockRecipes, MOCK_RECIPES, WEEK_RECIPES } from './mock-data'
import { getRecipeImageUrl } from './images'

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false'

export type RecipeFilters = {
  search?: string
  tag?: string
  season?: string
  maxTime?: number
  maxCalories?: number
  sort?: string
}

export type MealPlanWithRecipe = {
  id: string
  day_of_week: number
  meal_type: MealType
  recipe_id: string
  recipes: Recipe
}

export function getWeekStartDate(): string {
  const today = new Date()
  const day = today.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  return monday.toISOString().slice(0, 10)
}

export async function getRecipes(filters: RecipeFilters = {}) {
  return withRecipeImages(sortRecipes(filterMockRecipes(filters), filters.sort))
}

export async function getRecipeWithIngredients(id: string): Promise<RecipeWithIngredients | null> {
  if (USE_MOCK_DATA) {
    return withRecipeImage(CATALOG_RECIPES.find((mockRecipe) => mockRecipe.id === id) ?? null)
  }

  const supabase = await createClient()
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (recipeError || !recipe) {
    return withRecipeImage(CATALOG_RECIPES.find((mockRecipe) => mockRecipe.id === id) ?? null)
  }

  const { data: ingredients, error: ingredientsError } = await supabase
    .from('ingredients')
    .select('*')
    .eq('recipe_id', id)
    .order('grocery_category', { ascending: true })
    .order('name', { ascending: true })

  if (ingredientsError) {
    console.error('Unable to load recipe ingredients', ingredientsError)
    return withRecipeImage({ ...recipe, ingredients: [] })
  }

  return withRecipeImage({
    ...(recipe satisfies Recipe),
    ingredients: (ingredients ?? []) satisfies Ingredient[],
  })
}

export async function getCurrentUserHouseholdSize() {
  if (USE_MOCK_DATA) {
    return 2
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 2
  }

  const { data: profile } = await supabase
    .from('users')
    .select('household_size')
    .eq('id', user.id)
    .single()

  return profile?.household_size ?? 2
}

export async function getCurrentWeekRecipes() {
  return withRecipeImages(WEEK_RECIPES.slice(0, 20))
}

export async function getUserMealPlanForWeek(weekStartDate: string): Promise<MealPlanWithRecipe[]> {
  if (USE_MOCK_DATA) {
    return []
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('user_meal_plans')
    .select('id, day_of_week, meal_type, recipe_id, recipes(*)')
    .eq('user_id', user.id)
    .eq('week_start_date', weekStartDate)

  if (error || !data) return []
  return data as unknown as MealPlanWithRecipe[]
}

export async function getUserShoppingList(weekStartDate: string) {
  if (USE_MOCK_DATA) {
    return { householdSize: 2, categories: {} as Record<string, Array<{ name: string; quantity: number; unit: string }>> }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { householdSize: 2, categories: {} as Record<string, Array<{ name: string; quantity: number; unit: string }>> }
  }

  const [profileResult, shoppingResult] = await Promise.all([
    supabase.from('users').select('household_size').eq('id', user.id).single(),
    supabase.rpc('get_shopping_list', { p_user_id: user.id, p_week_start: weekStartDate }),
  ])

  const householdSize = profileResult.data?.household_size ?? 2
  const items = shoppingResult.data ?? []

  if (!items.length) {
    return {
      householdSize,
      categories: {} as Record<string, Array<{ name: string; quantity: number; unit: string }>>,
    }
  }

  const categories = items.reduce<Record<string, Array<{ name: string; quantity: number; unit: string }>>>(
    (groups, item) => {
      groups[item.grocery_category] ??= []
      groups[item.grocery_category].push({
        name: item.ingredient_name,
        quantity: item.total_quantity,
        unit: item.unit,
      })
      return groups
    },
    {}
  )

  return { householdSize, categories }
}

export type PlannedMeal = {
  day: string
  dayOfWeek: number
  mealType: MealType
  recipe: RecipeWithIngredients
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export async function getSuggestedMealPlan() {
  const recipes = await getRecipes()
  const recipesWithIngredients = await Promise.all(
    recipes.slice(0, 14).map((recipe) => getRecipeWithIngredients(recipe.id))
  )
  const usableRecipes = recipesWithIngredients.filter(Boolean) as RecipeWithIngredients[]
  const sourceRecipes = usableRecipes.length ? usableRecipes : MOCK_RECIPES

  return DAYS.flatMap((day, dayIndex) =>
    (['lunch', 'dinner'] as MealType[]).map((mealType, mealIndex) => ({
      day,
      dayOfWeek: dayIndex + 1,
      mealType,
      recipe: sourceRecipes[(dayIndex * 2 + mealIndex) % sourceRecipes.length],
    }))
  )
}

export async function getSuggestedShoppingList() {
  const householdSize = await getCurrentUserHouseholdSize()
  const plan = await getSuggestedMealPlan()
  const items = new Map<string, {
    name: string
    quantity: number
    unit: string
    grocery_category: string
  }>()

  for (const plannedMeal of plan) {
    const scale = householdSize / plannedMeal.recipe.servings_base

    for (const ingredient of plannedMeal.recipe.ingredients) {
      const key = `${ingredient.name.toLowerCase()}-${ingredient.unit.toLowerCase()}`
      const existing = items.get(key)

      if (existing) {
        existing.quantity += ingredient.quantity * scale
      } else {
        items.set(key, {
          name: ingredient.name,
          quantity: ingredient.quantity * scale,
          unit: ingredient.unit,
          grocery_category: ingredient.grocery_category,
        })
      }
    }
  }

  return {
    householdSize,
    categories: Array.from(items.values()).reduce<Record<string, Array<{
      name: string
      quantity: number
      unit: string
    }>>>((groups, item) => {
      groups[item.grocery_category] ??= []
      groups[item.grocery_category].push({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      })
      return groups
    }, {}),
  }
}

export async function getRecipeStats() {
  const recipes = await getRecipes()
  const totalRecipes = recipes.length
  const activeRecipes = recipes.filter((recipe) => recipe.is_active).length
  const quickRecipes = recipes.filter((recipe) => recipe.prep_time_minutes <= 30).length
  const vegetarianRecipes = recipes.filter((recipe) => recipe.tags.includes('vegetarian')).length

  let estimatedActiveSubscribers = 0
  if (!USE_MOCK_DATA) {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const admin = createAdminClient()
    const { count } = await admin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')
    estimatedActiveSubscribers = count ?? 0
  }

  return {
    totalRecipes,
    activeRecipes,
    quickRecipes,
    vegetarianRecipes,
    estimatedActiveSubscribers,
  }
}

function sortRecipes<T extends Recipe>(recipes: T[], sort = 'newest') {
  return [...recipes].sort((a, b) => {
    if (sort === 'prep_time') {
      return a.prep_time_minutes - b.prep_time_minutes
    }

    if (sort === 'calories') {
      return (a.calories ?? Number.MAX_SAFE_INTEGER) - (b.calories ?? Number.MAX_SAFE_INTEGER)
    }

    if (sort === 'popular') {
      return popularityScore(b) - popularityScore(a)
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

function withRecipeImages<T extends Recipe>(recipes: T[]) {
  return recipes.map((recipe) => withRecipeImage(recipe))
}

function withRecipeImage<T extends Recipe | null>(recipe: T): T {
  if (!recipe) return recipe
  return {
    ...recipe,
    photo_url: getRecipeImageUrl(recipe.title, recipe.photo_url),
  }
}

function popularityScore(recipe: Recipe) {
  let score = 0
  if (recipe.tags.includes('family')) score += 3
  if (recipe.tags.includes('quick')) score += 2
  if (recipe.tags.includes('high_protein')) score += 1
  return score
}
