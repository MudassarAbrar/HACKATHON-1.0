/**
 * Test: Verify auth flow modules load and work correctly
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 === TASKS 1.3–1.7: AUTH FLOW VERIFICATION ===\n');

// Test 1: Import auth-callback module
console.log('--- Test 1: Import auth-callback.js ---');
try {
    const { handleAuthCallback, getGoogleOAuthURL } = await import('./routes/auth-callback.js');
    console.log(`  handleAuthCallback: ${typeof handleAuthCallback === 'function' ? '✅' : '❌'}`);
    console.log(`  getGoogleOAuthURL:  ${typeof getGoogleOAuthURL === 'function' ? '✅' : '❌'}`);
} catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
}

// Test 2: Import auth-helpers module
console.log('\n--- Test 2: Import auth-helpers.js ---');
try {
    const { getUser, requireAuth, getUserById, signOut } = await import('./lib/auth-helpers.js');
    console.log(`  getUser:      ${typeof getUser === 'function' ? '✅' : '❌'}`);
    console.log(`  requireAuth:  ${typeof requireAuth === 'function' ? '✅' : '❌'}`);
    console.log(`  getUserById:  ${typeof getUserById === 'function' ? '✅' : '❌'}`);
    console.log(`  signOut:      ${typeof signOut === 'function' ? '✅' : '❌'}`);
} catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
}

// Test 3: Generate Google OAuth URL
console.log('\n--- Test 3: Generate Google OAuth URL ---');
try {
    const { getGoogleOAuthURL } = await import('./routes/auth-callback.js');
    const { url, error } = await getGoogleOAuthURL('/');
    if (error) {
        console.log(`  ❌ Error: ${error}`);
    } else {
        console.log(`  ✅ OAuth URL: ${url.substring(0, 80)}...`);
    }
} catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
}

// Test 4: handleAuthCallback with no code (should return error gracefully)
console.log('\n--- Test 4: handleAuthCallback(null) — graceful error ---');
try {
    const { handleAuthCallback } = await import('./routes/auth-callback.js');
    const result = await handleAuthCallback(null);
    if (result.error === 'Missing authorization code') {
        console.log(`  ✅ Correctly rejected: "${result.error}"`);
    } else {
        console.log(`  ❌ Unexpected: ${JSON.stringify(result)}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// Test 5: getUser with invalid token (should return error gracefully)
console.log('\n--- Test 5: getUser("bad_token") — graceful error ---');
try {
    const { getUser } = await import('./lib/auth-helpers.js');
    const { user, error } = await getUser('bad_token_12345');
    if (error) {
        console.log(`  ✅ Correctly rejected: "${error}"`);
    } else {
        console.log(`  ❌ Should have failed but got user: ${JSON.stringify(user)}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// Test 6: requireAuth with no header (should return 401)
console.log('\n--- Test 6: requireAuth(no header) — returns 401 ---');
try {
    const { requireAuth } = await import('./lib/auth-helpers.js');
    const fakeReq = { headers: { get: () => null } };
    const { error, status } = await requireAuth(fakeReq);
    if (status === 401 && error) {
        console.log(`  ✅ Correctly returned 401: "${error}"`);
    } else {
        console.log(`  ❌ Unexpected: status=${status}, error=${error}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

console.log('\n🏁 === ALL AUTH TESTS COMPLETE ===\n');
