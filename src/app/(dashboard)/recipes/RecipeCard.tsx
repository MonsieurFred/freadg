import Link from 'next/link'
import { type Recipe } from '@/types/database'
import { formatSeason, formatTag } from '@/lib/recipes/labels'
import { getRecipeImageUrl } from '@/lib/recipes/images'
import FavoriteButton from './FavoriteButton'
import AddToWeekButton from './AddToWeekButton'

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const imageUrl = getRecipeImageUrl(recipe.title, recipe.photo_url)

  return (
    <article className="card recipe-hover-card group relative overflow-hidden transition hover:shadow-md" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
      <div className="favorite-hover-action absolute right-3 top-3 z-10">
        <FavoriteButton recipeId={recipe.id} compact />
      </div>
      <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div className="relative overflow-hidden" style={{ height: 140 }}>
          <div
            className="h-full w-full transition duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div
            className="absolute top-2.5 left-2.5"
            style={{ background: 'white', padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'var(--ink)', borderRadius: 4 }}
          >
            {recipe.prep_time_minutes} min
          </div>
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', display: 'flex', flex: 1, flexDirection: 'column' }}>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {recipe.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="tag-green">{formatTag(tag)}</span>
            ))}
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 6 }}>{recipe.title}</h2>
          <p className="line-clamp-2" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--muted)' }}>{recipe.description}</p>
          <div className="flex justify-between items-center mt-auto pt-4" style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
            <span>{recipe.season.map(formatSeason).join(', ')}</span>
            <span>{recipe.calories ?? 'N/A'} kcal</span>
          </div>
        </Link>
        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
          <AddToWeekButton recipe={recipe} />
        </div>
      </div>
    </article>
  )
}
