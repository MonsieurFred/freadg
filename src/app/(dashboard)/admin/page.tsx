import Link from 'next/link'
import { getRecipeStats } from '@/lib/recipes/queries'

export default async function AdminPage() {
  const stats = await getRecipeStats()

  return (
    <div className="px-8 py-8">
      <p className="text-sm font-medium text-green-700">Back-office</p>
      <h1 className="mt-1 text-3xl font-bold text-gray-950">Administration</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-500">
        Pilotage éditorial du catalogue, de la sélection hebdomadaire et des premiers indicateurs.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat label="Recettes" value={stats.totalRecipes} />
        <Stat label="Actives" value={stats.activeRecipes} />
        <Stat label="Rapides" value={stats.quickRecipes} />
        <Stat label="Végétariennes" value={stats.vegetarianRecipes} />
        <Stat label="Abonnés actifs" value={stats.estimatedActiveSubscribers} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <AdminLink
          href="/admin/recipes"
          title="Gestion des recettes"
          description="Créer une recette, structurer les ingrédients, les étapes, les tags, les saisons et les macros."
        />
        <AdminLink
          href="/admin/weekly"
          title="Sélection de la semaine"
          description="Composer les recettes mises en avant et planifier la semaine éditoriale."
        />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-950">{value}</p>
    </div>
  )
}

function AdminLink({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link href={href} className="rounded-lg border border-gray-200 bg-white p-6 transition hover:border-green-200 hover:shadow-sm">
      <h2 className="text-xl font-bold text-gray-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
    </Link>
  )
}
