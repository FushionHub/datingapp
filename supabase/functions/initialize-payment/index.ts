import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
import { corsHeaders } from '../_shared/cors.ts'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')!
const FLUTTERWAVE_SECRET_KEY = Deno.env.get('FLUTTERWAVE_SECRET_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { amount, currency, provider } = await req.json()
    if (!amount || !currency || !provider) {
      throw new Error('Amount, currency, and provider are required.')
    }

    let authorization_url;
    const reference = `datingapp_${user.id}_${Date.now()}`;

    if (provider === 'paystack') {
      const amountInKobo = amount * 100;
      const paystackBody = {
        email: user.email,
        amount: amountInKobo,
        currency: currency,
        reference: reference,
        metadata: { user_id: user.id },
        callback_url: `${Deno.env.get('SITE_URL')}/wallet`
      }

      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paystackBody)
      })

      const paystackData = await paystackResponse.json()
      if (!paystackResponse.ok) {
        throw new Error(paystackData.message || 'Failed to initialize payment with Paystack.')
      }
      authorization_url = paystackData.data.authorization_url;

    } else if (provider === 'flutterwave') {
      const flutterwaveBody = {
        tx_ref: reference,
        amount: amount,
        currency: currency,
        redirect_url: `${Deno.env.get('SITE_URL')}/wallet`,
        customer: {
          email: user.email,
          name: user.user_metadata.name || 'Valued User'
        },
        customizations: {
          title: 'EpicDate Wallet Funding',
          description: 'Add funds to your wallet.'
        }
      }

      const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(flutterwaveBody)
      })

      const flutterwaveData = await flutterwaveResponse.json()
      if (flutterwaveData.status !== 'success') {
        throw new Error(flutterwaveData.message || 'Failed to initialize payment with Flutterwave.')
      }
      authorization_url = flutterwaveData.data.link;

    } else {
      throw new Error('Invalid payment provider specified.')
    }

    return new Response(JSON.stringify({ authorization_url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
