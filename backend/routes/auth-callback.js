/**
 * Auth Callback Handler
 * 
 * Handles the OAuth callback from Supabase/Google.
 * Exchanges the authorization code for a session.
 * 
 * In a Next.js app, this would be used in:
 *   app/auth/callback/route.js (App Router)
 * 
 * Flow:
 *   1. User clicks "Sign in with Google"
 *   2. Supabase redirects to Google OAuth
 *   3. Google redirects back to /auth/callback?code=...
 *   4. This handler exchanges the code for a session
 *   5. Redirect user to homepage (logged in)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Exchange an OAuth authorization code for a Supabase session.
 * 
 * @param {string} code - The authorization code from the OAuth callback URL
 * @returns {Promise<{session: object|null, user: object|null, error: string|null}>}
 */
export async function handleAuthCallback(code) {
    if (!code) {
        return { session: null, user: null, error: 'Missing authorization code' };
    }

    const supabase = createClient(SUPABASE_URL, ANON_KEY);

    try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            return {
                session: null,
                user: null,
                error: error.message,
            };
        }

        return {
            session: data.session,
            user: data.user,
            error: null,
        };
    } catch (err) {
        return {
            session: null,
            user: null,
            error: `Unexpected error: ${err.message}`,
        };
    }
}

/**
 * Generate the Google OAuth login URL.
 * 
 * @param {string} [redirectTo] - Where to redirect after successful auth
 * @returns {Promise<{url: string|null, error: string|null}>}
 */
export async function getGoogleOAuthURL(redirectTo = '/') {
    const supabase = createClient(SUPABASE_URL, ANON_KEY);

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${SUPABASE_URL}/auth/v1/callback`,
            skipBrowserRedirect: true,
        },
    });

    if (error) {
        return { url: null, error: error.message };
    }

    return { url: data.url, error: null };
}
