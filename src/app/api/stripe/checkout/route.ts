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
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?subscribed=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    allow_promotion_codes: true,
  })

  return NextResponse.redirect(session.url!)
}
