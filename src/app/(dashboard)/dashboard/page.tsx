import Link from 'next/link'
import { getCurrentWeekRecipes } from '@/lib/recipes/queries'
import { formatSeason, formatTag } from '@/lib/recipes/labels'
import { getRecipeImageUrl } from '@/lib/recipes/images'
import AddToWeekButton from '../recipes/AddToWeekButton'
import FavoriteButton from '../recipes/FavoriteButton'

export default function DashboardPage() {
  return <DashboardContent />
}

async function DashboardContent() {
  const recipes = await getCurrentWeekRecipes()
  const featured = recipes[0]
  const vegetarianRecipes = recipes.filter((recipe) => recipe.tags.includes('vegetarian')).slice(0, 4)
  const glutenFreeRecipes = recipes.filter((recipe) => recipe.tags.includes('gluten_free')).slice(0, 4)
  const quickRecipes = recipes.filter((recipe) => recipe.tags.includes('quick')).slice(0, 4)
  const familyRecipes = recipes.filter((recipe) => recipe.tags.includes('family')).slice(0, 4)

  return (
    <div className="px-8 py-8 lg:px-10 lg:py-9">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="eyebrow mb-2">Cette semaine</div>
          <h1 className="serif" style={{ fontSize: 38, color: 'var(--ink)', letterSpacing: '-0.02em' }}>On mange quoi ?</h1>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--muted)', maxWidth: 520, lineHeight: 1.6 }}>
            Une sélection de repas sains et complets: protéines, légumes, fibres et énergie pour bien manger sans réfléchir.
          </p>
        </div>
        <Link href="/recipes" className="btn-secondary" style={{ fontSize: 13 }}>
          Tout le catalogue →
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="card p-10 text-center mt-4" style={{ borderStyle: 'dashed' }}>
          <h2 className="serif mb-2" style={{ fontSize: 20, color: 'var(--ink)' }}>Aucune sélection disponible</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            Exécutez le seed Supabase ou ajoutez des recettes actives pour afficher la semaine.
          </p>
        </div>
      ) : (
        <>
          {featured && (
            <div
              className="grid mb-4 overflow-hidden"
              style={{ gridTemplateColumns: '1.3fr 0.7fr', background: 'var(--ink)', height: 200 }}
            >
              <div className="flex flex-col justify-between p-7">
                <div>
                  <div className="eyebrow-coral mb-2">Repas complet en avant</div>
                  <h2 className="serif" style={{ fontSize: 26, color: '#fff', lineHeight: 1.15, marginBottom: 6 }}>
                    {featured.title}
                  </h2>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', lineHeight: 1.6 }} className="line-clamp-2">
                    {featured.description} Pensé pour nourrir le corps avec une assiette équilibrée.
                  </p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <span style={{ background: 'rgba(255,255,255,0.12)', padding: '5px 12px', fontSize: 12, fontWeight: 700, color: '#fff', borderRadius: 4 }}>
                    {featured.prep_time_minutes} min
                  </span>
                  {featured.calories && (
                    <span style={{ background: 'rgba(255,255,255,0.12)', padding: '5px 12px', fontSize: 12, fontWeight: 700, color: '#fff', borderRadius: 4 }}>
                      {featured.calories} kcal
                    </span>
                  )}
                  <Link
                    href={`/recipes/${featured.id}`}
                    className="ml-auto"
                    style={{ background: 'var(--coral)', color: '#fff', padding: '8px 16px', fontSize: 12, fontWeight: 700, borderRadius: 4, textDecoration: 'none' }}
                  >
                    Voir la recette
                  </Link>
                  <div style={{ width: 132 }}>
                    <AddToWeekButton recipe={featured} compact />
                  </div>
                </div>
              </div>
              <div
                style={{
                  backgroundImage: `url(${getRecipeImageUrl(featured.title, featured.photo_url)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </div>
          )}

          <div className="mb-3 flex items-center justify-between">
            <div className="eyebrow">Selection de la semaine</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>
              {Math.max(0, recipes.length - 1)} repas sains
            </div>
          </div>

          <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {recipes.slice(1, 21).map((recipe) => (
              <article
                key={recipe.id}
                className="card recipe-hover-card overflow-hidden transition hover:shadow-md"
                style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
              >
                <div className="favorite-hover-action" style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
                  <FavoriteButton recipeId={recipe.id} compact />
                </div>
                <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div
                    style={{
                      height: 90,
                      backgroundImage: `url(${getRecipeImageUrl(recipe.title, recipe.photo_url)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                </Link>
                <div className="p-3" style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                  <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flex: 1, flexDirection: 'column' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 4 }}>
                      {recipe.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
                      {recipe.prep_time_minutes} min
                      {recipe.season.length > 0 && ` · ${recipe.season.map(formatSeason).join(', ')}`}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recipe.tags.slice(0, 1).map((tag) => (
                        <span key={tag} className="tag-green">{formatTag(tag)}</span>
                      ))}
                    </div>
                  </Link>
                  <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                    <AddToWeekButton recipe={recipe} compact />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mb-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="eyebrow mb-1">Bonne nourriture pour le corps</div>
                <h2 className="serif" style={{ fontSize: 24, color: 'var(--ink)', lineHeight: 1.1 }}>
                  Choisis selon ton besoin du jour
                </h2>
              </div>
              <Link href="/recipes" className="btn-secondary" style={{ fontSize: 12, padding: '8px 12px' }}>
                Explorer
              </Link>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
              {[
                {
                  label: 'Vegetarien',
                  title: 'Sans viande',
                  href: '/recipes?tag=vegetarian',
                  recipes: vegetarianRecipes,
                  color: 'rgba(15, 122, 74, 0.82)',
                },
                {
                  label: 'Sans gluten',
                  title: 'Digeste',
                  href: '/recipes?tag=gluten_free',
                  recipes: glutenFreeRecipes,
                  color: 'rgba(23, 33, 27, 0.78)',
                },
                {
                  label: 'Rapide',
                  title: 'Moins de 30 min',
                  href: '/recipes?tag=quick',
                  recipes: quickRecipes,
                  color: 'rgba(255, 111, 78, 0.82)',
                },
                {
                  label: 'Famille',
                  title: 'Pour tous',
                  href: '/recipes?tag=family',
                  recipes: familyRecipes,
                  color: 'rgba(64, 86, 73, 0.82)',
                },
              ].map((item) => {
                const cover = item.recipes[0]

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="transition hover:shadow-md"
                    style={{
                      minHeight: 132,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: 16,
                      overflow: 'hidden',
                      position: 'relative',
                      textDecoration: 'none',
                      background: 'var(--ink)',
                      borderRadius: 4,
                    }}
                  >
                    {cover && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundImage: `url(${getRecipeImageUrl(cover.title, cover.photo_url)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          transform: 'scale(1.02)',
                        }}
                      />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: item.color }} />
                    <div style={{ position: 'relative' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)' }}>
                        {item.label}
                      </div>
                      <div className="serif" style={{ marginTop: 8, fontSize: 25, color: '#fff', lineHeight: 1.05 }}>
                        {item.title}
                      </div>
                    </div>
                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{item.recipes.length} idees</span>
                      <span style={{ fontSize: 18, fontWeight: 700 }}>→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          ['Planning', 'Compose ta semaine', '/my-week'],
          ['Courses', 'Liste générée auto', '/shopping-list'],
          ['Favoris', 'Tes recettes gardées', '/favorites'],
        ].map(([title, copy, href]) => (
          <Link
            key={title}
            href={href}
            className="card transition hover:shadow-sm"
            style={{ padding: '16px 18px', textDecoration: 'none', display: 'block' }}
          >
            <div className="eyebrow mb-1.5">{title}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{copy}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
