'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!isSupabaseConfigured()) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setError('Confirme ton adresse email avant de te connecter (vérifie ta boîte mail).')
      } else {
        setError('Email ou mot de passe incorrect.')
      }
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
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

        <div className="eyebrow mb-3">Connexion</div>
        <h1 className="serif mb-9" style={{ fontSize: 40, color: 'var(--ink)', lineHeight: 1.1 }}>Bon retour.</h1>
        {!isSupabaseConfigured() && (
          <div className="mb-5 max-w-[380px] px-4 py-3" style={{ background: 'var(--green-pale)', borderRadius: 4, fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
            Mode présentation: clique sur connexion pour entrer dans la démo.
          </div>
        )}

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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                placeholder="••••••••"
              />
              <div className="mt-1 text-right">
                <Link href="/forgot-password" style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {error && (
              <p className="px-3 py-2 text-sm font-semibold" style={{ border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', borderRadius: 4 }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary mt-1 w-full justify-center">
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>

            <div className="text-center mt-2" style={{ fontSize: 13, color: 'var(--muted)' }}>
              Pas encore de compte ?{' '}
              <Link href="/register" style={{ color: 'var(--green)', fontWeight: 700 }}>
                S&apos;inscrire
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right: dark image */}
      <div className="hidden lg:block relative overflow-hidden" style={{ background: 'var(--ink)' }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.45,
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, var(--ink) 0%, transparent 100%)', opacity: 0.6 }}
        />
        <div className="absolute bottom-10 left-10 right-10">
          <div className="serif" style={{ fontSize: 28, color: '#fff', lineHeight: 1.3, marginBottom: 12 }}>
            &ldquo;La meilleure façon de bien manger, c&apos;est de bien planifier.&rdquo;
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
