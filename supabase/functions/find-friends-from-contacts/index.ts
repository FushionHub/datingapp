import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';
import { corsHeaders } from '../_shared/cors.ts';

// Define the shape of a contact received from the Contact Picker API
interface Contact {
  name: string[];
  email: string[];
  tel: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { contacts }: { contacts: Contact[] } = await req.json();
    if (!contacts || !Array.isArray(contacts)) {
      throw new Error('Missing or invalid `contacts` array.');
    }

    // Extract emails and phone numbers from the contacts
    const emails = contacts.flatMap(c => c.email || []).filter(Boolean);
    const phones = contacts.flatMap(c => c.tel || []).filter(Boolean);

    if (emails.length === 0 && phones.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Build the query filter string for the `or` condition
    const filters = [];
    if (emails.length > 0) {
      filters.push(`email.in.("${emails.join('","')}")`);
    }
    if (phones.length > 0) {
      filters.push(`phone_number.in.("${phones.join('","')}")`);
    }
    const orFilter = filters.join(',');

    // Find profiles that match the emails or phone numbers, excluding the current user
    const { data: foundProfiles, error } = await supabaseClient
      .from('profiles')
      .select('id, name, photos, bio')
      .not('id', 'eq', user.id) // Exclude the current user
      .or(orFilter);

    if (error) throw error;

    return new Response(JSON.stringify(foundProfiles), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
