/**
 * MVC Test: Verify Supabase connectivity
 * Tests:
 *   1. Supabase client initializes without crash
 *   2. getSession() returns null (no active session = expected)
 *   3. Anon key can reach the Supabase API (health check)
 *   4. Service key can query auth.users (admin access)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log('\n🔍 === SUPABASE VERIFICATION TESTS ===\n');

// Test 0: Env vars loaded
console.log('--- Test 0: Environment Variables ---');
console.log(`  SUPABASE_URL:  ${SUPABASE_URL ? '✅ loaded' : '❌ MISSING'}`);
console.log(`  ANON_KEY:      ${ANON_KEY ? '✅ loaded (' + ANON_KEY.substring(0, 20) + '...)' : '❌ MISSING'}`);
console.log(`  SERVICE_KEY:   ${SERVICE_KEY ? '✅ loaded (' + SERVICE_KEY.substring(0, 20) + '...)' : '❌ MISSING'}`);

if (!SUPABASE_URL || !ANON_KEY) {
    console.log('\n❌ FATAL: Missing env vars. Cannot proceed.');
    process.exit(1);
}

// Test 1: Client init (anon key)
console.log('\n--- Test 1: Create Supabase Client (anon key) ---');
let supabase;
try {
    supabase = createClient(SUPABASE_URL, ANON_KEY);
    console.log('  ✅ Client created successfully');
} catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
    process.exit(1);
}

// Test 2: getSession() returns null
console.log('\n--- Test 2: getSession() (should be null) ---');
try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.log(`  ❌ Error: ${error.message}`);
    } else if (data.session === null) {
        console.log('  ✅ getSession() returned null (no active session — expected)');
    } else {
        console.log(`  ⚠️  Unexpected: session exists — ${JSON.stringify(data.session).substring(0, 80)}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// Test 3: Anon key can reach Supabase REST API
console.log('\n--- Test 3: REST API Health (fetch /rest/v1/) ---');
try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`
        }
    });
    console.log(`  HTTP Status: ${res.status}`);
    if (res.ok || res.status === 200) {
        console.log('  ✅ Supabase REST API reachable');
    } else {
        const body = await res.text();
        console.log(`  ❌ Unexpected status. Body: ${body.substring(0, 200)}`);
    }
} catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
}

// Test 4: Service key — admin list users
console.log('\n--- Test 4: Admin Auth (service key — list users) ---');
if (SERVICE_KEY) {
    try {
        const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false }
        });
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 5 });
        if (error) {
            console.log(`  ❌ Error: ${error.message}`);
        } else {
            console.log(`  ✅ Admin access works. Found ${data.users.length} user(s)`);
            data.users.forEach(u => console.log(`     - ${u.email || u.id}`));
        }
    } catch (err) {
        console.log(`  ❌ FAILED: ${err.message}`);
    }
} else {
    console.log('  ⏭️  Skipped (no SERVICE_KEY)');
}

// Test 5: Check if Google OAuth provider is configured
console.log('\n--- Test 5: Google OAuth Config Check ---');
try {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { skipBrowserRedirect: true }
    });
    if (error) {
        console.log(`  ❌ Google OAuth not configured: ${error.message}`);
    } else if (data?.url) {
        console.log(`  ✅ Google OAuth URL generated successfully`);
        console.log(`     URL starts with: ${data.url.substring(0, 80)}...`);
    }
} catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
}

console.log('\n🏁 === VERIFICATION COMPLETE ===\n');
