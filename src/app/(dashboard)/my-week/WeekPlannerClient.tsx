'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { type MealPlanWithRecipe } from '@/lib/recipes/queries'
import { type Recipe } from '@/types/database'
import { formatTag } from '@/lib/recipes/labels'
import { getRecipeImageUrl } from '@/lib/recipes/images'
import { MEAL_PLAN_UPDATED_EVENT, readLocalMealPlan, removeLocalMeal, writeLocalMealPlan } from '@/lib/meal-plan/storage'

type MealType = 'lunch' | 'dinner'
type SlotKey = `${number}-${MealType}`
type PlannedMeal = { recipe: Recipe; planId: string }

const DAYS = [
  { label: 'Lun', dayOfWeek: 1 },
  { label: 'Mar', dayOfWeek: 2 },
  { label: 'Mer', dayOfWeek: 3 },
  { label: 'Jeu', dayOfWeek: 4 },
  { label: 'Ven', dayOfWeek: 5 },
  { label: 'Sam', dayOfWeek: 6 },
  { label: 'Dim', dayOfWeek: 7 },
]

const MEAL_LABELS: Record<MealType, string> = { lunch: 'Midi', dinner: 'Soir' }

function buildPlan(plans: MealPlanWithRecipe[]): Map<SlotKey, PlannedMeal> {
  const map = new Map<SlotKey, PlannedMeal>()
  for (const p of plans) {
    if (p.recipes) {
      map.set(`${p.day_of_week}-${p.meal_type}` as SlotKey, { recipe: p.recipes, planId: p.id })
    }
  }
  return map
}

function buildLocalPlan(weekStartDate: string): Map<SlotKey, PlannedMeal> {
  const map = new Map<SlotKey, PlannedMeal>()
  for (const meal of readLocalMealPlan(weekStartDate)) {
    map.set(`${meal.dayOfWeek}-${meal.mealType}` as SlotKey, {
      recipe: meal.recipe,
      planId: `local-${meal.dayOfWeek}-${meal.mealType}`,
    })
  }
  return map
}

type Props = {
  initialPlan: MealPlanWithRecipe[]
  availableRecipes: Recipe[]
  userId: string
  weekStartDate: string
}

