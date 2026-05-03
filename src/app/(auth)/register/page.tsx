'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Végétarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten_free', label: 'Sans gluten' },
  { value: 'dairy_free', label: 'Sans lactose' },
  { value: 'nut_free', label: 'Sans noix' },
]

type Step = 1 | 2 | 'confirm'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [householdSize, setHouseholdSize] = useState(2)
  const [dietary, setDietary] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function toggleDietary(value: string) {
    setDietary((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.')
      return
    }
    setError(null)
    setStep(2)
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!isSupabaseConfigured()) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { household_size: householdSize, dietary_preferences: dietary },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      if (data.user) {
        await supabase
          .from('users')
          .update({ household_size: householdSize, dietary_preferences: dietary })
          .eq('id', data.user.id)
      }
      router.push('/dashboard')
      router.refresh()
    } else {
      setStep('confirm')
      setLoading(false)
    }
  }

  async function handleGoogle() {
    if (!isSupabaseConfigured()) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--cream)' }}>
        <div className="card p-10 text-center max-w-md w-full">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center" style={{ background: 'var(--green-pale)' }}>
            <span style={{ fontSize: 28 }}>✉</span>
          </div>
          <h1 className="serif mb-3" style={{ fontSize: 28, color: 'var(--ink)' }}>Confirme ton email</h1>
          <p className="mb-6" style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--muted)' }}>
            Un lien de confirmation a été envoyé à <strong>{email}</strong>.<br />
            Clique dessus pour activer ton compte.
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            Pas reçu ?{' '}
            <button
              onClick={() => setStep(2)}
              style={{ color: 'var(--green)', fontWeight: 700 }}
            >
              Renvoyer
            </button>
          </p>
          <Link href="/login" className="block mt-6" style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: '1fr 1fr', fontFamily: 'var(--font-sans)' }}>
      {/* Left: form */}
      <div
        className="flex flex-col justify-center px-12 py-16 col-span-2 lg:col-span-1"
        style={{ background: 'var(--cream)' }}
      >
        <Link href="/" className="flex items-center gap-2 mb-12">
          <span
            className="flex shrink-0 items-center justify-center serif"
            style={{ width: 30, height: 30, background: 'var(--ink)', color: 'var(--peach)', fontSize: 16 }}
          >F</span>
          <span className="serif" style={{ fontSize: 18, color: 'var(--ink)' }}>Freadg</span>
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 max-w-[380px]">
          {[1, 2].map((n) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div
                className="flex items-center justify-center text-xs font-bold"
                style={{
                  width: 28,
                  height: 28,
                  background: (step as number) >= n ? 'var(--ink)' : 'var(--sand)',
                  color: (step as number) >= n ? '#fff' : 'var(--muted)',
                  borderRadius: 4,
                  flexShrink: 0,
                }}
              >
                {n}
              </div>
              {n < 2 && (
                <div className="flex-1 h-px" style={{ background: (step as number) >= 2 ? 'var(--green)' : 'var(--border)' }} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="eyebrow mb-3">Bienvenue</div>
            <h1 className="serif mb-9" style={{ fontSize: 40, color: 'var(--ink)', lineHeight: 1.1 }}>Créer un compte.</h1>

            <div className="flex flex-col gap-4 max-w-[380px]">
              <button
                onClick={handleGoogle}
                className="btn-secondary flex items-center justify-center gap-3"
              >
                <GoogleIcon />
                Continuer avec Google
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>ou</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              <form onSubmit={handleStep1} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="email" className="block mb-2" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.04em' }}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="vous@exemple.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block mb-2" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.04em' }}>
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder="8 caractères minimum"
                  />
                </div>

                {error && (
                  <p className="px-3 py-2 text-sm font-semibold" style={{ border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', borderRadius: 4 }}>
                    {error}
                  </p>
                )}

                <button type="submit" className="btn-primary mt-1 w-full justify-center">
                  Continuer →
                </button>

                <div className="text-center mt-2" style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Déjà un compte ?{' '}
                  <Link href="/login" style={{ color: 'var(--green)', fontWeight: 700 }}>
                    Se connecter
                  </Link>
                </div>
              </form>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="eyebrow mb-3">Personnalisation</div>
            <h1 className="serif mb-9" style={{ fontSize: 40, color: 'var(--ink)', lineHeight: 1.1 }}>Votre foyer.</h1>

            <form onSubmit={handleStep2} className="flex flex-col gap-6 max-w-[380px]">
              <div>
                <label className="block mb-3" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>
                  Nombre de personnes
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setHouseholdSize((n) => Math.max(1, n - 1))}
                    className="btn-secondary"
                    style={{ width: 40, height: 40, padding: 0, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >−</button>
                  <span className="serif" style={{ width: 32, textAlign: 'center', fontSize: 32, color: 'var(--ink)' }}>{householdSize}</span>
                  <button
                    type="button"
                    onClick={() => setHouseholdSize((n) => Math.min(10, n + 1))}
                    className="btn-secondary"
                    style={{ width: 40, height: 40, padding: 0, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                </div>
              </div>

              <div>
                <label className="block mb-3" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>
                  Régime alimentaire <span style={{ fontWeight: 500, color: 'var(--muted)' }}>(facultatif)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleDietary(opt.value)}
                      className="px-3 py-1.5 text-sm font-bold transition-colors"
                      style={{
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

              {error && (
                <p className="px-3 py-2 text-sm font-semibold" style={{ border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', borderRadius: 4 }}>
                  {error}
                </p>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 justify-center"
                >
                  {loading ? 'Création…' : 'Créer mon compte'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Right: dark image */}
      <div className="hidden lg:block relative overflow-hidden" style={{ background: 'var(--ink)' }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, var(--ink) 0%, transparent 100%)', opacity: 0.65 }}
        />
        <div className="absolute bottom-10 left-10 right-10">
          <div className="serif" style={{ fontSize: 28, color: '#fff', lineHeight: 1.3, marginBottom: 12 }}>
            Des repas sains,<br />toute la semaine.
          </div>
          <div style={{ fontSize: 12, color: 'var(--peach)', fontWeight: 600 }}>— L&apos;équipe Freadg</div>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
