import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="app-shell flex min-h-screen flex-col items-center justify-center px-5 py-20 text-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="mt-4 text-5xl font-black tracking-tight text-[#17211b] md:text-7xl">Page introuvable.</h1>
      <p className="mt-6 max-w-md text-lg leading-8 text-stone-600">
        La page que tu cherches n&apos;existe pas ou a été déplacée.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/dashboard" className="primary-button">
          Retour à l&apos;accueil
        </Link>
        <Link href="/recipes" className="secondary-button">
          Voir les recettes
        </Link>
      </div>
    </main>
  )
}
