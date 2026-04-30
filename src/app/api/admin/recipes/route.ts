import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') return null
  return user
}

export async function POST(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json()
  const {
    title,
    description,
    prepTime,
    servingsBase,
    tags,
    seasons,
    steps,
    ingredients,
    photoUrl,
    calories,
    proteins_g,
    carbs_g,
    fats_g,
  } = body

  if (!title || !description) {
    return NextResponse.json({ error: 'Titre et description requis' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: recipe, error: recipeError } = await admin
    .from('recipes')
    .insert({
      title,
      description,
      photo_url: photoUrl || null,
      prep_time_minutes: prepTime,
      servings_base: servingsBase,
      tags,
      season: seasons,
      steps: (steps as string)
        .split('\n')
        .filter(Boolean)
        .map((instruction: string, index: number) => ({ step: index + 1, instruction })),
      calories: calories || null,
      proteins_g: proteins_g || null,
      carbs_g: carbs_g || null,
      fats_g: fats_g || null,
      is_active: true,
    })
    .select('id')
    .single()

  if (recipeError || !recipe) {
    console.error('Recipe insert error', recipeError)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }

  if (ingredients?.length) {
    const { error: ingredientsError } = await admin.from('ingredients').insert(
      ingredients.map((ing: { name: string; quantity: string; unit: string; grocery_category: string }) => ({
        recipe_id: recipe.id,
        name: ing.name,
        quantity: parseFloat(ing.quantity) || 0,
        unit: ing.unit,
        grocery_category: ing.grocery_category || 'autre',
      }))
    )

    if (ingredientsError) {
      console.error('Ingredients insert error', ingredientsError)
    }
  }

  return NextResponse.json({ id: recipe.id }, { status: 201 })
}

export async function PATCH(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await request.json()
  const { id, is_active } = body

  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('recipes')
    .update({ is_active })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
