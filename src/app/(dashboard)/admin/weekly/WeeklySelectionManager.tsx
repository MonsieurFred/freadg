'use client'

import { useMemo, useState } from 'react'
import { type Recipe } from '@/types/database'
import { formatSeason, formatTag } from '@/lib/recipes/labels'

function SaveButton({ weekStart, selectedIds }: { weekStart: string; selectedIds: string[] }) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function save() {
    setStatus('saving')
    const res = await fetch('/api/admin/weekly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekStartDate: weekStart, recipeIds: selectedIds }),
    })
    setStatus(res.ok ? 'saved' : 'error')
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <button
      onClick={save}
      disabled={status === 'saving'}
      className="mt-6 w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
    >
      {status === 'saving' && 'Enregistrement…'}
      {status === 'saved' && '✓ Sélection enregistrée'}
      {status === 'error' && 'Erreur — réessayer'}
      {status === 'idle' && 'Enregistrer la sélection'}
    </button>
  )
}

export default function WeeklySelectionManager({ recipes }: { recipes: Recipe[] }) {
  const defaultIds = recipes.slice(0, 8).map((recipe) => recipe.id)
  const [selectedIds, setSelectedIds] = useState(defaultIds)
  const [weekStart, setWeekStart] = useState(getMondayDate())
  const selectedRecipes = useMemo(
    () => recipes.filter((recipe) => selectedIds.includes(recipe.id)),
    [recipes, selectedIds]
  )

  function toggleRecipe(recipeId: string) {
    setSelectedIds((current) =>
      current.includes(recipeId)
        ? current.filter((id) => id !== recipeId)
        : current.length >= 20
        ? current
        : [...current, recipeId]
    )
  }

  return (
    <div className="px-8 py-8">
      <p className="text-sm font-medium text-green-700">Back-office</p>
      <h1 className="mt-1 text-3xl font-bold text-gray-950">Sélection de la semaine</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-500">
        Choisissez jusqu’à 20 recettes à mettre en avant. Cette version prépare l’interface avant persistance Supabase.
      </p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <label>
              <span className="mb-1 block text-sm font-medium text-gray-700">Semaine du</span>
              <input type="date" value={weekStart} onChange={(event) => setWeekStart(event.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <p className="text-sm text-gray-500">{selectedIds.length}/20 recettes sélectionnées</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {recipes.map((recipe) => {
              const selected = selectedIds.includes(recipe.id)

              return (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => toggleRecipe(recipe.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    selected ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white hover:border-green-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold text-gray-950">{recipe.title}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${selected ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {selected ? 'OK' : '+'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{recipe.prep_time_minutes} min · {recipe.calories ?? 'N/A'} kcal</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recipe.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-white px-2 py-0.5 text-xs text-green-700">
                        {formatTag(tag)}
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <aside className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-950">Aperçu éditorial</h2>
          <p className="mt-1 text-sm text-gray-500">Semaine du {weekStart}</p>
          <ol className="mt-5 space-y-3">
            {selectedRecipes.map((recipe, index) => (
              <li key={recipe.id} className="rounded-md bg-gray-50 p-3 text-sm">
                <div className="flex gap-3">
                  <span className="font-bold text-green-700">{index + 1}</span>
                  <div>
                    <p className="font-semibold text-gray-950">{recipe.title}</p>
                    <p className="mt-1 text-gray-500">{recipe.season.map(formatSeason).join(', ')}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <SaveButton weekStart={weekStart} selectedIds={selectedIds} />
        </aside>
      </div>
    </div>
  )
}

function getMondayDate() {
  const today = new Date()
  const monday = new Date(today)
  const diff = today.getDay() === 0 ? -6 : 1 - today.getDay()
  monday.setDate(today.getDate() + diff)
  return monday.toISOString().slice(0, 10)
}
