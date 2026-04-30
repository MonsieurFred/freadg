import { getRecipes } from '@/lib/recipes/queries'
import AdminRecipeManager from './AdminRecipeManager'

export default async function AdminRecipesPage() {
  const recipes = await getRecipes()

  return <AdminRecipeManager initialRecipes={recipes} />
}
