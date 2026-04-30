'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  GROCERY_STORES,
  readFavoriteStoreId,
  readSelectedStoreIds,
  writeFavoriteStoreId,
  writeSelectedStoreIds,
  type GroceryStoreId,
} from '@/lib/stores/storage'

export default function StoreSelectionClient() {
  const [favoriteStoreId, setFavoriteStoreId] = useState<GroceryStoreId | null>(null)
  const [selectedStoreIds, setSelectedStoreIds] = useState<GroceryStoreId[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setFavoriteStoreId(readFavoriteStoreId())
    setSelectedStoreIds(readSelectedStoreIds())
  }, [])

  function toggleStore(storeId: GroceryStoreId) {
    setSelectedStoreIds((current) =>
      current.includes(storeId) ? current.filter((id) => id !== storeId) : [...current, storeId]
    )
  }

  function savePreferences() {
    writeSelectedStoreIds(selectedStoreIds)
    writeFavoriteStoreId(favoriteStoreId ?? '')
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="px-8 py-8 lg:px-10 lg:py-9">
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <div className="eyebrow mb-2">Magasins</div>
          <h1 className="serif" style={{ fontSize: 34, color: 'var(--ink)' }}>Choisir où envoyer ma liste</h1>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 620 }}>
            Sélectionne les magasins que tu veux utiliser pour préparer ta liste en click & collect ou livraison. Ton magasin favori sera proposé en priorité dans la liste de courses.
          </p>
        </div>
        <Link href="/shopping-list" className="btn-secondary">← Retour</Link>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        {GROCERY_STORES.map((store) => {
          const selected = selectedStoreIds.includes(store.id)
          const favorite = favoriteStoreId === store.id

          return (
            <article key={store.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', minHeight: 210 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div>
                  <h2 style={{ fontSize: 18, color: 'var(--ink)', fontWeight: 800 }}>{store.name}</h2>
                  <p style={{ marginTop: 4, fontSize: 12, color: 'var(--muted)', lineHeight: 1.45 }}>{store.note}</p>
                </div>
                {favorite && (
                  <span style={{ background: 'var(--green-pale)', color: 'var(--green)', padding: '4px 7px', borderRadius: 4, fontSize: 10, fontWeight: 800 }}>
                    Favori
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {store.services.map((service) => (
                  <span key={service} style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 600 }}>✓ {service}</span>
                ))}
              </div>

              <div style={{ marginTop: 'auto', display: 'grid', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => toggleStore(store.id)}
                  className={selected ? 'btn-primary' : 'btn-secondary'}
                  style={{ width: '100%', fontSize: 12, padding: '9px 10px' }}
                >
                  {selected ? 'Sélectionné' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => setFavoriteStoreId(favorite ? null : store.id)}
                  className="btn-secondary"
                  style={{ width: '100%', fontSize: 12, padding: '9px 10px' }}
                >
                  {favorite ? 'Retirer le favori' : 'Définir favori'}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button type="button" onClick={savePreferences} className="btn-primary">
          {saved ? '✓ Enregistré' : 'Enregistrer mes magasins'}
        </button>
        <Link href="/shopping-list" className="btn-secondary">
          Utiliser ma liste
        </Link>
      </div>
    </div>
  )
}
