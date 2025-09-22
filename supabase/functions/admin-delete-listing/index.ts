import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the user's auth token
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the user from the access token
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Check if the user is an admin by calling the database function
    const { data: roleData, error: roleError } = await userClient.rpc('get_user_role', { p_user_id: user.id });
    if (roleError) throw roleError;
    if (roleData !== 'admin') {
        return new Response(JSON.stringify({ error: 'Permission denied. Admins only.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
        });
    }

    const { listingId } = await req.json();
    if (!listingId) {
      throw new Error('Missing required field: listingId');
    }

    // Create a Supabase client with the service_role key to bypass RLS
    const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Delete the listing using the service role client
    const { error: deleteError } = await serviceClient
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true, message: 'Listing deleted successfully.' }), {
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
