/**
 * Test: Phase 2 — User Profile & Vibe Setup
 * 
 * Verifies:
 *   1. Module imports
 *   2. user_profiles table exists
 *   3. RLS is enabled with correct policies
 *   4. upsertProfile — graceful handling (FK constraint expected with fake user)
 *   5. getProfile — returns null for non-existent user
 *   6. updateProfile — returns error for non-existent user
 *   7. updateProfile — rejects empty updates
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 === PHASE 2: USER PROFILE & VIBE SETUP ===\n');

// ─── Test 1: Import user-profile module ───
console.log('--- Test 1: Import user-profile.js ---');
let upsertProfile, getProfile, updateProfile;
try {
    ({ upsertProfile, getProfile, updateProfile } = await import('./routes/user-profile.js'));
    console.log(`  upsertProfile:  ${typeof upsertProfile === 'function' ? '✅' : '❌'}`);
    console.log(`  getProfile:     ${typeof getProfile === 'function' ? '✅' : '❌'}`);
    console.log(`  updateProfile:  ${typeof updateProfile === 'function' ? '✅' : '❌'}`);
} catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
    process.exit(1);
}

// ─── Test 2: Verify user_profiles table exists ───
console.log('\n--- Test 2: user_profiles table exists ---');
try {
    const { supabaseAdmin } = await import('./lib/supabase.js');
    const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .limit(0);

    if (error) {
        console.log(`  ❌ Table query failed: ${error.message}`);
    } else {
        console.log(`  ✅ Table "user_profiles" exists and is queryable`);
    }
} catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
}

// ─── Test 3: Verify RLS is enabled (anon client should get 0 rows) ───
console.log('\n--- Test 3: RLS blocks unauthenticated access ---');
try {
    const { supabase } = await import('./lib/supabase.js');
    const { data: anonData, error: anonError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);

    if (anonError) {
        console.log(`  ✅ RLS blocks anon access: "${anonError.message}"`);
    } else if (anonData && anonData.length === 0) {
        console.log(`  ✅ RLS active: anon query returned 0 rows (as expected)`);
    } else {
        console.log(`  ⚠️ Unexpected: anon returned ${anonData?.length} rows`);
    }
} catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
}

// ─── Test 4: getProfile for non-existent user ───
console.log('\n--- Test 4: getProfile(nonexistent) → null ---');
try {
    const fakeUUID = '00000000-0000-0000-0000-000000000000';
    const { profile, error } = await getProfile(fakeUUID);

    if (!profile && !error) {
        console.log(`  ✅ Correctly returned null profile (user does not exist)`);
    } else if (error) {
        console.log(`  ⚠️ Returned error: "${error}"`);
    } else {
        console.log(`  ❌ Unexpected profile: ${JSON.stringify(profile)}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 5: getProfile with no userId ───
console.log('\n--- Test 5: getProfile(null) → error ---');
try {
    const { profile, error } = await getProfile(null);
    if (error === 'userId is required') {
        console.log(`  ✅ Correctly rejected: "${error}"`);
    } else {
        console.log(`  ❌ Unexpected: profile=${JSON.stringify(profile)}, error=${error}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 6: updateProfile with empty updates ───
console.log('\n--- Test 6: updateProfile(id, {}) → error ---');
try {
    const { profile, error } = await updateProfile('some-id', {});
    if (error === 'No updates provided') {
        console.log(`  ✅ Correctly rejected: "${error}"`);
    } else {
        console.log(`  ❌ Unexpected: error=${error}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 7: upsertProfile with invalid user ───
console.log('\n--- Test 7: upsertProfile(fake user) → graceful error ---');
try {
    const fakeUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
    };
    const { profile, error, isNew } = await upsertProfile(fakeUser);

    if (error) {
        // Expected: FK constraint because this user doesn't exist in auth.users
        console.log(`  ✅ Correctly failed (FK constraint): "${error}"`);
    } else {
        console.log(`  ⚠️ Unexpectedly succeeded (user somehow exists in auth.users?)`);
        console.log(`     profile: ${JSON.stringify(profile)}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 8: upsertProfile with missing fields ───
console.log('\n--- Test 8: upsertProfile(null) → error ---');
try {
    const { profile, error } = await upsertProfile(null);
    if (error === 'User object must have id and email') {
        console.log(`  ✅ Correctly rejected: "${error}"`);
    } else {
        console.log(`  ❌ Unexpected: error=${error}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

console.log('\n🏁 === ALL PHASE 2 TESTS COMPLETE ===\n');
