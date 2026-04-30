'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="app-shell flex min-h-screen flex-col items-center justify-center px-5 py-20 text-center">
      <p className="eyebrow">Erreur</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-[#17211b] md:text-5xl">Quelque chose s&apos;est mal passé.</h1>
      <p className="mt-6 max-w-md text-base leading-7 text-stone-600">
        Une erreur inattendue s&apos;est produite. Tu peux réessayer ou revenir à l&apos;accueil.
      </p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="primary-button">
          Réessayer
        </button>
        <Link href="/dashboard" className="secondary-button">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
