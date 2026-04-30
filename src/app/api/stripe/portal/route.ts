import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`)
  }

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/account`)
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  })

  return NextResponse.redirect(session.url)
}
