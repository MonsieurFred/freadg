import Link from 'next/link'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { getCurrentWeekRecipes, getUserMealPlanForWeek, getWeekStartDate } from '@/lib/recipes/queries'
import WeekPlannerClient from './WeekPlannerClient'

export default async function MyWeekPage() {
  const weekStartDate = getWeekStartDate()
  let userId = ''

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      userId = user?.id ?? ''
    } catch {
      userId = ''
    }
  }

  const [initialPlan, availableRecipes] = await Promise.all([
    getUserMealPlanForWeek(weekStartDate),
    getCurrentWeekRecipes(),
  ])

  return (
    <div className="px-8 py-8 lg:px-10 lg:py-9">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="eyebrow mb-2">Mon planning</div>
          <h1 className="serif" style={{ fontSize: 34, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            La semaine en un coup d&apos;œil
          </h1>
        </div>
        <Link href="/shopping-list" className="btn-primary" style={{ fontSize: 13 }}>
          Voir les courses
        </Link>
      </div>

      <WeekPlannerClient
        initialPlan={initialPlan}
        availableRecipes={availableRecipes}
        userId={userId}
        weekStartDate={weekStartDate}
      />
    </div>
  )
}
