import { getRecipes } from '@/lib/recipes/queries'
import WeeklySelectionManager from './WeeklySelectionManager'

export default async function AdminWeeklyPage() {
  const recipes = await getRecipes({ sort: 'popular' })

  return <WeeklySelectionManager recipes={recipes} />
}
