import { createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    const status = mapStripeStatus(subscription.status)

    await admin
      .from('users')
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: status,
      })
      .eq('stripe_customer_id', customerId)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.mode === 'subscription' && session.customer) {
      const customerId = session.customer as string
      await admin
        .from('users')
        .update({ subscription_status: 'active' })
        .eq('stripe_customer_id', customerId)
    }
  }

  return NextResponse.json({ received: true })
}

function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case 'active': return 'active'
    case 'trialing': return 'trialing'
    case 'canceled': return 'canceled'
    case 'past_due': return 'past_due'
    default: return 'inactive'
  }
}
