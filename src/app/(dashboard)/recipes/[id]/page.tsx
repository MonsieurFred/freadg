import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CATALOG_RECIPES } from '@/lib/recipes/mock-data'
import { formatQuantity, formatSeason, formatTag } from '@/lib/recipes/labels'
import { getRecipeImageUrl } from '@/lib/recipes/images'
import FavoriteButton from '../FavoriteButton'
import AddToWeekButton from '../AddToWeekButton'
import DownloadRecipeButton from './DownloadRecipeButton'

export const dynamicParams = false

type RecipeDetailPageProps = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return CATALOG_RECIPES.map((recipe) => ({
    id: recipe.id,
  }))
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { id } = await params
  const recipe = CATALOG_RECIPES.find((item) => item.id === id)
  const householdSize = 2

  if (!recipe) notFound()

  const scale = householdSize / recipe.servings_base
  const imageUrl = getRecipeImageUrl(recipe.title, recipe.photo_url)

  return (
    <div style={{ fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Hero */}
      <div style={{ height: 260, backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(23,33,27,0.6) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 24, left: 32 }}>
          <Link href="/recipes" style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 10 }}>
            ← Retour aux recettes
          </Link>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {recipe.tags.map((tag) => (
              <span key={tag} style={{ background: 'var(--coral)', color: '#fff', padding: '3px 10px', fontSize: 11, fontWeight: 700, borderRadius: 4 }}>
                {formatTag(tag)}
              </span>
            ))}
            {recipe.season.map((s) => (
              <span key={s} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '3px 10px', fontSize: 11, fontWeight: 700, borderRadius: 4 }}>
                {formatSeason(s)}
              </span>
            ))}
          </div>
          <h1 className="serif" style={{ fontSize: 34, color: '#fff', lineHeight: 1.1 }}>{recipe.title}</h1>
        </div>
      </div>

      {/* Info bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border)', background: 'white', flexShrink: 0 }}>
        {[
          ['Temps', `${recipe.prep_time_minutes} min`],
          ['Calories', recipe.calories ? `${recipe.calories} kcal` : 'N/A'],
          ['Protéines', recipe.proteins_g ? `${formatQuantity(recipe.proteins_g)}g` : 'N/A'],
          ['Saison', recipe.season.map(formatSeason).join(', ') || 'Toutes'],
        ].map(([label, value], i) => (
          <div key={label} style={{ padding: '16px 20px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
            <div className="serif" style={{ fontSize: 20, color: 'var(--ink)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Content: left steps + right ingredients */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, overflow: 'hidden' }}>
        {/* Left: description + steps */}
        <div style={{ overflow: 'auto', borderRight: '1px solid var(--border)', padding: '24px 32px' }}>
          {recipe.description && (
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--muted)', marginBottom: 24 }}>{recipe.description}</p>
          )}

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--green)', textTransform: 'uppercase', marginBottom: 16 }}>
            Préparation
          </div>

          {recipe.steps.map((step, i) => (
            <div
              key={step.step}
              style={{
                display: 'flex',
                gap: 16,
                marginBottom: 16,
                paddingBottom: 16,
                borderBottom: i < recipe.steps.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div className="serif italic" style={{ fontSize: 18, color: 'var(--coral)', flexShrink: 0, width: 24, lineHeight: 1.6 }}>
                {step.step}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink)' }}>{step.instruction}</div>
            </div>
          ))}
        </div>

        {/* Right: ingredients + actions */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--green)', textTransform: 'uppercase', marginBottom: 16 }}>
            Ingrédients · {householdSize} pers.
          </div>

          <div style={{ flex: 1 }}>
            {recipe.ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}
              >
                <div className="serif" style={{ fontSize: 14, color: 'var(--muted)', width: 52, flexShrink: 0 }}>
                  {formatQuantity(ingredient.quantity * scale)} {ingredient.unit}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', flex: 1 }}>{ingredient.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right' }}>{ingredient.grocery_category}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <DownloadRecipeButton recipe={recipe} householdSize={householdSize} imageUrl={imageUrl} />
            <AddToWeekButton recipe={recipe} />
            <FavoriteButton recipeId={recipe.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
