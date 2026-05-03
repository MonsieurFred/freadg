'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MEAL_PLAN_UPDATED_EVENT, readLocalMealPlan } from '@/lib/meal-plan/storage'
import { formatQuantity } from '@/lib/recipes/labels'
import { CATALOG_RECIPES } from '@/lib/recipes/mock-data'
import { GROCERY_STORES, STORE_PREFERENCE_UPDATED_EVENT, getStoreById, readFavoriteStoreId, type GroceryStore } from '@/lib/stores/storage'
import { type Ingredient, type RecipeWithIngredients } from '@/types/database'
import CopyShoppingListButton from './CopyShoppingListButton'

type ShoppingItem = { name: string; quantity: number; unit: string }
type ShoppingCategories = Record<string, ShoppingItem[]>
type ShoppingList = {
  householdSize: number
  categories: ShoppingCategories
}

type Props = {
  initialShoppingList: ShoppingList
  weekStartDate: string
}

export default function ShoppingListClient({ initialShoppingList, weekStartDate }: Props) {
  const [localCategories, setLocalCategories] = useState<ShoppingCategories>({})
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => new Set())
  const [storeFeedback, setStoreFeedback] = useState<string | null>(null)
  const [favoriteStore, setFavoriteStore] = useState<GroceryStore | null>(null)

  useEffect(() => {
    function syncLocalShoppingList() {
      setLocalCategories(buildLocalShoppingCategories(weekStartDate, initialShoppingList.householdSize))
    }

    syncLocalShoppingList()
    window.addEventListener(MEAL_PLAN_UPDATED_EVENT, syncLocalShoppingList)
    window.addEventListener('storage', syncLocalShoppingList)
    return () => {
      window.removeEventListener(MEAL_PLAN_UPDATED_EVENT, syncLocalShoppingList)
      window.removeEventListener('storage', syncLocalShoppingList)
    }
  }, [initialShoppingList.householdSize, weekStartDate])

  const categories = useMemo(
    () => Object.entries(mergeCategories(initialShoppingList.categories, localCategories)),
    [initialShoppingList.categories, localCategories]
  )

  useEffect(() => {
    setCheckedItems(readCheckedShoppingItems(weekStartDate))
  }, [weekStartDate])

  useEffect(() => {
    function syncStorePreference() {
      setFavoriteStore(getStoreById(readFavoriteStoreId()))
    }

    syncStorePreference()
    window.addEventListener(STORE_PREFERENCE_UPDATED_EVENT, syncStorePreference)
    window.addEventListener('storage', syncStorePreference)
    return () => {
      window.removeEventListener(STORE_PREFERENCE_UPDATED_EVENT, syncStorePreference)
      window.removeEventListener('storage', syncStorePreference)
    }
  }, [])

  const activeCategories = useMemo(
    () =>
      categories
        .map(([category, items]) => [
          category,
          items.filter((item) => !checkedItems.has(shoppingItemKey(category, item))),
        ] as const)
        .filter(([, items]) => items.length > 0),
    [categories, checkedItems]
  )

  const copyText = activeCategories
    .map(([category, items]) => {
      const lines = items
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .map((item) => `- ${item.name}: ${formatQuantity(item.quantity)} ${item.unit}`)
      return [category.toUpperCase(), ...lines].join('\n')
    })
    .join('\n\n')

  const totalItems = categories.reduce((sum, [, items]) => sum + items.length, 0)
  const activeItems = activeCategories.reduce((sum, [, items]) => sum + items.length, 0)
  const checkedCount = totalItems - activeItems

  function toggleCheckedItem(category: string, item: ShoppingItem) {
    const key = shoppingItemKey(category, item)
    setCheckedItems((current) => {
      const next = new Set(current)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      writeCheckedShoppingItems(weekStartDate, next)
      return next
    })
  }

  async function sendToStore(store: string) {
    if (!copyText) return
    await navigator.clipboard.writeText(copyText)
    setStoreFeedback(store)
    window.setTimeout(() => setStoreFeedback(null), 1800)
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div className="px-8 pt-8 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="eyebrow mb-2">Liste de courses</div>
        <h1 className="serif" style={{ fontSize: 34, color: 'var(--ink)' }}>Semaine en cours</h1>
      </div>

      {categories.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <h2 className="serif mb-3" style={{ fontSize: 24, color: 'var(--ink)' }}>Ta liste est vide</h2>
          <p className="mb-6" style={{ fontSize: 14, color: 'var(--muted)' }}>
            Ajoute des repas dans le planning pour voir les quantités apparaître ici.
          </p>
          <Link href="/my-week" className="btn-primary">Planifier la semaine</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', flex: 1 }}>
          <div style={{ padding: '28px 32px', borderRight: '1px solid var(--border)', overflow: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {categories.map(([category, items]) => (
                <div key={category}>
                  <div
                    style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 12 }}
                  >
                    {category}
                  </div>
                  {items
                    .toSorted((a, b) => a.name.localeCompare(b.name))
                    .map((item) => {
                      const itemKey = shoppingItemKey(category, item)
                      const checked = checkedItems.has(itemKey)

                      return (
                        <label
                          key={itemKey}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 0',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            opacity: checked ? 0.48 : 1,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCheckedItem(category, item)}
                              style={{ width: 16, height: 16, accentColor: 'var(--green)', flexShrink: 0, cursor: 'pointer' }}
                            />
                            <span
                              style={{
                                fontSize: 14,
                                color: checked ? 'var(--muted)' : 'var(--ink)',
                                fontWeight: 500,
                                textDecoration: checked ? 'line-through' : 'none',
                                textDecorationThickness: checked ? 2 : undefined,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {item.name}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              color: 'var(--muted)',
                              fontWeight: 600,
                              marginLeft: 8,
                              textDecoration: checked ? 'line-through' : 'none',
                            }}
                          >
                            {formatQuantity(item.quantity)} {item.unit}
                          </span>
                        </label>
                      )
                    })}
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
            <div className="serif" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 20 }}>
              {activeItems} article{activeItems > 1 ? 's' : ''} · {initialShoppingList.householdSize} pers.
            </div>
            {checkedCount > 0 && (
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginTop: -12, marginBottom: 16 }}>
                {checkedCount} déjà coché{checkedCount > 1 ? 's' : ''}, exclu{checkedCount > 1 ? 's' : ''} de la copie et des paniers.
              </div>
            )}

            <div style={{ background: 'var(--ink)', padding: '18px', marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--peach)', textTransform: 'uppercase', marginBottom: 6 }}>
                Services disponibles
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.64)', lineHeight: 1.45, marginBottom: 12 }}>
                Freadg peut préparer ta liste pour livraison ou click & collect selon les magasins disponibles.
              </div>

              {favoriteStore ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => sendToStore(favoriteStore.name)}
                    disabled={!copyText}
                    style={{
                      border: 'none',
                      background: 'rgba(255,255,255,0.08)',
                      padding: '13px 14px',
                      color: '#fff',
                      cursor: copyText ? 'pointer' : 'not-allowed',
                      borderRadius: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: 8,
                      textAlign: 'left',
                      opacity: copyText ? 1 : 0.45,
                    }}
                  >
                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 800 }}>{storeFeedback === favoriteStore.name ? 'Liste prête' : favoriteStore.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--peach)' }}>→</span>
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.35 }}>
                      {favoriteStore.services.join(' · ')}
                    </span>
                  </button>
                  <Link href="/shopping-list/stores" className="btn-secondary" style={{ background: 'white', padding: '10px 12px', fontSize: 12 }}>
                    Choisir un autre magasin
                  </Link>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {GROCERY_STORES.map((store) => (
                      <span key={store.id} style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '5px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        {store.name}
                      </span>
                    ))}
                  </div>
                  <Link href="/shopping-list/stores" className="btn-primary" style={{ width: '100%', fontSize: 13 }}>
                    Choisir mes magasins
                  </Link>
                </>
              )}
            </div>

            {copyText && (
              <div className="mb-2">
                <CopyShoppingListButton text={copyText} />
              </div>
            )}

            <Link href="/my-week" className="btn-secondary" style={{ textAlign: 'center', justifyContent: 'center' }}>
              ← Retour au planning
            </Link>

            <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                Quantités ajustées pour <strong>{initialShoppingList.householdSize} personne{initialShoppingList.householdSize > 1 ? 's' : ''}</strong>. Modifier dans les préférences.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function shoppingItemKey(category: string, item: ShoppingItem) {
  return `${category.toLowerCase()}::${item.name.toLowerCase()}::${item.unit.toLowerCase()}`
}

