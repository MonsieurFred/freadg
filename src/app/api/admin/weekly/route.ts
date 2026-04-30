import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await request.json()
  const { weekStartDate, recipeIds } = body

  if (!weekStartDate || !Array.isArray(recipeIds)) {
    return NextResponse.json({ error: 'weekStartDate et recipeIds requis' }, { status: 400 })
  }

  if (recipeIds.length > 20) {
    return NextResponse.json({ error: 'Maximum 20 recettes par semaine' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Delete existing selection for this week
  await admin.from('weekly_selection').delete().eq('week_start_date', weekStartDate)

  if (recipeIds.length > 0) {
    const { error } = await admin.from('weekly_selection').insert(
      recipeIds.map((recipe_id: string) => ({ week_start_date: weekStartDate, recipe_id }))
    )

    if (error) {
      console.error('Weekly selection insert error', error)
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, count: recipeIds.length })
}
