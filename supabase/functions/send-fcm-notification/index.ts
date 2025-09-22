import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0'
import * as admin from 'https://deno.land/x/firebase_admin@v1.0.2/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

// IMPORTANT: The user must set these secrets in their Supabase project settings
// Go to Project Settings -> Functions -> send-fcm-notification -> Secrets
// The FIREBASE_SERVICE_ACCOUNT_JSON should be the entire JSON object from the Firebase service account key file
const FIREBASE_SERVICE_ACCOUNT_JSON = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!

// Initialize Firebase Admin SDK
try {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT_JSON)),
    });
} catch (e) {
    // It might already be initialized if the function is hot-reloaded
    if (e.message.includes('already exists')) {
        console.log('Firebase Admin already initialized.');
    } else {
        console.error('Firebase Admin initialization error:', e);
    }
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // This function can be called by a database trigger/webhook
    const { recipientId, title, body, data } = await req.json()

    if (!recipientId || !title || !body) {
        throw new Error('recipientId, title, and body are required.')
    }

    // 1. Get the recipient's FCM tokens from the database
    const { data: tokens, error: tokenError } = await supabaseAdmin
        .from('fcm_tokens')
        .select('token')
        .eq('user_id', recipientId)

    if (tokenError) throw tokenError
    if (!tokens || tokens.length === 0) {
        console.log(`No FCM tokens found for user ${recipientId}`)
        return new Response(JSON.stringify({ success: false, message: 'No tokens found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    }

    const registrationTokens = tokens.map(t => t.token)

    // 2. Construct the FCM message payload
    const message = {
        notification: {
            title: title,
            body: body,
        },
        tokens: registrationTokens,
        data: data || {}, // Optional custom data
    }

    // 3. Send the message using the Firebase Admin SDK
    const response = await admin.messaging().sendMulticast(message)
    console.log('Successfully sent message:', response)

    // Optional: Clean up stale tokens
    if (response.failureCount > 0) {
        const failedTokens = []
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                failedTokens.push(registrationTokens[idx])
            }
        })
        console.log('List of tokens that caused failures: ' + failedTokens)
        // Here you could add logic to delete these tokens from your database
    }

    return new Response(JSON.stringify({ success: true, response }), {
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