function checkedStorageKey(weekStartDate: string) {
  return `fridge:shopping-list:checked:${weekStartDate}`
}

function readCheckedShoppingItems(weekStartDate: string) {
  if (typeof window === 'undefined') return new Set<string>()

  const rawValue = window.localStorage.getItem(checkedStorageKey(weekStartDate))
  if (!rawValue) return new Set<string>()

  try {
    const parsed = JSON.parse(rawValue)
    return new Set(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [])
  } catch {
    return new Set<string>()
  }
}

function writeCheckedShoppingItems(weekStartDate: string, checkedItems: Set<string>) {
  window.localStorage.setItem(checkedStorageKey(weekStartDate), JSON.stringify(Array.from(checkedItems)))
}

function buildLocalShoppingCategories(weekStartDate: string, householdSize: number) {
  const categories: ShoppingCategories = {}
  const localMeals = readLocalMealPlan(weekStartDate)

  for (const plannedMeal of localMeals) {
    const recipe = CATALOG_RECIPES.find((item) => item.id === plannedMeal.recipe.id) ?? recipeWithIngredients(plannedMeal.recipe)
    if (!recipe) continue

    const scale = householdSize / recipe.servings_base
    for (const ingredient of recipe.ingredients) {
      addIngredient(categories, ingredient, scale)
    }
  }

  return categories
}

function mergeCategories(...categorySets: ShoppingCategories[]) {
  const merged: ShoppingCategories = {}

  for (const categories of categorySets) {
    for (const [category, items] of Object.entries(categories)) {
      for (const item of items) {
        addItem(merged, category, item)
      }
    }
  }

  return merged
}

function addIngredient(categories: ShoppingCategories, ingredient: Ingredient, scale: number) {
  addItem(categories, ingredient.grocery_category, {
    name: ingredient.name,
    quantity: ingredient.quantity * scale,
    unit: ingredient.unit,
  })
}

function addItem(categories: ShoppingCategories, category: string, item: ShoppingItem) {
  categories[category] ??= []
  const existing = categories[category].find(
    (candidate) => candidate.name.toLowerCase() === item.name.toLowerCase() && candidate.unit.toLowerCase() === item.unit.toLowerCase()
  )

  if (existing) {
    existing.quantity += item.quantity
  } else {
    categories[category].push({ ...item })
  }
}

function recipeWithIngredients(recipe: unknown): RecipeWithIngredients | null {
  if (!recipe || typeof recipe !== 'object') return null
  const candidate = recipe as Partial<RecipeWithIngredients>
  return Array.isArray(candidate.ingredients) ? candidate as RecipeWithIngredients : null
}
