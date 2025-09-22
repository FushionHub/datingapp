import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';
import { corsHeaders } from '../_shared/cors.ts';

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

    const { messageId } = await req.json();
    if (!messageId) throw new Error('Missing required field: messageId');

    // Fetch the message
    const { data: message, error: msgError } = await supabaseClient
      .from('messages')
      .select('id, sender_id, media_url, is_viewed, is_view_once')
      .eq('id', messageId)
      .single();

    if (msgError) throw msgError;
    if (!message) throw new Error('Message not found.');
    if (!message.is_view_once) throw new Error('This message is not a view-once message.');
    if (message.is_viewed) throw new Error('This message has already been viewed.');

    // Security Check: Only the recipient can mark it as viewed
    if (message.sender_id === user.id) {
      throw new Error('Sender cannot mark a message as viewed.');
    }

    // Update the message to mark it as viewed
    const { error: updateError } = await supabaseClient
      .from('messages')
      .update({ is_viewed: true })
      .eq('id', messageId);

    if (updateError) throw updateError;

    // Delete the media from storage
    if (message.media_url) {
      try {
        const url = new URL(message.media_url);
        const filePath = url.pathname.split('/chat-media/')[1];
        if (filePath) {
          await supabaseClient.storage.from('chat-media').remove([filePath]);
        }
      } catch (e) {
        // Log the error but don't fail the whole request,
        // as the primary goal (marking as viewed) is complete.
        console.error(`Failed to delete media for message ${message.id}:`, e.message);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
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
