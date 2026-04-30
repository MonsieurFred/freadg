import Link from 'next/link'
import { PHOTO_CATALOG_RECIPES } from '@/lib/recipes/mock-data'
import { getRecipeImageUrl } from '@/lib/recipes/images'
import RecipeCard from './RecipeCard'

const TAG_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'vegetarian', label: 'Végétarien' },
  { value: 'gluten_free', label: 'Sans gluten' },
  { value: 'quick', label: 'Rapide' },
  { value: 'family', label: 'Famille' },
]

const SEASON_FILTERS = [
  { value: '', label: 'Toutes saisons' },
  { value: 'spring', label: 'Printemps' },
  { value: 'summer', label: 'Été' },
  { value: 'autumn', label: 'Automne' },
  { value: 'winter', label: 'Hiver' },
]

export default function RecipesPage() {
  const recipes = PHOTO_CATALOG_RECIPES.map((recipe) => ({
    ...recipe,
    photo_url: getRecipeImageUrl(recipe.title, recipe.photo_url),
  }))

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div className="px-8 pt-8 pb-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex justify-between items-end mb-5">
          <div>
            <div className="eyebrow mb-2">Catalogue</div>
            <h1 className="serif" style={{ fontSize: 34, color: 'var(--ink)' }}>Toutes les recettes</h1>
          </div>
          <div className="flex items-center gap-2">
            <form className="flex items-center gap-2">
              <input
                type="search"
                name="q"
                placeholder="Rechercher une recette…"
                className="input"
                style={{ width: 220 }}
              />
              <button type="submit" className="btn-primary" style={{ fontSize: 13, padding: '10px 18px' }}>
                Filtrer
              </button>
            </form>
          </div>
        </div>

        {/* Filter chips row */}
        <div className="flex items-center gap-6 pb-4 overflow-x-auto">
          {/* Tag chips */}
          <div className="flex gap-2">
            {TAG_FILTERS.map((f) => {
              const active = f.value === ''
              const params = new URLSearchParams()
              if (f.value) params.set('tag', f.value)
              return (
                <Link
                  key={f.value || 'all-tags'}
                  href={`/recipes?${params.toString()}`}
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    background: active ? 'var(--ink)' : 'white',
                    color: active ? '#fff' : 'var(--muted)',
                    border: `1px solid ${active ? 'var(--ink)' : 'var(--border)'}`,
                    borderRadius: 4,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f.label}
                </Link>
              )
            })}
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--border)', flexShrink: 0 }} />

          {/* Season chips */}
          <div className="flex gap-2">
            {SEASON_FILTERS.map((f) => {
              const active = f.value === ''
              const params = new URLSearchParams()
              if (f.value) params.set('season', f.value)
              return (
                <Link
                  key={f.value || 'all-seasons'}
                  href={`/recipes?${params.toString()}`}
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    background: active ? 'var(--green)' : 'white',
                    color: active ? '#fff' : 'var(--muted)',
                    border: `1px solid ${active ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: 4,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f.label}
                </Link>
              )
            })}
          </div>

          <div className="ml-auto shrink-0" style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
            {recipes.length} recette{recipes.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="p-8">
        {recipes.length === 0 ? (
          <div className="card p-10 text-center" style={{ borderStyle: 'dashed' }}>
            <h2 className="serif mb-2" style={{ fontSize: 20, color: 'var(--ink)' }}>Aucune recette trouvée</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)' }}>
              Ajoutez le seed Supabase ou élargissez les filtres pour remplir ce catalogue.
            </p>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
