import { createClient } from '@/lib/supabase/server'
import { type Recipe } from '@/types/database'
import FavoritesClient from './FavoritesClient'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let favoriteRecipes: Recipe[] = []

  if (user) {
    const { data } = await supabase
      .from('user_favorites')
      .select('recipe:recipes(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    favoriteRecipes = (data ?? [])
      .map((row) => (row.recipe as unknown) as Recipe | null)
      .filter((r): r is Recipe => r !== null)
  }

  return (
    <div className="px-8 py-8 lg:px-10 lg:py-9">
      <div className="eyebrow mb-2">Favoris</div>
      <h1 className="serif" style={{ fontSize: 34, color: 'var(--ink)' }}>Mes recettes favorites</h1>
      <p className="mt-2" style={{ fontSize: 14, color: 'var(--muted)' }}>
        Sauvegarde tes recettes préférées avec le bouton cœur pour les retrouver ici.
      </p>

      <FavoritesClient recipes={favoriteRecipes} />
    </div>
  )
}
