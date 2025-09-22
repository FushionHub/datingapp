import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Nodemailer } from 'https://deno.land/x/nodemailer@v0.1.3/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

// IMPORTANT: The user must set these environment variables in their Supabase project settings
// Go to Project Settings -> Functions -> send-email -> Secrets
const SMTP_HOST = Deno.env.get('SMTP_HOST')!
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT')!, 10)
const SMTP_USER = Deno.env.get('SMTP_USER')!
const SMTP_PASS = Deno.env.get('SMTP_PASS')!

const transporter = new Nodemailer({
    hostname: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, htmlBody } = await req.json()

    if (!to || !subject || !htmlBody) {
        throw new Error('to, subject, and htmlBody are required.')
    }

    await transporter.sendMail({
        from: `"Your App Name" <${SMTP_USER}>`,
        to: to,
        subject: subject,
        html: htmlBody,
    });

    return new Response(JSON.stringify({ success: true, message: 'Email sent' }), {
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
