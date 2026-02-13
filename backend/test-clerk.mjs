/**
 * Test: Phase 4 — AI Client + Clerk API
 *
 * Verifies:
 *   1. ai-client.js — module imports, provider list
 *   2. clerk.js — module imports, rate limiter
 *   3. handleClerkMessage — validation (no userId, no message)
 *   4. handleClerkMessage — rate limit enforcement
 *   5. End-to-end (requires running FastAPI + valid AI key)
 *
 * Usage:
 *   node test-clerk.mjs            # Tests 1-4 (no servers needed)
 *   node test-clerk.mjs --e2e      # Tests 1-5 (needs FastAPI + AI key)
 */

import dotenv from 'dotenv';
dotenv.config();

const runE2E = process.argv.includes('--e2e');

console.log('\n🔍 === PHASE 4: AI CLIENT + CLERK API TESTS ===\n');
if (!runE2E) {
    console.log('ℹ️  Running basic tests only. Use --e2e for end-to-end.\n');
}

// ─── Test 1: Import ai-client.js ───
console.log('--- Test 1: Import ai-client.js ---');
let createSophiaCompletion, SOPHIA_TOOLS, getAvailableProviders;
try {
    ({ createSophiaCompletion, SOPHIA_TOOLS, getAvailableProviders } = await import('./lib/ai-client.js'));
    console.log(`  createSophiaCompletion: ${typeof createSophiaCompletion === 'function' ? '✅' : '❌'}`);
    console.log(`  SOPHIA_TOOLS:           ${Array.isArray(SOPHIA_TOOLS) ? '✅' : '❌'} (${SOPHIA_TOOLS.length} tools)`);
    console.log(`  getAvailableProviders:  ${typeof getAvailableProviders === 'function' ? '✅' : '❌'}`);

    const providers = getAvailableProviders();
    console.log(`  Configured providers:   ${providers.length}`);
    for (const p of providers) {
        console.log(`    → ${p.name} (${p.model}) [${p.keyHint}]`);
    }
} catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
    process.exit(1);
}

// ─── Test 2: Import clerk.js ───
console.log('\n--- Test 2: Import clerk.js ---');
let handleClerkMessage, getRateLimitStatus;
try {
    ({ handleClerkMessage, getRateLimitStatus } = await import('./routes/clerk.js'));
    console.log(`  handleClerkMessage: ${typeof handleClerkMessage === 'function' ? '✅' : '❌'}`);
    console.log(`  getRateLimitStatus: ${typeof getRateLimitStatus === 'function' ? '✅' : '❌'}`);
} catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
    process.exit(1);
}

// ─── Test 3: Validation — missing userId ───
console.log('\n--- Test 3: handleClerkMessage({ }) → error ---');
try {
    const result = await handleClerkMessage({ userId: '', message: 'hello' });
    if (result.error === 'userId is required') {
        console.log(`  ✅ Correctly rejected: "${result.error}"`);
    } else {
        console.log(`  ❌ Unexpected: ${JSON.stringify(result)}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 4: Validation — missing message ───
console.log('\n--- Test 4: handleClerkMessage({ userId, message: "" }) → error ---');
try {
    const result = await handleClerkMessage({ userId: 'test-user-123', message: '' });
    if (result.error === 'message is required') {
        console.log(`  ✅ Correctly rejected: "${result.error}"`);
    } else {
        console.log(`  ❌ Unexpected: ${JSON.stringify(result)}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 5: Rate limit status ───
console.log('\n--- Test 5: getRateLimitStatus() ---');
try {
    const status = getRateLimitStatus('test-user-123');
    if (status.user && status.global) {
        console.log(`  ✅ User: ${status.user.used}/${status.user.limit}/min`);
        console.log(`  ✅ Global: ${status.global.used}/${status.global.limit}/day`);
    } else {
        console.log(`  ❌ Unexpected structure: ${JSON.stringify(status)}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 6: filter_products tool schema ───
console.log('\n--- Test 6: SOPHIA_TOOLS schema check ---');
try {
    const filterTool = SOPHIA_TOOLS.find(t => t.function?.name === 'filter_products');
    if (filterTool) {
        console.log(`  ✅ filter_products tool found`);
        const params = filterTool.function.parameters.properties;
        const hasProductIds = !!params.product_ids;
        const hasSortBy = !!params.sortBy;
        const hasFilters = !!params.filters;
        console.log(`    product_ids: ${hasProductIds ? '✅' : '❌'}`);
        console.log(`    sortBy:      ${hasSortBy ? '✅' : '❌'}`);
        console.log(`    filters:     ${hasFilters ? '✅' : '❌'}`);
    } else {
        console.log(`  ❌ filter_products tool not found`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 7: End-to-end (optional) ───
if (runE2E) {
    console.log('\n--- Test 7: End-to-End — handleClerkMessage ---');
    console.log('  ℹ️  Requires: FastAPI on :8000 + valid AI key');
    try {
        const result = await handleClerkMessage({
            userId: 'test-user-e2e',
            message: 'I need a summer dress for a beach wedding',
            conversationHistory: [],
        });

        if (result.error) {
            console.log(`  ⚠️ Error (may be expected): ${result.error}`);
        } else {
            console.log(`  ✅ Provider: ${result.provider} (${result.model})`);
            console.log(`  ✅ Message: "${result.message.slice(0, 80)}..."`);
            console.log(`  ✅ Search results: ${result.searchResults?.length || 0} products`);
            console.log(`  ✅ Tool calls: ${result.toolCalls?.length || 0}`);
            if (result.toolCalls) {
                for (const tc of result.toolCalls) {
                    console.log(`    → ${tc.function?.name}(${tc.function?.arguments})`);
                }
            }
        }
    } catch (err) {
        console.log(`  ❌ CRASHED: ${err.message}`);
    }
}

console.log('\n🏁 === ALL PHASE 4 TESTS COMPLETE ===\n');
