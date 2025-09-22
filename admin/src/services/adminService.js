import { supabase } from '../supabaseClient';

// Note: These functions assume the person calling them is an admin
// with appropriate permissions. The RLS policies for reading all profiles
// would need to be adjusted to allow admins to bypass user-specific rules.
// This often involves creating a "security definer" function in the database.
// For simplicity here, we assume the admin has broad read access.

/**
 * Fetches a paginated list of all users.
 */
export async function getAllUsers(page = 1, perPage = 20) {
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .range((page - 1) * perPage, page * perPage - 1);

  if (error) {
    console.error('Error fetching users:', error);
    return { users: [], count: 0 };
  }
  return { users: data, count };
}

/**
 * Updates a user's profile data. Can be used to ban/unban.
 * Note: A 'banned' status would need to be added to the profiles table.
 * This is a placeholder for that logic.
 */
export async function updateUserProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Error updating user:', error);
        return null;
    }
    return data;
}

/**
 * Fetches all pending KYC documents.
 */
export async function getPendingKycDocs() {
    const { data, error } = await supabase
        .from('kyc_documents')
        .select('*, user:profiles(name, email)')
        .eq('status', 'pending');

    if (error) {
        console.error('Error fetching KYC docs:', error);
        return [];
    }
    return data;
}

/**
 * Updates the status of a KYC document and the user's profile.
 */
export async function updateKycStatus(docId, userId, newStatus) {
    // This should ideally be a single database function (RPC) for atomicity

    // 1. Update the document status
    const { error: docError } = await supabase
        .from('kyc_documents')
        .update({ status: newStatus, reviewed_at: new Date() })
        .eq('id', docId);

    if (docError) {
        console.error('Error updating KYC doc status:', docError);
        return null;
    }

    // 2. Update the profile status
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ kyc_status: newStatus })
        .eq('id', userId);

    if (profileError) {
        console.error('Error updating profile KYC status:', profileError);
        // Here you might want to roll back the previous update
        return null;
    }

    return { success: true };
}

/**
 * Fetches all user reports.
 */
export async function getReports() {
    const { data, error } = await supabase
        .from('reports')
        .select('*, reporter:profiles(name), reported:profiles(name)')
        .eq('status', 'pending');

    if (error) {
        console.error('Error fetching reports:', error);
        return [];
    }
    return data;
}
