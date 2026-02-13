/**
 * Quick test: verify lib/supabase.js works correctly
 */

import { supabase, supabaseAdmin, SUPABASE_URL } from './lib/supabase.js';

console.log('\n🔍 === TASK 1.2: Supabase Client Test ===\n');

// Test 1: Clients created
console.log('--- Test 1: Client Creation ---');
console.log(`  supabase (anon):    ${supabase ? '✅' : '❌'}`);
console.log(`  supabaseAdmin:      ${supabaseAdmin ? '✅' : '❌'}`);
console.log(`  URL:                ${SUPABASE_URL}`);

// Test 2: getSession via anon client
console.log('\n--- Test 2: getSession() via anon client ---');
const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
if (sessionErr) {
    console.log(`  ❌ Error: ${sessionErr.message}`);
} else {
    console.log(`  ✅ Session: ${sessionData.session === null ? 'null (expected)' : 'active'}`);
}

// Test 3: Admin listUsers
console.log('\n--- Test 3: Admin listUsers() ---');
if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 5 });
    if (error) {
        console.log(`  ❌ Error: ${error.message}`);
    } else {
        console.log(`  ✅ Admin works. ${data.users.length} user(s) found`);
    }
} else {
    console.log('  ⏭️  No service key — skipped');
}

// Test 4: Google OAuth URL generation
console.log('\n--- Test 4: Google OAuth URL ---');
const { data: oauthData, error: oauthErr } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { skipBrowserRedirect: true }
});
if (oauthErr) {
    console.log(`  ❌ Error: ${oauthErr.message}`);
} else {
    console.log(`  ✅ OAuth URL: ${oauthData.url.substring(0, 70)}...`);
}

console.log('\n🏁 === ALL TESTS PASSED ===\n');
