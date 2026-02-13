/**
 * Auth Helpers
 * 
 * Utility functions for protecting API routes and verifying users.
 * Used by backend API routes that require authentication.
 */

import { supabase, supabaseAdmin } from './supabase.js';

/**
 * Get the authenticated user from an access token (JWT).
 * 
 * @param {string} accessToken - The Supabase JWT from the Authorization header
 * @returns {Promise<{user: object|null, error: string|null}>}
 * 
 * Usage:
 *   const token = req.headers.authorization?.replace('Bearer ', '');
 *   const { user, error } = await getUser(token);
 */
export async function getUser(accessToken) {
    if (!accessToken) {
        return { user: null, error: 'No access token provided' };
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);

        if (error) {
            return { user: null, error: error.message };
        }

        return { user, error: null };
    } catch (err) {
        return { user: null, error: `Token verification failed: ${err.message}` };
    }
}

/**
 * Middleware-style helper: require authentication on an API route.
 * Extracts token from Authorization header, verifies it, returns user.
 * 
 * @param {Request} req - The incoming request object
 * @returns {Promise<{user: object|null, error: string|null, status: number}>}
 * 
 * Usage:
 *   const { user, error, status } = await requireAuth(req);
 *   if (error) return Response.json({ error }, { status });
 */
export async function requireAuth(req) {
    const authHeader = req.headers.get?.('authorization')
        || req.headers?.authorization
        || '';

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
        return { user: null, error: 'Missing Authorization header', status: 401 };
    }

    const { user, error } = await getUser(token);

    if (error) {
        return { user: null, error, status: 401 };
    }

    return { user, error: null, status: 200 };
}

/**
 * Get a user's profile by their auth ID (admin access).
 * Uses service_role key to bypass RLS.
 * 
 * @param {string} userId - The user's auth.users.id
 * @returns {Promise<{user: object|null, error: string|null}>}
 */
export async function getUserById(userId) {
    if (!supabaseAdmin) {
        return { user: null, error: 'Admin client not available (missing service key)' };
    }

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);

        if (error) {
            return { user: null, error: error.message };
        }

        return { user, error: null };
    } catch (err) {
        return { user: null, error: `Admin lookup failed: ${err.message}` };
    }
}

/**
 * Sign out a user by invalidating their session.
 * 
 * @param {string} accessToken - The user's JWT
 * @returns {Promise<{error: string|null}>}
 */
export async function signOut(accessToken) {
    if (!supabaseAdmin) {
        return { error: 'Admin client not available' };
    }

    try {
        // Use admin to sign out — more reliable than client-side signOut
        const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);
        return { error: error?.message || null };
    } catch (err) {
        return { error: `Sign out failed: ${err.message}` };
    }
}
