import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
import * as crypto from 'https://deno.land/std@0.168.0/node/crypto.ts'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!

// Create a Supabase client with the service role key to bypass RLS
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  try {
    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()

    // 1. Verify the webhook signature
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(body).digest('hex')
    if (hash !== signature) {
      throw new Error('Invalid signature')
    }

    const event = JSON.parse(body)

    // 2. Check if the event is a successful charge
    if (event.event === 'charge.success') {
      const { reference, amount, metadata } = event.data
      const userId = metadata.user_id
      const amountInNaira = amount / 100 // Convert back from kobo

      // 3. Check if transaction has already been processed
      const { data: existingTransaction, error: findError } = await supabaseAdmin
        .from('transactions')
        .select('id')
        .eq('description', `Paystack deposit: ${reference}`)
        .single()

      if (existingTransaction) {
        console.log('Transaction already processed:', reference)
        return new Response('ok', { status: 200 })
      }

      // 4. Update user's wallet
      // We need a database function for this to be atomic (to prevent race conditions)
      const { error: rpcError } = await supabaseAdmin.rpc('deposit_into_wallet', {
        p_user_id: userId,
        p_amount: amountInNaira,
        p_description: `Paystack deposit: ${reference}`
      })

      if (rpcError) {
        throw new Error(`Failed to process deposit: ${rpcError.message}`)
      }
    }

    // 5. Return 200 OK to Paystack
    return new Response('ok', { status: 200 })

  } catch (error) {
    console.error('Webhook processing error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
