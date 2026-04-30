import { type MealType, type Recipe } from '@/types/database'

export const MEAL_PLAN_UPDATED_EVENT = 'fridge:meal-plan-updated'

type LocalPlannedMeal = {
  dayOfWeek: number
  mealType: MealType
  recipe: Recipe
}

const MEAL_TYPES: MealType[] = ['lunch', 'dinner']

export function getCurrentWeekStartDate() {
  const today = new Date()
  const monday = new Date(today)
  const day = today.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(today.getDate() + diff)
  return monday.toISOString().slice(0, 10)
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
