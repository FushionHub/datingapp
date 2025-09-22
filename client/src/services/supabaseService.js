import { supabase } from '../supabaseClient';

// --- Profile Functions ---

/**
 * Fetches a single user profile from the database.
 * @param {string} userId - The UUID of the user to fetch.
 * @returns {Promise<object|null>} The user profile object or null if not found or on error.
 */
export async function getProfile(userId) {
  try {
    const { data, error } = await supabase.from('profiles').select('*, ringtone:ringtones(*)').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') throw error; // Ignore "No rows found" error for .single()
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
}

/**
 * Creates or updates a user's profile.
 * @param {string} userId - The UUID of the user.
 * @param {object} profileData - An object containing the profile fields to update.
 * @returns {Promise<{data: object|null, error: object|null}>} An object containing the updated profile data or an error.
 */
export async function upsertProfile(userId, profileData) {
  try {
    // Prevent empty string from being saved if username is not changed
    if (profileData.username === '') {
      delete profileData.username;
    }
    const profile = { id: userId, ...profileData, updated_at: new Date() };
    const { data, error } = await supabase.from('profiles').upsert(profile).select().single();

    if (error) {
      console.error('Error creating/updating profile:', error.message);
      return { data: null, error: error };
    }

    return { data: data, error: null };
  } catch (error) {
    console.error('Catastrophic error creating/updating profile:', error.message);
    return { data: null, error: error };
  }
}

export async function getAllProfiles(currentUserId) {
    try {
        // Get IDs of users who have blocked the current user
        const { data: usersWhoBlockedMe } = await supabase
            .from('blocked_users')
            .select('blocker_id')
            .eq('blocked_id', currentUserId);
        const usersWhoBlockedMeIds = usersWhoBlockedMe.map(u => u.blocker_id);

        // Get IDs of users the current user has blocked
        const { data: usersIBlocked } = await supabase
            .from('blocked_users')
            .select('blocked_id')
            .eq('blocker_id', currentUserId);
        const usersIBlockedIds = usersIBlocked.map(u => u.blocked_id);

        const excludedIds = [...usersWhoBlockedMeIds, ...usersIBlockedIds, currentUserId];

        // Fetch all profiles excluding the excluded IDs
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .not('id', 'in', `(${excludedIds.join(',')})`);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching all profiles:', error.message);
        return [];
    }
}

// --- Matchmaking Functions ---

export async function likeUser(likedUserId) {
  try {
    const { data, error } = await supabase.rpc('create_like_and_match', { p_liked_id: likedUserId });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error liking user:', error.message);
    return null;
  }
}

/**
 * Fetches all matches for the current user.
 * @param {string} currentUserId - The UUID of the current user.
 * @returns {Promise<Array>} A list of match objects, formatted for the client.
 */
export async function getMatches(currentUserId) {
  try {
    // Use the new view to simplify the query and offload work to the database.
    const { data, error } = await supabase
      .from('v_matches_with_users')
      .select('*')
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

    if (error) throw error;

    // The view provides the data in a clean format, but we still need to
    // identify who the "other user" is for the frontend.
    const formattedMatches = data.map(match => {
      const isUser1 = match.user1_id === currentUserId;
      const otherUser = {
        id: isUser1 ? match.user2_id : match.user1_id,
        name: isUser1 ? match.user2_name : match.user1_name,
        photo: isUser1 ? (match.user2_photos ? match.user2_photos[0] : null) : (match.user1_photos ? match.user1_photos[0] : null),
      };
      return {
        match_id: match.match_id,
        matched_at: match.matched_at,
        other_user: otherUser
      };
    });

    return formattedMatches;
  } catch (error) {
    console.error('Error fetching matches:', error.message);
    return [];
  }
}

export async function searchUsers(searchTerm) {
  if (!searchTerm) return [];
  try {
    const { data, error } = await supabase.rpc('search_users', { p_search_term: searchTerm });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching users:', error.message);
    return [];
  }
}

export async function createGroup(name, memberIds) {
  try {
    const { data, error } = await supabase.rpc('create_group_with_members', {
      p_name: name,
      p_member_ids: memberIds,
    });
    if (error) throw error;
    return { success: true, groupId: data };
  } catch (error) {
    console.error('Error creating group:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getGroupDetails(groupId) {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        members:group_members(*, profile:profiles(id, name, photos))
      `)
      .eq('id', groupId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching group details:', error.message);
    return null;
  }
}

export async function adminGetAllListings() {
  try {
    const { data, error } = await supabase.from('listings').select('*, seller:profiles(name)');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all listings for admin:', error.message);
    return [];
  }
}

export async function adminDeleteListing(listingId) {
  try {
    const { data, error } = await supabase.functions.invoke('admin-delete-listing', {
      body: { listingId },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting listing for admin:', error.message);
    return { success: false, error: error.message };
  }
}

export async function contactSeller(sellerId) {
  try {
    const { data, error } = await supabase.rpc('create_conversation_for_listing', {
      p_seller_id: sellerId,
    });
    if (error) throw error;
    return { success: true, matchId: data };
  } catch (error) {
    console.error('Error contacting seller:', error.message);
    return { success: false, error: error.message };
  }
}

// --- Timeline/Post Functions ---

export async function uploadPostImage(userId, file) {
  try {
    const filePath = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('post-images').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('post-images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error.message);
    return null;
  }
}

export async function createPost(userId, textContent, imageUrl = null) {
  try {
    const { data, error } = await supabase.from('posts').insert([{ user_id: userId, text_content: textContent, image_url: imageUrl }]);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating post:', error.message);
    return null;
  }
}

export async function getTimeline(userId) {
  try {
    const { data, error } = await supabase.from('posts').select(`*, author:profiles(name, photos)`).eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching timeline:', error.message);
    return [];
  }
}

// --- Chat/Message Functions ---

export async function getMessages(conversationId, conversationType) {
  const idColumn = conversationType === 'private' ? 'match_id' : 'group_id';
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`*, sender:profiles(name, photos)`)
      .eq(idColumn, conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    return [];
  }
}

export async function sendMessage(conversationId, conversationType, senderId, textContent) {
  const idColumn = conversationType === 'private' ? 'match_id' : 'group_id';
  try {
    const { data, error } = await supabase.from('messages').insert([{
      [idColumn]: conversationId,
      sender_id: senderId,
      text_content: textContent,
      message_type: 'text'
    }]);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending message:', error.message);
    return null;
  }
}

export async function sendMediaMessage(conversationId, conversationType, senderId, file, messageType, isViewOnce = false) {
  const idColumn = conversationType === 'private' ? 'match_id' : 'group_id';
  try {
    const filePath = `${conversationId}/${senderId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('chat-media').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(filePath);
    const mediaUrl = urlData.publicUrl;
    const { data, error } = await supabase.from('messages').insert([{
      [idColumn]: conversationId,
      sender_id: senderId,
      media_url: mediaUrl,
      message_type: messageType,
      is_view_once: isViewOnce,
    }]);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending media message:', error.message);
    return null;
  }
}

export async function editMessage(messageId, newTextContent) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .update({ text_content: newTextContent, is_edited: true })
            .eq('id', messageId);
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error editing message:', error.message);
        return null;
    }
}

export async function markMessageAsViewed(messageId) {
  try {
    const { data, error } = await supabase.functions.invoke('mark-message-viewed', {
      body: { messageId },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error marking message as viewed:', error.message);
    return { success: false, error: error.message };
  }
}

export async function boostPost(postId) {
  try {
    const { data, error } = await supabase.functions.invoke('boost-post', {
      body: { postId },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error boosting post:', error.message);
    // It's good to return the error message from the function
    return { success: false, error: error.data?.error || error.message };
  }
}

// --- Monetization & KYC Functions ---

export async function getWallet(userId) {
  try {
    const { data, error } = await supabase.from('wallets').select('*').eq('user_id', userId);
    if (error) throw error;
    return data; // Returns an array of wallets
  } catch (error) {
    console.error('Error fetching wallet:', error.message);
    return [];
  }
}

export async function initializePayment(amount, currency = 'NGN', provider) {
  try {
    const { data, error } = await supabase.functions.invoke('initialize-payment', {
      body: { amount, currency, provider },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error initializing payment:', error.message);
    return null;
  }
}

export async function getGiftTypes() {
  try {
    const { data, error } = await supabase.from('gift_types').select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching gift types:', error.message);
    return [];
  }
}

export async function sendGift(receiverId, giftTypeId) {
  try {
    const { data, error } = await supabase.rpc('send_gift', {
      p_receiver_id: receiverId,
      p_gift_type_id: giftTypeId,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending gift:', error.message);
    return null;
  }
}

export async function transferFunds(receiverId, amount, currency) {
  try {
    const { data, error } = await supabase.rpc('transfer_funds', {
      p_receiver_id: receiverId,
      p_amount: amount,
      p_currency: currency,
    });
    if (error) {
      // The RPC function returns a text message, not an error object on failure
      // So we check if the data contains the error message.
      if (typeof data === 'string' && (data.includes('Insufficient funds') || data.includes('does not have a wallet'))) {
         return { error: data };
      }
      throw error;
    }
    return { success: true, message: data };
  } catch (error) {
    console.error('Error transferring funds:', error.message);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function createOnfidoApplicant() {
    try {
        const { data, error } = await supabase.functions.invoke('create-onfido-applicant');
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating Onfido applicant:', error.message);
        return { error: error.message };
    }
}

export async function verifyKYC(kycType, value) {
    try {
        const { data, error } = await supabase.functions.invoke('verify-kyc', {
            body: { kycType, value },
        });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error verifying KYC:', error.message);
        return { success: false, error: error.message };
    }
}

export async function uploadKycDocument(userId, file, documentType) {
    try {
        const filePath = `${userId}/${documentType}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('kyc-documents').upload(filePath, file);
        if (uploadError) throw uploadError;

        // Generate a signed URL that expires in 1 hour (3600 seconds)
        const { data, error: urlError } = await supabase.storage.from('kyc-documents').createSignedUrl(filePath, 3600);
        if (urlError) throw urlError;
        const documentUrl = data.signedUrl;

        // Create a record in the kyc_documents table
        const { error: dbError } = await supabase.from('kyc_documents').insert([
            { user_id: userId, document_type: documentType, document_url: documentUrl, status: 'pending' }
        ]);
        if (dbError) throw dbError;

        // Update profile kyc_status
        await supabase.from('profiles').update({ kyc_status: 'pending' }).eq('id', userId);

        return { success: true };
    } catch (error) {
        console.error('Error uploading KYC document:', error.message);
        return { success: false, error: error.message };
    }
}

// --- Admin Functions ---

export async function adminGetAllUsers() {
  try {
    // Note: This view can only be read by admins if you set up RLS on it.
    // We are relying on only calling this from a protected admin route.
    const { data, error } = await supabase.from('users_with_details').select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all users:', error.message);
    return [];
  }
}

export async function adminUpdateUserRole(userId, role) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating user role:', error.message);
    return { success: false, error: error.message };
  }
}

// --- Site Settings Functions ---

export async function getSiteSettings() {
  try {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) throw error;
    // Convert the array of {key, value} objects into a single object
    const settings = data.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    return settings;
  } catch (error) {
    console.error('Error fetching site settings:', error.message);
    return {};
  }
}

export async function updateSiteSetting(key, value) {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ key, value }, { onConflict: 'key' })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating site setting:', error.message);
    return null;
  }
}

// --- Marketplace Functions ---

export async function getListings() {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        price,
        currency,
        image_urls,
        seller:profiles(id, name)
      `)
      .eq('is_sold', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching listings:', error.message);
    return [];
  }
}

export async function getListingDetails(listingId) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*, seller:profiles(*)')
      .eq('id', listingId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching listing details:', error.message);
    return null;
  }
}

export async function uploadListingImage(file, userId) {
  try {
    const filePath = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('listing-images').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('listing-images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading listing image:', error.message);
    return null;
  }
}

export async function createListing(listingData) {
  try {
    const { data, error } = await supabase.from('listings').insert([listingData]).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating listing:', error.message);
    return null;
  }
}

export async function updateListing(listingId, updates) {
  try {
    const { data, error } = await supabase.from('listings').update(updates).eq('id', listingId).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating listing:', error.message);
    return null;
  }
}

export async function deleteListing(listingId) {
  try {
    const { error } = await supabase.from('listings').delete().eq('id', listingId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting listing:', error.message);
    return { success: false, error: error.message };
  }
}

export async function searchListings(searchTerm) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        id,
        title,
        price,
        currency,
        image_urls,
        seller:profiles(id, name)
      `)
      .textSearch('search_text', `${searchTerm}:*`);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching listings:', error.message);
    return [];
  }
}

// --- Social & Call Functions ---

export async function followUser(followerId, followingId) {
  try {
    const { data, error } = await supabase.from('followers').insert([{ follower_id: followerId, following_id: followingId }]);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error following user:', error.message);
    return null;
  }
}

export async function unfollowUser(followerId, followingId) {
  try {
    const { data, error } = await supabase.from('followers').delete().match({ follower_id: followerId, following_id: followingId });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error unfollowing user:', error.message);
    return null;
  }
}

export async function blockUser(blockerId, blockedId) {
    try {
        const { data, error } = await supabase.from('blocked_users').insert([{ blocker_id: blockerId, blocked_id: blockedId }]);
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error blocking user:', error.message);
        return null;
    }
}

export async function reportUser(reporterId, reportedId, reason) {
    try {
        const { data, error } = await supabase.from('reports').insert([{ reporter_id: reporterId, reported_id: reportedId, reason: reason }]);
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error reporting user:', error.message);
        return null;
    }
}

export async function sendIncomingCallSignal(callerId, receiverId, matchId) {
    const channel = supabase.channel(`user-calls-${receiverId}`);
    return await channel.send({
        type: 'broadcast',
        event: 'incoming-call',
        payload: { callerId, matchId },
    });
}

export async function findFriendsFromContacts(contacts) {
  try {
    const { data, error } = await supabase.functions.invoke('find-friends-from-contacts', {
      body: { contacts },
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error finding friends from contacts:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        type,
        created_at,
        is_read,
        payload
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    return [];
  }
}


// --- Group Chat Functions ---

export async function getGroupsForUser(userId) {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        avatar_url,
        group_members!inner(user_id)
      `)
      .eq('group_members.user_id', userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching groups for user:', error.message);
    return [];
  }
}

// --- Advertisement Functions ---

export async function getAdvertisements() {
  try {
    const { data, error } = await supabase.from('advertisements').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching advertisements:', error.message);
    return [];
  }
}

export async function uploadAdImage(file) {
  try {
    const filePath = `public/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('ad-images').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('ad-images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading ad image:', error.message);
    return null;
  }
}

export async function createAdvertisement(adData) {
  try {
    const { data, error } = await supabase.from('advertisements').insert([adData]).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating advertisement:', error.message);
    return null;
  }
}

export async function updateAdvertisement(adId, updates) {
  try {
    const { data, error } = await supabase.from('advertisements').update(updates).eq('id', adId).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating advertisement:', error.message);
    return null;
  }
}
