import { type MealType, type Recipe } from '@/types/database'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { getWeekStartDate } from '@/lib/dates/week'

export const MEAL_PLAN_UPDATED_EVENT = 'fridge:meal-plan-updated'

type LocalPlannedMeal = {
  dayOfWeek: number
  mealType: MealType
  recipe: Recipe
}

const MEAL_TYPES: MealType[] = ['lunch', 'dinner']

export function getCurrentWeekStartDate() {
  return getWeekStartDate()
}

export function readLocalMealPlan(weekStartDate = getCurrentWeekStartDate()) {
  if (typeof window === 'undefined') return []

  const rawValue = window.localStorage.getItem(storageKey(weekStartDate))
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed.filter(isLocalPlannedMeal) : []
  } catch {
    return []
  }
}

export function writeLocalMealPlan(meals: LocalPlannedMeal[], weekStartDate = getCurrentWeekStartDate()) {
  window.localStorage.setItem(storageKey(weekStartDate), JSON.stringify(meals))
  window.dispatchEvent(new Event(MEAL_PLAN_UPDATED_EVENT))
}

export function addRecipeToCurrentWeek(recipe: Recipe) {
  const weekStartDate = getCurrentWeekStartDate()
  const meals = readLocalMealPlan(weekStartDate)
  const existing = meals.find((meal) => meal.recipe.id === recipe.id)

  if (existing) {
    return { status: 'already_added' as const, meal: existing }
  }

  for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek += 1) {
    for (const mealType of MEAL_TYPES) {
      const occupied = meals.some((meal) => meal.dayOfWeek === dayOfWeek && meal.mealType === mealType)
      if (!occupied) {
        const meal = { dayOfWeek, mealType, recipe }
        writeLocalMealPlan([...meals, meal], weekStartDate)
        return { status: 'added' as const, meal }
      }
    }
  }

  return { status: 'full' as const }
}

export async function addRecipeToCurrentWeekRemote(recipe: Recipe) {
  const weekStartDate = getCurrentWeekStartDate()

  if (isSupabaseConfigured() && !recipe.id.startsWith('mock-')) {
    try {
      const response = await fetch('/api/demo/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: recipe.id, weekStartDate }),
      })

      if (response.ok) {
        const result = await response.json() as { status?: 'added' | 'already_added' | 'full' }
        if (result.status === 'added' || result.status === 'already_added' || result.status === 'full') {
          return { status: result.status }
        }
      }
    } catch {
      // Fall through to browser/client-side persistence below.
    }
  }

  if (!isSupabaseConfigured() || recipe.id.startsWith('mock-')) {
    return addRecipeToCurrentWeek(recipe)
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return addRecipeToCurrentWeek(recipe)
    }

    const { data: meals, error: readError } = await supabase
      .from('user_meal_plans')
      .select('day_of_week, meal_type, recipe_id')
      .eq('user_id', user.id)
      .eq('week_start_date', weekStartDate)

    if (readError) {
      return addRecipeToCurrentWeek(recipe)
    }

    if (meals?.some((meal) => meal.recipe_id === recipe.id)) {
      return { status: 'already_added' as const }
    }

    for (let dayOfWeek = 1; dayOfWeek <= 7; dayOfWeek += 1) {
      for (const mealType of MEAL_TYPES) {
        const occupied = meals?.some((meal) => meal.day_of_week === dayOfWeek && meal.meal_type === mealType)
        if (!occupied) {
          const { data, error: insertError } = await supabase
            .from('user_meal_plans')
            .insert({
              user_id: user.id,
              week_start_date: weekStartDate,
              day_of_week: dayOfWeek,
              meal_type: mealType,
              recipe_id: recipe.id,
            })
            .select('id')
            .single()

          if (insertError || !data) {
            return addRecipeToCurrentWeek(recipe)
          }

          return { status: 'added' as const, meal: { dayOfWeek, mealType, recipe } }
        }
      }
    }

    return { status: 'full' as const }
  } catch {
    return addRecipeToCurrentWeek(recipe)
  }
}

export function removeLocalMeal(dayOfWeek: number, mealType: MealType, weekStartDate = getCurrentWeekStartDate()) {
  const meals = readLocalMealPlan(weekStartDate).filter(
    (meal) => meal.dayOfWeek !== dayOfWeek || meal.mealType !== mealType
  )
  writeLocalMealPlan(meals, weekStartDate)
}

function storageKey(weekStartDate: string) {
  return `fridge:meal-plan:${weekStartDate}`
}

function isLocalPlannedMeal(value: unknown): value is LocalPlannedMeal {
  if (!value || typeof value !== 'object') return false
  const meal = value as Partial<LocalPlannedMeal>
  return (
    typeof meal.dayOfWeek === 'number' &&
    (meal.mealType === 'lunch' || meal.mealType === 'dinner') &&
    Boolean(meal.recipe) &&
    typeof meal.recipe?.id === 'string'
  )
}
