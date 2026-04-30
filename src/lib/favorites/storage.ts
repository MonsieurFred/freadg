export const FAVORITES_STORAGE_KEY = 'fridge:favorites'

export function readFavoriteIds() {
  if (typeof window === 'undefined') {
    return []
  }

  const rawValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  } catch {
    return []
  }
}

export function writeFavoriteIds(ids: string[]) {
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))))
  window.dispatchEvent(new Event('fridge:favorites-updated'))
}
