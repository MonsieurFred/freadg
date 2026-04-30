import { getUserShoppingList, getWeekStartDate } from '@/lib/recipes/queries'
import ShoppingListClient from './ShoppingListClient'

export default async function ShoppingListPage() {
  const weekStartDate = getWeekStartDate()
  const shoppingList = await getUserShoppingList(weekStartDate)

  return <ShoppingListClient initialShoppingList={shoppingList} weekStartDate={weekStartDate} />
}
