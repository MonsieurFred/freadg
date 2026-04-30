export type GroceryStoreId = 'delhaize' | 'carrefour' | 'colruyt' | 'cora' | 'efarmz' | 'bio-planet'

export type GroceryStore = {
  id: GroceryStoreId
  name: string
  services: string[]
  note: string
}

export const STORE_PREFERENCE_UPDATED_EVENT = 'fridge:store-preference-updated'
export const FAVORITE_STORE_STORAGE_KEY = 'fridge:favorite-store'
export const SELECTED_STORES_STORAGE_KEY = 'fridge:selected-stores'

export const GROCERY_STORES: GroceryStore[] = [
  {
    id: 'delhaize',
    name: 'Delhaize',
    services: ['Click & collect gratuit', 'Livraison à domicile'],
    note: 'Très répandu partout en Belgique.',
  },
  {
    id: 'carrefour',
    name: 'Carrefour',
    services: ['Click & collect', 'Livraison classique', 'Fast Delivery le jour même'],
    note: 'Pratique quand tu veux une option rapide.',
  },
  {
    id: 'colruyt',
    name: 'Collect&Go (Colruyt)',
    services: ['Click & collect', 'Retrait en magasin'],
    note: 'Souvent intéressant côté prix.',
  },
  {
    id: 'cora',
    name: 'Cora',
    services: ['Livraison via partenaires'],
    note: 'Disponible selon la zone.',
  },
  {
    id: 'efarmz',
    name: 'eFarmz',
    services: ['Produits bio / locaux', 'Livraison à domicile'],
    note: 'Plus premium, très qualitatif.',
  },
  {
    id: 'bio-planet',
    name: 'Bio-Planet',
    services: ['Click & collect possible', 'Offre bio'],
    note: 'Lié au groupe Colruyt.',
  },
]

export function getStoreById(id: string | null) {
  return GROCERY_STORES.find((store) => store.id === id) ?? null
}

export function readFavoriteStoreId() {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(FAVORITE_STORE_STORAGE_KEY)
  return value && getStoreById(value) ? value as GroceryStoreId : null
}

export function writeFavoriteStoreId(storeId: GroceryStoreId | '') {
  if (storeId) {
    window.localStorage.setItem(FAVORITE_STORE_STORAGE_KEY, storeId)
  } else {
    window.localStorage.removeItem(FAVORITE_STORE_STORAGE_KEY)
  }
  window.dispatchEvent(new Event(STORE_PREFERENCE_UPDATED_EVENT))
}

export function readSelectedStoreIds() {
  if (typeof window === 'undefined') return [] as GroceryStoreId[]
  const rawValue = window.localStorage.getItem(SELECTED_STORES_STORAGE_KEY)
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed)
      ? parsed.filter((value): value is GroceryStoreId => typeof value === 'string' && Boolean(getStoreById(value)))
      : []
  } catch {
    return []
  }
}

export function writeSelectedStoreIds(storeIds: GroceryStoreId[]) {
  window.localStorage.setItem(SELECTED_STORES_STORAGE_KEY, JSON.stringify(Array.from(new Set(storeIds))))
  window.dispatchEvent(new Event(STORE_PREFERENCE_UPDATED_EVENT))
}
