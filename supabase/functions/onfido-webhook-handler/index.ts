import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'

const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  try {
    const payload = await req.json()

    // Onfido sends different webhook events. We are interested in 'check.completed'.
    if (payload.action === 'check.completed') {
      const check = payload.resource;
      const applicantId = check.applicant_id;
      const result = check.result; // 'clear' or 'consider'

      let kycStatus = 'rejected';
      if (result === 'clear') {
        kycStatus = 'approved';
      }

      // Find the user associated with this applicant_id and update their status
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ kyc_status: kycStatus })
        .eq('onfido_applicant_id', applicantId)

      if (updateError) {
        console.error('Failed to update KYC status:', updateError)
        throw updateError
      }

      console.log(`Successfully processed KYC check for applicant ${applicantId} with result: ${kycStatus}`)
    }

    // Return 200 OK to Onfido to acknowledge receipt of the webhook
    return new Response('ok', { status: 200 })

  } catch (error) {
    console.error('Onfido webhook processing error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