export default function WeekPlannerClient({ initialPlan, availableRecipes, userId, weekStartDate }: Props) {
  const [plan, setPlan] = useState<Map<SlotKey, PlannedMeal>>(() => {
    const nextPlan = buildPlan(initialPlan)
    for (const [key, meal] of buildLocalPlan(weekStartDate)) {
      nextPlan.set(key, meal)
    }
    return nextPlan
  })
  const [pickerSlot, setPickerSlot] = useState<{ day: number; mealType: MealType } | null>(null)
  const [pickerSearch, setPickerSearch] = useState('')
  const [draggedSlot, setDraggedSlot] = useState<SlotKey | null>(null)
  const [dropTarget, setDropTarget] = useState<SlotKey | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredRecipes = useMemo(() => {
    if (!pickerSearch.trim()) return availableRecipes
    const q = pickerSearch.toLowerCase()
    return availableRecipes.filter(
      (r) => r.title.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [availableRecipes, pickerSearch])

  const plannedCount = plan.size

  useEffect(() => {
    function syncLocalPlan() {
      const nextPlan = buildPlan(initialPlan)
      for (const [key, meal] of buildLocalPlan(weekStartDate)) {
        nextPlan.set(key, meal)
      }
      setPlan(nextPlan)
    }

    window.addEventListener(MEAL_PLAN_UPDATED_EVENT, syncLocalPlan)
    window.addEventListener('storage', syncLocalPlan)
    return () => {
      window.removeEventListener(MEAL_PLAN_UPDATED_EVENT, syncLocalPlan)
      window.removeEventListener('storage', syncLocalPlan)
    }
  }, [initialPlan, weekStartDate])

  async function addMeal(recipe: Recipe) {
    if (!pickerSlot || loading) return
    const key: SlotKey = `${pickerSlot.day}-${pickerSlot.mealType}`

    if (!userId || isMockRecipe(recipe)) {
      const meals = readLocalMealPlan(weekStartDate).filter(
        (meal) => meal.dayOfWeek !== pickerSlot.day || meal.mealType !== pickerSlot.mealType
      )
      writeLocalMealPlan([...meals, { dayOfWeek: pickerSlot.day, mealType: pickerSlot.mealType, recipe }], weekStartDate)
      setPlan((prev) => new Map(prev).set(key, { recipe, planId: `local-${pickerSlot.day}-${pickerSlot.mealType}` }))
      setError(null)
      setPickerSlot(null)
      setPickerSearch('')
      return
    }

    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('user_meal_plans')
      .insert({
        user_id: userId,
        week_start_date: weekStartDate,
        day_of_week: pickerSlot.day,
        meal_type: pickerSlot.mealType,
        recipe_id: recipe.id,
      })
      .select('id')
      .single()
    if (insertError) {
      setError('Impossible d\'ajouter ce repas. Réessaie.')
    } else if (data) {
      setPlan((prev) => new Map(prev).set(key, { recipe, planId: data.id }))
      setPickerSlot(null)
      setPickerSearch('')
    }
    setLoading(false)
  }

  async function removeMeal(dayOfWeek: number, mealType: MealType) {
    if (loading) return
    const key: SlotKey = `${dayOfWeek}-${mealType}`
    const meal = plan.get(key)
    if (!meal) return
    if (meal.planId.startsWith('local-') || !userId) {
      removeLocalMeal(dayOfWeek, mealType, weekStartDate)
      setPlan((prev) => { const next = new Map(prev); next.delete(key); return next })
      return
    }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('user_meal_plans')
      .delete()
      .eq('id', meal.planId)
    if (deleteError) {
      setError('Impossible de retirer ce repas. Réessaie.')
    } else {
      setPlan((prev) => { const next = new Map(prev); next.delete(key); return next })
    }
    setLoading(false)
  }

  async function moveMeal(targetDay: number, targetMealType: MealType) {
    if (!draggedSlot || loading) return
    const targetKey: SlotKey = `${targetDay}-${targetMealType}`
    const [sourceDay, sourceMealType] = parseSlotKey(draggedSlot)
    if (draggedSlot === targetKey) {
      setDraggedSlot(null)
      setDropTarget(null)
      return
    }

    const sourceMeal = plan.get(draggedSlot)
    if (!sourceMeal) return

    const targetMeal = plan.get(targetKey)
    const nextPlan = new Map(plan)
    nextPlan.set(targetKey, sourceMeal)
    if (targetMeal) {
      nextPlan.set(draggedSlot, targetMeal)
    } else {
      nextPlan.delete(draggedSlot)
    }

    setLoading(true)
    setError(null)
    setPlan(nextPlan)
    setDraggedSlot(null)
    setDropTarget(null)

    try {
      const updatedMeals = await persistMealMove({
        source: { day: sourceDay, mealType: sourceMealType, meal: sourceMeal },
        target: { day: targetDay, mealType: targetMealType, meal: targetMeal ?? null },
      })

      if (updatedMeals) {
        setPlan((prev) => {
          const syncedPlan = new Map(prev)
          syncedPlan.set(targetKey, updatedMeals.sourceAtTarget)
          if (updatedMeals.targetAtSource) {
            syncedPlan.set(draggedSlot, updatedMeals.targetAtSource)
          }
          return syncedPlan
        })
      }
    } catch {
      setPlan(plan)
      setError('Impossible de déplacer ce repas. Réessaie.')
    } finally {
      setLoading(false)
    }
  }

  async function persistMealMove({
    source,
    target,
  }: {
    source: { day: number; mealType: MealType; meal: PlannedMeal }
    target: { day: number; mealType: MealType; meal: PlannedMeal | null }
  }) {
    const localMeals = readLocalMealPlan(weekStartDate).filter((meal) => {
      const isSourceSlot = meal.dayOfWeek === source.day && meal.mealType === source.mealType
      const isTargetSlot = meal.dayOfWeek === target.day && meal.mealType === target.mealType
      return !isSourceSlot && !isTargetSlot
    })

    const movedLocalMeals = [...localMeals]
    if (shouldPersistLocally(source.meal, userId)) {
      movedLocalMeals.push({ dayOfWeek: target.day, mealType: target.mealType, recipe: source.meal.recipe })
    }
    if (target.meal && shouldPersistLocally(target.meal, userId)) {
      movedLocalMeals.push({ dayOfWeek: source.day, mealType: source.mealType, recipe: target.meal.recipe })
    }
    writeLocalMealPlan(movedLocalMeals, weekStartDate)

    if (!userId) return null

    const remoteMeals = [
      { original: source, nextDay: target.day, nextMealType: target.mealType },
      ...(target.meal ? [{ original: target as { day: number; mealType: MealType; meal: PlannedMeal }, nextDay: source.day, nextMealType: source.mealType }] : []),
    ].filter(({ original }) => !shouldPersistLocally(original.meal, userId))

    if (remoteMeals.length === 0) return null

    const supabase = createClient()
    const remoteIds = remoteMeals.map(({ original }) => original.meal.planId)
    const { error: deleteError } = await supabase
      .from('user_meal_plans')
      .delete()
      .in('id', remoteIds)

    if (deleteError) throw deleteError

    const { data, error: insertError } = await supabase
      .from('user_meal_plans')
      .insert(remoteMeals.map(({ original, nextDay, nextMealType }) => ({
        user_id: userId,
        week_start_date: weekStartDate,
        day_of_week: nextDay,
        meal_type: nextMealType,
        recipe_id: original.meal.recipe.id,
      })))
      .select('id, recipe_id')

    if (insertError) throw insertError

    const planWithSyncedIds = new Map<SlotKey, PlannedMeal>()
    for (const { original, nextDay, nextMealType } of remoteMeals) {
      const inserted = data?.find((meal) => meal.recipe_id === original.meal.recipe.id)
      planWithSyncedIds.set(`${nextDay}-${nextMealType}` as SlotKey, {
        recipe: original.meal.recipe,
        planId: inserted?.id ?? original.meal.planId,
      })
    }

    return {
      sourceAtTarget: planWithSyncedIds.get(`${target.day}-${target.mealType}` as SlotKey) ?? source.meal,
      targetAtSource: target.meal
        ? planWithSyncedIds.get(`${source.day}-${source.mealType}` as SlotKey) ?? target.meal
        : null,
    }
  }

  return (
    <>
      {error && (
        <div className="mt-4 px-4 py-3 text-sm font-semibold" style={{ border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', borderRadius: 4 }}>
          {error}
        </div>
      )}

      {plannedCount > 0 && (
        <div className="mt-4 px-4 py-2.5" style={{ background: 'var(--green-pale)', borderRadius: 4, fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
          {plannedCount} repas planifié{plannedCount > 1 ? 's' : ''} cette semaine · La liste de courses se met à jour automatiquement.
        </div>
      )}

      {/* 7-column planning grid with aligned lunch and dinner rows */}
      <div className="mt-6 overflow-x-auto">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(130px, 1fr))', gridTemplateRows: '80px auto auto', gap: 8, minWidth: 910, alignItems: 'stretch' }}>
          {DAYS.map(({ label, dayOfWeek }) => (
            <div key={dayOfWeek} style={{ padding: '10px', background: 'var(--ink)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="serif" style={{ fontSize: 13, color: '#fff' }}>{label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginTop: 1 }}>
                {String(dayOfWeek).padStart(2, '0')}
              </div>
            </div>
          ))}

          {(['lunch', 'dinner'] as MealType[]).flatMap((mealType) => (
            DAYS.map(({ dayOfWeek }) => {
              const key: SlotKey = `${dayOfWeek}-${mealType}`
              const meal = plan.get(key)

              if (meal) {
                return (
                  <div
                    key={key}
                    draggable={!loading}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', key)
                      setDraggedSlot(key)
                    }}
                    onDragEnd={() => { setDraggedSlot(null); setDropTarget(null) }}
                    onDragOver={(event) => {
                      event.preventDefault()
                      event.dataTransfer.dropEffect = 'move'
                      setDropTarget(key)
                    }}
                    onDragLeave={() => setDropTarget((current) => current === key ? null : current)}
                    onDrop={(event) => { event.preventDefault(); moveMeal(dayOfWeek, mealType) }}
                    style={{
                      border: dropTarget === key ? '2px solid var(--green)' : '1px solid var(--border)',
                      background: 'white',
                      overflow: 'hidden',
                      borderRadius: 4,
                      minHeight: 150,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: loading ? 'default' : 'grab',
                      opacity: draggedSlot === key ? 0.58 : 1,
                      boxShadow: dropTarget === key ? '0 0 0 3px rgba(15, 122, 74, 0.12)' : 'none',
                      transition: 'border 0.12s, box-shadow 0.12s, opacity 0.12s',
                    }}
                  >
                    <Link
                      href={`/recipes/${meal.recipe.id}`}
                      style={{ display: 'flex', flex: 1, flexDirection: 'column', color: 'inherit', textDecoration: 'none' }}
                    >
                      <div
                        style={{ height: 68, flexShrink: 0, backgroundImage: `url(${getRecipeImageUrl(meal.recipe.title, meal.recipe.photo_url)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      />
                      <div style={{ padding: '8px 8px 4px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
                          {MEAL_LABELS[mealType]}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 4 }}>
                          {meal.recipe.title}
                        </div>
                      </div>
                    </Link>
                    <div style={{ padding: '4px 8px 8px' }}>
                      <button
                        onClick={() => removeMeal(dayOfWeek, mealType)}
                        onMouseDown={(event) => event.stopPropagation()}
                        disabled={loading}
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#dc2626',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: 4,
                          cursor: 'pointer',
                          padding: '7px 10px',
                          minHeight: 34,
                          width: '100%',
                          textAlign: 'center',
                        }}
                      >
                        Retirer ×
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <button
                  key={key}
                  onClick={() => { setPickerSlot({ day: dayOfWeek, mealType }); setPickerSearch('') }}
                  onDragOver={(event) => {
                    if (!draggedSlot) return
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                    setDropTarget(key)
                  }}
                  onDragLeave={() => setDropTarget((current) => current === key ? null : current)}
                  onDrop={(event) => { event.preventDefault(); moveMeal(dayOfWeek, mealType) }}
                  disabled={loading}
                  style={{
                    border: dropTarget === key ? '2px solid var(--green)' : '1px solid var(--border)',
                    background: dropTarget === key ? 'var(--green-pale)' : 'transparent',
                    borderRadius: 4,
                    minHeight: 150,
                    height: '100%',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'background 0.1s, border 0.12s',
                  }}
                  className="hover:bg-white"
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {MEAL_LABELS[mealType]}
                  </div>
                  <div style={{ fontSize: 18, color: 'var(--border)', lineHeight: 1 }}>+</div>
                </button>
              )
            })
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-3 flex-wrap">
        <Link href="/recipes" className="btn-secondary">Parcourir le catalogue</Link>
        <Link href="/shopping-list" className="btn-primary">Voir la liste de courses</Link>
      </div>

      {/* Recipe picker modal */}
      {pickerSlot && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => { setPickerSlot(null); setPickerSearch('') }}
        >
          <div
            className="w-full max-w-lg overflow-hidden bg-white"
            style={{ borderRadius: 4, boxShadow: '0 30px 80px rgba(23,33,27,0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="eyebrow mb-1">
                    {DAYS.find((d) => d.dayOfWeek === pickerSlot.day)?.label} · {MEAL_LABELS[pickerSlot.mealType]}
                  </div>
                  <h2 className="serif" style={{ fontSize: 22, color: 'var(--ink)' }}>Choisir un repas</h2>
                </div>
                <button
                  onClick={() => { setPickerSlot(null); setPickerSearch('') }}
                  style={{ width: 32, height: 32, background: 'var(--sand)', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--muted)', borderRadius: 4 }}
                >×</button>
              </div>
              <input
                type="search"
                autoFocus
                placeholder="Rechercher une recette…"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="input"
              />
            </div>
            <div className="p-3 space-y-1" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {filteredRecipes.length === 0 ? (
                <p className="p-6 text-center" style={{ fontSize: 14, color: 'var(--muted)' }}>Aucune recette trouvée.</p>
              ) : (
                filteredRecipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => addMeal(recipe)}
                    disabled={loading}
                    className="flex w-full gap-3 p-3 text-left transition hover:bg-[var(--green-pale)] disabled:opacity-60"
                    style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer' }}
                  >
                    <div
                      style={{ width: 52, height: 52, flexShrink: 0, backgroundImage: `url(${getRecipeImageUrl(recipe.title, recipe.photo_url)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                    <div className="min-w-0">
                      <p style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14 }} className="truncate">{recipe.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                        {recipe.prep_time_minutes} min{recipe.calories ? ` · ${recipe.calories} kcal` : ''}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {recipe.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="tag-green">{formatTag(tag)}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function parseSlotKey(slotKey: SlotKey): [number, MealType] {
  const [day, mealType] = slotKey.split('-')
  return [Number(day), mealType as MealType]
}

function isMockRecipe(recipe: Recipe) {
  return recipe.id.startsWith('mock-')
}

function shouldPersistLocally(meal: PlannedMeal, userId: string) {
  return !userId || meal.planId.startsWith('local-') || isMockRecipe(meal.recipe)
}
