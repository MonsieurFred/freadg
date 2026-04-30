'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GROCERY_STORES, readFavoriteStoreId, writeFavoriteStoreId, type GroceryStoreId } from '@/lib/stores/storage'
import { type UserProfile } from '@/types/database'

const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Végétarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten_free', label: 'Sans gluten' },
  { value: 'dairy_free', label: 'Sans lactose' },
  { value: 'nut_free', label: 'Sans noix' },
]

const EQUIPMENT_OPTIONS = [
  { value: 'oven', label: 'Four' },
  { value: 'stovetop', label: 'Plaque de cuisson' },
  { value: 'microwave', label: 'Micro-ondes' },
  { value: 'blender', label: 'Mixeur' },
  { value: 'food_processor', label: 'Robot cuisine' },
  { value: 'air_fryer', label: 'Air fryer' },
  { value: 'rice_cooker', label: 'Cuiseur à riz' },
  { value: 'steamer', label: 'Cuiseur vapeur' },
  { value: 'grill', label: 'Grill / plancha' },
  { value: 'pressure_cooker', label: 'Cocotte-minute' },
]

const KITCHEN_EQUIPMENT_STORAGE_KEY = 'fridge:kitchen-equipment'

export default function AccountForm({
  profile,
  userEmail,
  demoMode = false,
}: {
  profile: UserProfile
  userEmail: string
  demoMode?: boolean
}) {
  const router = useRouter()
  const [householdSize, setHouseholdSize] = useState(profile.household_size)
  const [dietary, setDietary] = useState<string[]>(profile.dietary_preferences)
  const [favoriteStoreId, setFavoriteStoreId] = useState<GroceryStoreId | ''>('')
  const [equipment, setEquipment] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  function toggleDietary(value: string) {
    setDietary((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  function toggleEquipment(value: string) {
    setEquipment((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    )
  }

  useEffect(() => {
    setFavoriteStoreId(readFavoriteStoreId() ?? '')
    setEquipment(readKitchenEquipment())
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (!demoMode) {
      const supabase = createClient()
      await supabase
        .from('users')
        .update({ household_size: householdSize, dietary_preferences: dietary })
        .eq('id', profile.id)
    }
    writeFavoriteStoreId(favoriteStoreId)
    writeKitchenEquipment(equipment)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
  }

  async function handleLogout() {
    setLoggingOut(true)
    if (!demoMode) {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    router.push('/')
    router.refresh()
  }

  const sectionStyle = { background: 'white', border: '1px solid var(--border)', borderRadius: 4, padding: '20px 24px', marginBottom: 16 }
  const labelStyle = { fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--muted)', marginBottom: 12, display: 'block' }

  return (
    <div>
      {/* Profil */}
      <section style={sectionStyle}>
        <div className="eyebrow mb-4">Profil</div>
        <p className="mb-5" style={{ fontSize: 14, color: 'var(--muted)' }}>{userEmail}</p>
        {demoMode && (
          <div className="mb-5 px-4 py-3" style={{ background: 'var(--green-pale)', borderRadius: 4, fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>
            Mode démo: les changements sont simulés.
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="mb-6">
            <label style={labelStyle}>Personnes dans le foyer</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setHouseholdSize((n) => Math.max(1, n - 1))}
                className="btn-secondary flex items-center justify-center"
                style={{ width: 40, height: 40, padding: 0, fontSize: 20 }}
              >−</button>
              <span className="serif" style={{ width: 32, textAlign: 'center', fontSize: 32, color: 'var(--ink)' }}>{householdSize}</span>
              <button
                type="button"
                onClick={() => setHouseholdSize((n) => Math.min(10, n + 1))}
                className="btn-secondary flex items-center justify-center"
                style={{ width: 40, height: 40, padding: 0, fontSize: 20 }}
              >+</button>
            </div>
          </div>

          <div className="mb-6">
            <label style={labelStyle}>Régime alimentaire</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleDietary(opt.value)}
                  style={{
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 4,
                    border: dietary.includes(opt.value) ? '1px solid var(--green)' : '1px solid var(--border)',
                    background: dietary.includes(opt.value) ? 'var(--green)' : 'white',
                    color: dietary.includes(opt.value) ? '#fff' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="favorite-store" style={labelStyle}>Magasin favori</label>
            <select
              id="favorite-store"
              value={favoriteStoreId}
              onChange={(event) => setFavoriteStoreId(event.target.value as GroceryStoreId | '')}
              className="input"
            >
              <option value="">Aucun magasin favori</option>
              {GROCERY_STORES.map((store) => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
            <p style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              Ce magasin sera proposé en priorité dans la liste de courses. Tu pourras toujours choisir un autre magasin.
            </p>
          </div>

          <div className="mb-6">
            <label style={labelStyle}>Ustensiles disponibles</label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleEquipment(item.value)}
                  style={{
                    padding: '7px 12px',
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 4,
                    border: equipment.includes(item.value) ? '1px solid var(--green)' : '1px solid var(--border)',
                    background: equipment.includes(item.value) ? 'var(--green-pale)' : 'white',
                    color: equipment.includes(item.value) ? 'var(--green)' : 'var(--ink)',
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              Fridge pourra ensuite privilégier les recettes compatibles avec ce que tu as déjà dans ta cuisine.
            </p>
          </div>

          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Enregistrement…' : saved ? '✓ Enregistré' : 'Enregistrer'}
          </button>
        </form>
      </section>

      {/* Abonnement */}
      <section style={sectionStyle}>
        <div className="eyebrow mb-4">Abonnement</div>
        <div className="flex items-center gap-3 mb-5">
          <span
            style={{
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 4,
              background: profile.subscription_status === 'active' ? 'var(--green-pale)' : 'var(--sand)',
              color: profile.subscription_status === 'active' ? 'var(--green)' : 'var(--muted)',
            }}
          >
            {profile.subscription_status === 'active' && 'Actif'}
            {profile.subscription_status === 'trialing' && "Période d'essai"}
            {profile.subscription_status === 'inactive' && 'Inactif'}
            {profile.subscription_status === 'canceled' && 'Annulé'}
            {profile.subscription_status === 'past_due' && 'Paiement en retard'}
          </span>
          <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>6,99 € / mois</span>
        </div>
        {profile.subscription_status !== 'active' && profile.subscription_status !== 'trialing' ? (
          <a href="/api/stripe/checkout" className="btn-primary">S&apos;abonner</a>
        ) : (
          <a href="/api/stripe/portal" className="btn-secondary">Gérer l&apos;abonnement</a>
        )}
      </section>

      {/* Session */}
      <section style={sectionStyle}>
        <div className="eyebrow mb-4">Session</div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 700,
            borderRadius: 4,
            border: '1px solid #fca5a5',
            background: 'white',
            color: '#dc2626',
            cursor: 'pointer',
          }}
        >
          {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
        </button>
      </section>
    </div>
  )
}

function readKitchenEquipment() {
  if (typeof window === 'undefined') return []
  const rawValue = window.localStorage.getItem(KITCHEN_EQUIPMENT_STORAGE_KEY)
  if (!rawValue) return []

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  } catch {
    return []
  }
}

function writeKitchenEquipment(equipment: string[]) {
  window.localStorage.setItem(KITCHEN_EQUIPMENT_STORAGE_KEY, JSON.stringify(Array.from(new Set(equipment))))
}
