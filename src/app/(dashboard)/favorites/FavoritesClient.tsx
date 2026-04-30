'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { readFavoriteIds } from '@/lib/favorites/storage'
import { CATALOG_RECIPES } from '@/lib/recipes/mock-data'
import { type Recipe } from '@/types/database'
import RecipeCard from '../recipes/RecipeCard'

export default function FavoritesClient({ recipes }: { recipes: Recipe[] }) {
  const [tag, setTag] = useState('')
  const [maxTime, setMaxTime] = useState('')
  const [localFavoriteIds, setLocalFavoriteIds] = useState<string[]>([])

  useEffect(() => {
    function syncFavorites() {
      setLocalFavoriteIds(readFavoriteIds())
    }

    syncFavorites()
    window.addEventListener('fridge:favorites-updated', syncFavorites)
    window.addEventListener('storage', syncFavorites)
    return () => {
      window.removeEventListener('fridge:favorites-updated', syncFavorites)
      window.removeEventListener('storage', syncFavorites)
    }
  }, [])

  const allRecipes = useMemo(() => {
    const merged = new Map<string, Recipe>()

    for (const recipe of recipes) {
      merged.set(recipe.id, recipe)
    }

    for (const favoriteId of localFavoriteIds) {
      const recipe = CATALOG_RECIPES.find((item) => item.id === favoriteId)
      if (recipe) merged.set(recipe.id, recipe)
    }

    return Array.from(merged.values())
  }, [localFavoriteIds, recipes])

  const filtered = useMemo(
    () =>
      allRecipes.filter((recipe) => {
        const matchesTag = tag ? recipe.tags.includes(tag) : true
        const matchesTime = maxTime ? recipe.prep_time_minutes <= Number(maxTime) : true
        return matchesTag && matchesTime
      }),
    [allRecipes, maxTime, tag]
  )

  return (
    <>
      {/* Filter chips */}
      <div className="mt-5 flex items-center gap-2 flex-wrap">
        {[
          { value: '', label: 'Tous' },
          { value: 'vegetarian', label: 'Végétarien' },
          { value: 'gluten_free', label: 'Sans gluten' },
          { value: 'quick', label: 'Rapide' },
          { value: 'family', label: 'Famille' },
        ].map((f) => (
          <button
            key={f.value || 'all'}
            onClick={() => setTag(f.value)}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              background: tag === f.value ? 'var(--ink)' : 'white',
              color: tag === f.value ? '#fff' : 'var(--muted)',
              border: `1px solid ${tag === f.value ? 'var(--ink)' : 'var(--border)'}`,
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        {[
          { value: '', label: 'Tout temps' },
          { value: '20', label: '≤ 20 min' },
          { value: '30', label: '≤ 30 min' },
        ].map((f) => (
          <button
            key={f.value || 'all-time'}
            onClick={() => setMaxTime(f.value)}
            style={{
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              background: maxTime === f.value ? 'var(--green)' : 'white',
              color: maxTime === f.value ? '#fff' : 'var(--muted)',
              border: `1px solid ${maxTime === f.value ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}

        <span className="ml-auto" style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
          {filtered.length} favori{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {allRecipes.length === 0 ? (
        <div className="card mt-8 p-10 text-center" style={{ borderStyle: 'dashed' }}>
          <h2 className="serif mb-2" style={{ fontSize: 22, color: 'var(--ink)' }}>Aucun favori pour l&apos;instant</h2>
          <p className="mb-6" style={{ fontSize: 14, color: 'var(--muted)' }}>
            Ajoute des recettes avec le bouton cœur pour les retrouver ici.
          </p>
          <Link href="/recipes" className="btn-primary">Explorer les recettes</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card mt-8 p-10 text-center" style={{ borderStyle: 'dashed' }}>
          <h2 className="serif mb-2" style={{ fontSize: 20, color: 'var(--ink)' }}>Aucun résultat pour ces filtres</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>Élargissez les critères pour retrouver vos recettes.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </>
  )
}
