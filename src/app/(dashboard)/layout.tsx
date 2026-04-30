import Link from 'next/link'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import NavLinks from './NavLinks'

const BASE_NAV = [
  { href: '/dashboard', label: 'Semaine' },
  { href: '/my-week', label: 'Planning' },
  { href: '/shopping-list', label: 'Courses' },
  { href: '/recipes', label: 'Recettes' },
  { href: '/favorites', label: 'Favoris' },
  { href: '/account', label: 'Compte' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let isAdmin = false

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      isAdmin = user?.app_metadata?.role === 'admin'
    } catch {
      isAdmin = false
    }
  }

  const navLinks = isAdmin
    ? [...BASE_NAV, { href: '/admin', label: 'Admin' }]
    : BASE_NAV

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 hidden flex-col lg:flex"
        style={{ width: 220, background: 'white', borderRight: '1px solid var(--border)', zIndex: 30 }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-5 py-6"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span
            className="flex shrink-0 items-center justify-center serif text-lg"
            style={{ width: 32, height: 32, background: 'var(--ink)', color: 'var(--peach)' }}
          >
            F
          </span>
          <span className="serif text-lg" style={{ color: 'var(--ink)' }}>Fridge</span>
        </Link>

        <NavLinks links={navLinks} />

        <div className="mt-auto mx-3 mb-4 p-4" style={{ background: 'var(--ink)' }}>
          <p className="eyebrow-coral mb-2">Cette semaine</p>
          <p className="serif text-base text-white leading-snug mb-3">Planning prêt en 3 min.</p>
          <Link href="/my-week" className="btn-primary text-xs px-3 py-1.5">Voir →</Link>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 flex lg:hidden"
        style={{ background: 'white', borderTop: '1px solid var(--border)' }}
      >
        <NavLinks links={navLinks} />
      </div>

      <main className="w-full pb-20 lg:pb-0 lg:ml-[220px]">
        {children}
      </main>
    </div>
  )
}
