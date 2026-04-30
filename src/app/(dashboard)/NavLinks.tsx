'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavLink = { href: string; label: string }

export default function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex justify-around border-t py-2 lg:flex-col lg:justify-start lg:border-t-0 lg:px-3 lg:py-4" style={{ borderColor: 'var(--border)' }}>
      {links.map(({ href, label }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold transition-colors lg:justify-start lg:px-4 lg:py-2.5 lg:text-sm"
            style={{
              color: active ? 'var(--green)' : 'var(--muted)',
              background: active ? 'var(--green-pale)' : 'transparent',
              borderLeft: active ? '2px solid var(--green)' : '2px solid transparent',
              fontWeight: active ? 700 : 500,
            }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
