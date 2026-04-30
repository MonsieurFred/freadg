'use client'

import { useMemo, useState } from 'react'
import { type Recipe } from '@/types/database'
import { formatSeason, formatTag } from '@/lib/recipes/labels'

type EditableIngredient = {
  name: string
  quantity: string
  unit: string
  grocery_category: string
}

const TAG_OPTIONS = ['vegetarian', 'vegan', 'gluten_free', 'quick', 'family', 'light', 'high_protein', 'batch_cooking']
const SEASON_OPTIONS = ['spring', 'summer', 'autumn', 'winter']

export default function AdminRecipeManager({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const [recipes, setRecipes] = useState(initialRecipes)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [prepTime, setPrepTime] = useState(30)
  const [servingsBase, setServingsBase] = useState(4)
  const [tags, setTags] = useState<string[]>(['family'])
  const [seasons, setSeasons] = useState<string[]>(['spring'])
  const [steps, setSteps] = useState('Préparer les ingrédients.\nCuire la recette.\nDresser et servir.')
  const [ingredients, setIngredients] = useState<EditableIngredient[]>([
    { name: 'Ingredient principal', quantity: '400', unit: 'g', grocery_category: 'epicerie' },
  ])
  const [savedMessage, setSavedMessage] = useState('')

  const nutrition = useMemo(() => {
    const totalQuantity = ingredients.reduce((sum, ingredient) => sum + Number(ingredient.quantity || 0), 0)
    return {
      calories: Math.max(320, Math.round(totalQuantity * 0.9)),
      proteins_g: Math.max(12, Math.round(totalQuantity * 0.04)),
      carbs_g: Math.max(20, Math.round(totalQuantity * 0.1)),
      fats_g: Math.max(8, Math.round(totalQuantity * 0.03)),
    }
  }, [ingredients])

  function toggleValue(value: string, values: string[], setter: (next: string[]) => void) {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  }

  function addIngredient() {
    setIngredients((current) => [...current, { name: '', quantity: '', unit: 'g', grocery_category: 'epicerie' }])
  }

  function updateIngredient(index: number, field: keyof EditableIngredient, value: string) {
    setIngredients((current) =>
      current.map((ingredient, ingredientIndex) =>
        ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient
      )
    )
  }

  async function submitRecipe(event: React.FormEvent) {
    event.preventDefault()
    setSavedMessage('Enregistrement…')

    const res = await fetch('/api/admin/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        prepTime,
        servingsBase,
        tags,
        seasons,
        steps,
        ingredients,
        photoUrl: null,
        ...nutrition,
      }),
    })

    if (res.ok) {
      const { id } = await res.json()
      const now = new Date().toISOString()
      const newRecipe: Recipe = {
        id,
        title,
        description,
        photo_url: null,
        prep_time_minutes: prepTime,
        servings_base: servingsBase,
        tags,
        season: seasons,
        ...nutrition,
        steps: steps
          .split('\n')
          .filter(Boolean)
          .map((instruction, index) => ({ step: index + 1, instruction })),
        is_active: true,
        created_at: now,
      }
      setRecipes((current) => [newRecipe, ...current])
      setTitle('')
      setDescription('')
      setSavedMessage('Recette sauvegardée dans Supabase.')
    } else {
      setSavedMessage('Erreur lors de la sauvegarde.')
    }
  }

  async function toggleActive(recipeId: string) {
    const recipe = recipes.find((r) => r.id === recipeId)
    if (!recipe) return
    const newStatus = !recipe.is_active
    setRecipes((current) =>
      current.map((r) => (r.id === recipeId ? { ...r, is_active: newStatus } : r))
    )
    await fetch('/api/admin/recipes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: recipeId, is_active: newStatus }),
    })
  }

  return (
    <div className="px-8 py-8">
      <p className="text-sm font-medium text-green-700">Back-office</p>
      <h1 className="mt-1 text-3xl font-bold text-gray-950">Gestion des recettes</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-500">
        Formulaire éditorial pour les chefs: informations, ingrédients, étapes, tags, saisons et estimation nutritionnelle.
      </p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <form onSubmit={submitRecipe} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm font-medium text-gray-700">Nom</span>
              <input required value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium text-gray-700">Temps de préparation</span>
              <input type="number" value={prepTime} onChange={(event) => setPrepTime(Number(event.target.value))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium text-gray-700">Portions de base</span>
              <input type="number" value={servingsBase} onChange={(event) => setServingsBase(Number(event.target.value))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </label>
            <label>
              <span className="mb-1 block text-sm font-medium text-gray-700">Photo</span>
              <input placeholder="URL à brancher plus tard" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </label>
          </div>

          <label>
            <span className="mb-1 block text-sm font-medium text-gray-700">Description courte</span>
            <textarea required value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700">Ingrédients</span>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_90px_90px_140px]">
                  <input value={ingredient.name} onChange={(event) => updateIngredient(index, 'name', event.target.value)} placeholder="Nom" className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
                  <input value={ingredient.quantity} onChange={(event) => updateIngredient(index, 'quantity', event.target.value)} placeholder="Qté" className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
                  <input value={ingredient.unit} onChange={(event) => updateIngredient(index, 'unit', event.target.value)} placeholder="Unité" className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
                  <input value={ingredient.grocery_category} onChange={(event) => updateIngredient(index, 'grocery_category', event.target.value)} placeholder="Catégorie" className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
            <button type="button" onClick={addIngredient} className="mt-3 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Ajouter un ingrédient
            </button>
          </div>

          <label>
            <span className="mb-1 block text-sm font-medium text-gray-700">Étapes</span>
            <textarea value={steps} onChange={(event) => setSteps(event.target.value)} rows={5} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-gray-700">Tags</legend>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button key={tag} type="button" onClick={() => toggleValue(tag, tags, setTags)} className={`rounded-full border px-3 py-1 text-sm ${tags.includes(tag) ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 text-gray-700'}`}>
                    {formatTag(tag)}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-gray-700">Saisons</legend>
              <div className="flex flex-wrap gap-2">
                {SEASON_OPTIONS.map((season) => (
                  <button key={season} type="button" onClick={() => toggleValue(season, seasons, setSeasons)} className={`rounded-full border px-3 py-1 text-sm ${seasons.includes(season) ? 'border-amber-600 bg-amber-600 text-white' : 'border-gray-300 text-gray-700'}`}>
                    {formatSeason(season)}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">Macros estimées</p>
            <p className="mt-1 text-sm text-gray-500">
              {nutrition.calories} kcal · {nutrition.proteins_g} g protéines · {nutrition.carbs_g} g glucides · {nutrition.fats_g} g lipides
            </p>
          </div>

          {savedMessage && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{savedMessage}</p>}

          <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
            Ajouter la recette
          </button>
        </form>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-950">Catalogue admin</h2>
          <div className="mt-4 space-y-3">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="rounded-md border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-950">{recipe.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{recipe.prep_time_minutes} min · {recipe.calories ?? 'N/A'} kcal</p>
                  </div>
                  <button onClick={() => toggleActive(recipe.id)} className={`rounded-full px-3 py-1 text-xs font-semibold ${recipe.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {recipe.is_active ? 'Actif' : 'Inactif'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
