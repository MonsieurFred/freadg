import { NextResponse } from 'next/server'
import { createAdminClient, createClient, isSupabaseAdminConfigured, isSupabaseConfigured } from '@/lib/supabase/server'
import { getWeekStartDate } from '@/lib/dates/week'

const MEAL_TYPES = ['lunch', 'dinner'] as const

async function getPlanningUserId() {
  if (isSupabaseAdminConfigured()) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('users')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (data?.id) return data.id
  }

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

    if (user?.id) return user.id
  }

  return ''
}

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Supabase admin non configuré' }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))
  const recipeId = typeof body.recipeId === 'string' ? body.recipeId : ''
  const weekStartDate = typeof body.weekStartDate === 'string' ? body.weekStartDate : getWeekStartDate()
  const requestedDayOfWeek = Number(body.dayOfWeek)
  const requestedMealType = MEAL_TYPES.find((mealType) => mealType === body.mealType)

  if (!recipeId) {
    return NextResponse.json({ error: 'recipeId requis' }, { status: 400 })
  }

  const userId = await getPlanningUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Aucun compte démo trouvé' }, { status: 404 })
  }

  const admin = createAdminClient()

  const { data: recipe } = await admin
    .from('recipes')
    .select('id')
    .eq('id', recipeId)
    .eq('is_active', true)
    .maybeSingle()

  if (!recipe) {
    return NextResponse.json({ error: 'Recette introuvable' }, { status: 404 })
  }

  const { data: meals, error: readError } = await admin
    .from('user_meal_plans')
    .select('day_of_week, meal_type, recipe_id')
    .eq('user_id', userId)
    .eq('week_start_date', weekStartDate)

  if (readError) {
    console.error('Demo meal plan read error', readError)
    return NextResponse.json({ error: 'Lecture du planning impossible' }, { status: 500 })
  }

  const exactSlotRequested = requestedDayOfWeek >= 1 && requestedDayOfWeek <= 7 && Boolean(requestedMealType)

  if (!exactSlotRequested && meals?.some((meal) => meal.recipe_id === recipeId)) {
    return NextResponse.json({ status: 'already_added' })
  }

  const slots = exactSlotRequested
    ? [{ dayOfWeek: requestedDayOfWeek, mealType: requestedMealType! }]
    : Array.from({ length: 7 }, (_, dayIndex) => MEAL_TYPES.map((mealType) => ({ dayOfWeek: dayIndex + 1, mealType }))).flat()

  for (const { dayOfWeek, mealType } of slots) {
    const occupied = meals?.some((meal) => meal.day_of_week === dayOfWeek && meal.meal_type === mealType)
    if (occupied && !exactSlotRequested) continue

    if (occupied) {
      const { error: deleteSlotError } = await admin
        .from('user_meal_plans')
        .delete()
        .eq('user_id', userId)
        .eq('week_start_date', weekStartDate)
        .eq('day_of_week', dayOfWeek)
        .eq('meal_type', mealType)

      if (deleteSlotError) {
        console.error('Demo meal plan slot delete error', deleteSlotError)
        return NextResponse.json({ error: 'Remplacement impossible' }, { status: 500 })
      }
    }

    const { data, error: insertError } = await admin
      .from('user_meal_plans')
      .insert({
        user_id: userId,
        week_start_date: weekStartDate,
        day_of_week: dayOfWeek,
        meal_type: mealType,
        recipe_id: recipeId,
      })
      .select('id')
      .single()

    if (insertError || !data) {
      console.error('Demo meal plan insert error', insertError)
      return NextResponse.json({ error: 'Ajout impossible' }, { status: 500 })
    }

    return NextResponse.json({ status: 'added', dayOfWeek, mealType, id: data.id })
  }

  return NextResponse.json({ status: 'full' })
}

export async function DELETE(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Supabase admin non configuré' }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))
  const planId = typeof body.planId === 'string' ? body.planId : ''

  if (!planId) {
    return NextResponse.json({ error: 'planId requis' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('user_meal_plans')
    .delete()
    .eq('id', planId)

  if (error) {
    console.error('Demo meal plan delete error', error)
    return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
