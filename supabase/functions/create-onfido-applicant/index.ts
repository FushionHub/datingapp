import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
import { corsHeaders } from '../_shared/cors.ts'

const ONFIDO_API_TOKEN = Deno.env.get('ONFIDO_API_TOKEN')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')!
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Create an Applicant in Onfido
    const onfidoApplicantResponse = await fetch('https://api.onfido.com/v3.6/applicants', {
        method: 'POST',
        headers: {
            'Authorization': `Token token=${ONFIDO_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            // You can pre-fill applicant data here if you have it
            // first_name: 'John',
            // last_name: 'Smith'
        })
    });
    const applicant = await onfidoApplicantResponse.json();
    if (!onfidoApplicantResponse.ok) throw new Error(applicant.error.message);

    const applicantId = applicant.id;

    // 2. Store the applicant_id in our database
    const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ onfido_applicant_id: applicantId })
        .eq('id', user.id)
    if (updateError) throw updateError;

    // 3. Generate an SDK Token for the frontend
    const sdkTokenResponse = await fetch('https://api.onfido.com/v3.6/sdk_token', {
        method: 'POST',
        headers: {
            'Authorization': `Token token=${ONFIDO_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            applicant_id: applicantId,
            // The referrer should be the URL of your deployed app
            referrer: `${Deno.env.get('SITE_URL')}/*`
        })
    });
    const sdkTokenData = await sdkTokenResponse.json();
     if (!sdkTokenResponse.ok) throw new Error(sdkTokenData.error.message);

    return new Response(JSON.stringify({ sdkToken: sdkTokenData.token }), {
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
