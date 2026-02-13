/**
 * Supabase Client Helpers
 * 
 * Two clients:
 *   1. supabase       — anon/public client (for frontend, auth flows)
 *   2. supabaseAdmin  — service_role client (for server-side admin ops)
 * 
 * Usage:
 *   import { supabase, supabaseAdmin } from './lib/supabase.js';
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Validate env vars at import time
if (!SUPABASE_URL) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in .env');
if (!ANON_KEY) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env');

/**
 * Public client (anon key)
 * - Used for auth flows (signIn, signUp, signOut, getSession)
 * - Respects Row-Level Security (RLS) policies
 * - Safe to use on client-side
 */
export const supabase = createClient(SUPABASE_URL, ANON_KEY);

/**
 * Admin client (service_role key)
 * - Bypasses RLS — full database access
 * - Used ONLY in server-side API routes
 * - NEVER expose this to the client/browser
 */
export const supabaseAdmin = SERVICE_KEY
    ? createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;

export { SUPABASE_URL, ANON_KEY };
