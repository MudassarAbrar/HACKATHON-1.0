/**
 * User Profile Route Helpers
 * 
 * Handles user profile CRUD operations using the admin client
 * (bypasses RLS for server-side operations on behalf of authenticated users).
 * 
 * Functions:
 *   - upsertProfile(user) — Create or return profile on login
 *   - getProfile(userId)  — Fetch a user's profile
 *   - updateProfile(userId, updates) — Update profile fields
 */

import { supabaseAdmin } from '../lib/supabase.js';

/**
 * Create a profile for a new user, or return the existing one.
 * Called after successful OAuth login.
 * 
 * @param {{ id: string, email: string, user_metadata?: { full_name?: string, name?: string } }} user
 *   - The Supabase auth user object (from session or getUser)
 * @returns {Promise<{ profile: object|null, error: string|null, isNew: boolean }>}
 */
export async function upsertProfile(user) {
    if (!supabaseAdmin) {
        return { profile: null, error: 'Admin client not available (missing service key)', isNew: false };
    }

    if (!user?.id || !user?.email) {
        return { profile: null, error: 'User object must have id and email', isNew: false };
    }

    try {
        // Check if profile already exists
        const { data: existing, error: selectError } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (selectError) {
            return { profile: null, error: `Select failed: ${selectError.message}`, isNew: false };
        }

        // Return existing profile
        if (existing) {
            return { profile: existing, error: null, isNew: false };
        }

        // Create new profile with defaults
        const name = user.user_metadata?.full_name
            || user.user_metadata?.name
            || user.email.split('@')[0];

        const { data: newProfile, error: insertError } = await supabaseAdmin
            .from('user_profiles')
            .insert({
                id: user.id,
                email: user.email,
                name,
            })
            .select()
            .single();

        if (insertError) {
            return { profile: null, error: `Insert failed: ${insertError.message}`, isNew: false };
        }

        return { profile: newProfile, error: null, isNew: true };
    } catch (err) {
        return { profile: null, error: `Unexpected error: ${err.message}`, isNew: false };
    }
}

/**
 * Fetch a user's profile by their auth ID.
 * 
 * @param {string} userId - The user's auth.users.id (UUID)
 * @returns {Promise<{ profile: object|null, error: string|null }>}
 */
export async function getProfile(userId) {
    if (!supabaseAdmin) {
        return { profile: null, error: 'Admin client not available' };
    }

    if (!userId) {
        return { profile: null, error: 'userId is required' };
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            return { profile: null, error: error.message };
        }

        return { profile: data, error: null };
    } catch (err) {
        return { profile: null, error: `Fetch failed: ${err.message}` };
    }
}

/**
 * Update a user's profile fields.
 * 
 * @param {string} userId - The user's auth.users.id (UUID)
 * @param {object} updates - Fields to update (name, vibe_profile, etc.)
 * @returns {Promise<{ profile: object|null, error: string|null }>}
 */
export async function updateProfile(userId, updates) {
    if (!supabaseAdmin) {
        return { profile: null, error: 'Admin client not available' };
    }

    if (!userId) {
        return { profile: null, error: 'userId is required' };
    }

    if (!updates || Object.keys(updates).length === 0) {
        return { profile: null, error: 'No updates provided' };
    }

    // Prevent overwriting protected fields
    const { id, created_at, ...safeUpdates } = updates;
    safeUpdates.updated_at = new Date().toISOString();

    try {
        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .update(safeUpdates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            return { profile: null, error: error.message };
        }

        return { profile: data, error: null };
    } catch (err) {
        return { profile: null, error: `Update failed: ${err.message}` };
    }
}
