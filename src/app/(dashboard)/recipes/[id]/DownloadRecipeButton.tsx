'use client'

import { type RecipeWithIngredients } from '@/types/database'
import { formatQuantity, formatSeason, formatTag } from '@/lib/recipes/labels'

type Props = {
  recipe: RecipeWithIngredients
  householdSize: number
  imageUrl: string
}

export default function DownloadRecipeButton({ recipe, householdSize, imageUrl }: Props) {
  function handleDownload() {
    const printWindow = window.open('', '_blank', 'width=900,height=1100')
    if (!printWindow) return

    const scale = householdSize / recipe.servings_base
    const html = buildRecipePdfHtml(recipe, householdSize, imageUrl, scale)

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="btn-secondary"
      style={{ justifyContent: 'center', gap: 8 }}
    >
      Télécharger la recette
    </button>
  )
}

function buildRecipePdfHtml(recipe: RecipeWithIngredients, householdSize: number, imageUrl: string, scale: number) {
  const ingredients = recipe.ingredients
    .map((ingredient) => `
      <li>
        <span class="qty">${escapeHtml(`${formatQuantity(ingredient.quantity * scale)} ${ingredient.unit}`)}</span>
        <span>${escapeHtml(ingredient.name)}</span>
      </li>
    `)
    .join('')

  const steps = recipe.steps
    .map((step) => `
      <li>
        <span class="step-number">${step.step}</span>
        <span>${escapeHtml(step.instruction)}</span>
      </li>
    `)
    .join('')

  const tags = [...recipe.tags.map(formatTag), ...recipe.season.map(formatSeason)]
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join('')

  return `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(recipe.title)} - Fridge</title>
        <style>
          @page { size: A4; margin: 16mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #17211b;
            font-family: Arial, sans-serif;
            background: #fffaf2;
          }
          .sheet {
            background: white;
            border: 1px solid rgba(23,33,27,0.12);
          }
          img {
            display: block;
            width: 100%;
            height: 220px;
            object-fit: cover;
          }
          .content { padding: 28px; }
          .brand {
            color: #0f7a4a;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            margin-bottom: 8px;
          }
          h1 {
            margin: 0 0 10px;
            font-family: Georgia, serif;
            font-size: 34px;
            line-height: 1.05;
          }
          .description {
            margin: 0 0 18px;
            color: rgba(23,33,27,0.68);
            font-size: 14px;
            line-height: 1.6;
          }
          .chips {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 18px;
          }
          .chips span {
            background: #e8f4ed;
            color: #0f7a4a;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 800;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            border: 1px solid rgba(23,33,27,0.1);
            margin-bottom: 24px;
          }
          .stat { padding: 12px; border-right: 1px solid rgba(23,33,27,0.1); }
          .stat:last-child { border-right: 0; }
          .stat-label {
            color: rgba(23,33,27,0.52);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .stat-value { font-family: Georgia, serif; font-size: 20px; }
          .grid {
            display: grid;
            grid-template-columns: 0.85fr 1.15fr;
            gap: 28px;
          }
          h2 {
            color: #0f7a4a;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            margin: 0 0 12px;
          }
          ul, ol { margin: 0; padding: 0; list-style: none; }
          .ingredients li {
            display: grid;
            grid-template-columns: 76px 1fr;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px solid rgba(23,33,27,0.1);
            font-size: 13px;
          }
          .qty {
            color: rgba(23,33,27,0.55);
            font-family: Georgia, serif;
          }
          .steps li {
            display: grid;
            grid-template-columns: 26px 1fr;
            gap: 12px;
            padding: 0 0 14px;
            margin-bottom: 14px;
            border-bottom: 1px solid rgba(23,33,27,0.1);
            font-size: 14px;
            line-height: 1.6;
          }
          .step-number {
            color: #ff6f4e;
            font-family: Georgia, serif;
            font-size: 20px;
            font-style: italic;
          }
          .footer {
            margin-top: 24px;
            padding-top: 14px;
            border-top: 1px solid rgba(23,33,27,0.1);
            color: rgba(23,33,27,0.48);
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <article class="sheet">
          <img src="${escapeAttribute(imageUrl)}" alt="" />
          <div class="content">
            <div class="brand">Fridge · Recette complète</div>
            <h1>${escapeHtml(recipe.title)}</h1>
            <p class="description">${escapeHtml(recipe.description)}</p>
            <div class="chips">${tags}</div>
            <div class="stats">
              <div class="stat"><div class="stat-label">Temps</div><div class="stat-value">${recipe.prep_time_minutes} min</div></div>
              <div class="stat"><div class="stat-label">Personnes</div><div class="stat-value">${householdSize}</div></div>
              <div class="stat"><div class="stat-label">Calories</div><div class="stat-value">${recipe.calories ?? 'N/A'}</div></div>
              <div class="stat"><div class="stat-label">Protéines</div><div class="stat-value">${recipe.proteins_g ? `${formatQuantity(recipe.proteins_g)}g` : 'N/A'}</div></div>
            </div>
            <div class="grid">
              <section>
                <h2>Ingrédients</h2>
                <ul class="ingredients">${ingredients}</ul>
              </section>
              <section>
                <h2>Préparation</h2>
                <ol class="steps">${steps}</ol>
              </section>
            </div>
            <div class="footer">Fiche générée par Fridge. Enregistre cette page en PDF depuis la fenêtre d’impression.</div>
          </div>
        </article>
        <script>
          window.addEventListener('load', () => {
            setTimeout(() => window.print(), 250)
          })
        </script>
      </body>
    </html>
  `
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function escapeAttribute(value: string) {
  return escapeHtml(value)
}
