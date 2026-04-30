import Link from 'next/link'
import { getRecipes } from '@/lib/recipes/queries'
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

type RecipesPageProps = {
  searchParams: Promise<{
    q?: string
    tag?: string
    season?: string
    maxTime?: string
    maxCalories?: string
    sort?: string
  }>
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const sp = await searchParams
  const maxTime = sp.maxTime ? Number(sp.maxTime) : undefined
  const maxCalories = sp.maxCalories ? Number(sp.maxCalories) : undefined
  const recipes = await getRecipes({
    search: sp.q,
    tag: sp.tag,
    season: sp.season,
    maxTime: Number.isFinite(maxTime) ? maxTime : undefined,
    maxCalories: Number.isFinite(maxCalories) ? maxCalories : undefined,
    sort: sp.sort,
  })

  const hasFilters = Boolean(sp.q || sp.tag || sp.season || sp.maxTime || sp.maxCalories)

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
                defaultValue={sp.q}
                placeholder="Rechercher une recette…"
                className="input"
                style={{ width: 220 }}
              />
              <button type="submit" className="btn-primary" style={{ fontSize: 13, padding: '10px 18px' }}>
                Filtrer
              </button>
              {hasFilters && (
                <Link href="/recipes" className="btn-secondary" style={{ fontSize: 13, padding: '10px 16px' }}>
                  Reset
                </Link>
              )}
            </form>
          </div>
        </div>

        {/* Filter chips row */}
        <div className="flex items-center gap-6 pb-4 overflow-x-auto">
          {/* Tag chips */}
          <div className="flex gap-2">
            {TAG_FILTERS.map((f) => {
              const active = f.value === '' ? !sp.tag : sp.tag === f.value
              const params = new URLSearchParams()
              if (sp.q) params.set('q', sp.q)
              if (f.value) params.set('tag', f.value)
              if (sp.season) params.set('season', sp.season)
              if (sp.maxTime) params.set('maxTime', sp.maxTime)
              if (sp.maxCalories) params.set('maxCalories', sp.maxCalories)
              if (sp.sort) params.set('sort', sp.sort)
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
              const active = f.value === '' ? !sp.season : sp.season === f.value
              const params = new URLSearchParams()
              if (sp.q) params.set('q', sp.q)
              if (sp.tag) params.set('tag', sp.tag)
              if (f.value) params.set('season', f.value)
              if (sp.maxTime) params.set('maxTime', sp.maxTime)
              if (sp.maxCalories) params.set('maxCalories', sp.maxCalories)
              if (sp.sort) params.set('sort', sp.sort)
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
