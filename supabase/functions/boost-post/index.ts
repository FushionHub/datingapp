import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';
import { corsHeaders } from '../_shared/cors.ts';

const BOOST_COST = 100; // The cost in the wallet's currency to boost a post
const BOOST_DURATION_DAYS = 7; // How long the boost lasts

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the user from the access token
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { postId } = await req.json();
    if (!postId) {
      throw new Error('Missing required field: postId');
    }

    // 1. Fetch the post and its owner
    const { data: post, error: postError } = await supabaseClient
      .from('posts')
      .select('user_id, is_boosted')
      .eq('id', postId)
      .single();

    if (postError) throw postError;
    if (!post) throw new Error('Post not found.');
    if (post.user_id !== user.id) throw new Error('You can only boost your own posts.');
    if (post.is_boosted) throw new Error('This post is already boosted.');

    // 2. Fetch the user's NGN wallet (assuming NGN is the primary currency for this action)
    const { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.id)
      .eq('currency', 'NGN') // Or another primary currency
      .single();

    if (walletError) throw walletError;
    if (!wallet) throw new Error('User wallet not found.');
    if (wallet.balance < BOOST_COST) throw new Error('Insufficient funds to boost post.');

    // 3. Perform the database operations in a transaction
    // We'll use an RPC call to a plpgsql function to ensure atomicity
    const boostEndDate = new Date();
    boostEndDate.setDate(boostEndDate.getDate() + BOOST_DURATION_DAYS);

    const { error: rpcError } = await supabaseClient.rpc('boost_post_transaction', {
      p_post_id: postId,
      p_user_id: user.id,
      p_wallet_id: wallet.id,
      p_boost_cost: BOOST_COST,
      p_boost_expires_at: boostEndDate.toISOString(),
    });

    if (rpcError) throw rpcError;

    return new Response(JSON.stringify({ success: true, message: 'Post boosted successfully!' }), {
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
