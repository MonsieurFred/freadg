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

export default function AccountPage() {
  const profile = { ...FALLBACK_PROFILE, id: 'demo-user', email: 'demo@fridge.app' }

  return (
    <div className="px-8 py-8 lg:px-10 lg:py-9">
      <div className="eyebrow mb-2">Compte</div>
      <h1 className="serif mb-6" style={{ fontSize: 34, color: 'var(--ink)' }}>Mon compte</h1>

      <div style={{ maxWidth: 560 }}>
        <AccountForm profile={profile} userEmail="demo@fridge.app" demoMode />
      </div>
    </div>
  )
}
