import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { type UserProfile } from '@/types/database'
import AccountForm from './AccountForm'

const FALLBACK_PROFILE: UserProfile = {
  id: '',
  email: '',
  household_size: 2,
  dietary_preferences: [],
  stripe_customer_id: null,
  stripe_subscription_id: null,
  subscription_status: 'inactive',
  created_at: new Date().toISOString(),
}

type AccountPageProps = {
  searchParams: Promise<{ subscribed?: string }>
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { profile, email } = await getProfile()
  const sp = await searchParams
  const justSubscribed = sp.subscribed === '1'

  return (
    <div className="px-8 py-8 lg:px-10 lg:py-9">
      <div className="eyebrow mb-2">Compte</div>
      <h1 className="serif mb-6" style={{ fontSize: 34, color: 'var(--ink)' }}>Mon compte</h1>

      {justSubscribed && (
        <div className="mb-6 px-4 py-3" style={{ background: 'var(--green-pale)', border: '1px solid rgba(15,122,74,0.2)', borderRadius: 4, fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>
          Abonnement activé — bienvenue dans Fridge !
        </div>
      )}

      <div style={{ maxWidth: 560 }}>
        <AccountForm profile={profile} userEmail={email} demoMode={!isSupabaseConfigured()} />
      </div>
    </div>
  )
}

async function getProfile(): Promise<{ profile: UserProfile; email: string }> {
  if (!isSupabaseConfigured()) {
    return {
      profile: { ...FALLBACK_PROFILE, id: 'demo-user', email: 'demo@fridge.app' },
      email: 'demo@fridge.app',
    }
  }

  let user = null
  let supabase = null

  try {
    supabase = await createClient()
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch {
    return {
      profile: { ...FALLBACK_PROFILE, id: 'demo-user', email: 'demo@fridge.app' },
      email: 'demo@fridge.app',
    }
  }

  if (!user) {
    return {
      profile: { ...FALLBACK_PROFILE, id: 'demo-user', email: 'demo@fridge.app' },
      email: 'demo@fridge.app',
    }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    profile: profile ?? { ...FALLBACK_PROFILE, id: user.id, email: user.email ?? '' },
    email: user.email ?? '',
  }
}
