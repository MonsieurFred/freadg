'use client'

import { useEffect, useState } from 'react'
import { readFavoriteIds, writeFavoriteIds } from '@/lib/favorites/storage'
import { createClient } from '@/lib/supabase/client'

export default function FavoriteButton({
  recipeId,
  compact = false,
}: {
  recipeId: string
  compact?: boolean
}) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsFavorite(readFavoriteIds().includes(recipeId))

    if (recipeId.startsWith('mock-')) return

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .maybeSingle()
        .then(({ data }) => setIsFavorite(!!data))
    })
  }, [recipeId])

  async function toggleFavorite() {
    if (loading) return
    setLoading(true)

    const favoriteIds = readFavoriteIds()
    const nextFavoriteIds = isFavorite
      ? favoriteIds.filter((id) => id !== recipeId)
      : [...favoriteIds, recipeId]
    writeFavoriteIds(nextFavoriteIds)
    setIsFavorite(!isFavorite)

    if (!userId || recipeId.startsWith('mock-')) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    if (isFavorite) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
      if (error) {
        writeFavoriteIds(favoriteIds)
        setIsFavorite(true)
      }
    } else {
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, recipe_id: recipeId })
      if (error) {
        writeFavoriteIds(favoriteIds)
        setIsFavorite(false)
      }
    }
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={loading}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      style={{
        padding: compact ? '8px 13px' : '10px 18px',
        fontSize: compact ? 13 : 14,
        fontWeight: 800,
        borderRadius: 5,
        border: '1px solid #fca5a5',
        background: isFavorite ? '#fef2f2' : 'rgba(255,255,255,0.94)',
        color: '#dc2626',
        cursor: 'pointer',
        boxShadow: compact ? '0 8px 22px rgba(23,33,27,0.12)' : 'none',
        transition: 'all 0.12s',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? '…' : isFavorite ? '♥ Favori' : '♡ Favori'}
    </button>
  )
}
