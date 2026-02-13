/**
 * Phase 5 Test Script — Cart & Checkout
 *
 * Tests:
 * 1. Cart operations (add, get, update, remove, clear)
 * 2. Coupon generation and validation
 * 3. Checkout flow (order creation, purchase_history update)
 * 4. AI add_to_cart tool call integration
 */

import 'dotenv/config';
import { addToCart, getCart, removeFromCart, updateCartQuantity, clearCart } from './routes/cart.js';
import { createCoupon, validateCoupon, checkout, getPurchaseHistory } from './routes/checkout.js';
import { handleClerkMessage } from './routes/clerk.js';
import { supabaseAdmin } from './lib/supabase.js';

// Test user ID (find existing user from auth.users or skip)
let TEST_USER_ID = null;

console.log('\n🔍 === PHASE 5: CART & CHECKOUT TESTS ===\n');

// Find an existing auth user for testing
async function setupTestUser() {
    // Try to find an existing auth user
    const { data: authUsers, error: authError } = await supabaseAdmin
        .auth.admin.listUsers({ page: 1, perPage: 10 });

    if (authError || !authUsers?.users || authUsers.users.length === 0) {
        throw new Error('No auth users found. Create a user via Supabase Auth first.');
    }

    TEST_USER_ID = authUsers.users[0].id;
    console.log(`  ℹ️  Using existing user: ${TEST_USER_ID.slice(0, 8)}...`);

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('id', TEST_USER_ID)
        .single();

    if (!existingProfile) {
        // Create profile for this auth user
        const { error: insertError } = await supabaseAdmin
            .from('user_profiles')
            .insert({
                id: TEST_USER_ID,
                email: authUsers.users[0].email,
                name: 'Test User',
                vibe_profile: {},
                active_cart: [],
                purchase_history: []
            });

        if (insertError) throw new Error(`Profile creation failed: ${insertError.message}`);
    } else {
        // Clear existing cart and history
        await supabaseAdmin
            .from('user_profiles')
            .update({ active_cart: [], purchase_history: [] })
            .eq('id', TEST_USER_ID);
    }
}

async function cleanupTestUser() {
    if (!TEST_USER_ID) return;
    // Just clear cart and history, don't delete profile
    await supabaseAdmin
        .from('user_profiles')
        .update({ active_cart: [], purchase_history: [] })
        .eq('id', TEST_USER_ID);
}

async function runTests() {
    try {
        await setupTestUser();
    } catch (err) {
        console.log(`\n❌ Setup failed: ${err.message}`);
        console.log('  ℹ️  Create a user in Supabase Auth first (signup via your app).\n');
        process.exit(1);
    }

    // ─── Test 1: Add to Cart ───
    console.log('--- Test 1: addToCart() ---');
    try {
        const result = await addToCart(TEST_USER_ID, 1, 2, 'M', 'Blue');

        console.log('  ✅ Item added');
        console.log(`  ✅ Cart has ${result.item_count} items`);
        console.log(`  ✅ Subtotal: $${result.subtotal}`);

        if (result.items.length !== 1) throw new Error('Expected 1 item in cart');
        if (result.items[0].quantity !== 2) throw new Error('Expected quantity 2');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 2: Add Same Product → Update Quantity ───
    console.log('\n--- Test 2: addToCart() same product → quantity update ---');
    try {
        const result = await addToCart(TEST_USER_ID, 1, 1, 'M', 'Blue');

        console.log('  ✅ Quantity updated');
        console.log(`  ✅ New quantity: ${result.items[0].quantity}`);

        if (result.items.length !== 1) throw new Error('Expected still 1 item');
        if (result.items[0].quantity !== 3) throw new Error('Expected quantity 3');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 3: Add Different Product ───
    console.log('\n--- Test 3: addToCart() different product ---');
    try {
        const result = await addToCart(TEST_USER_ID, 5, 1);

        console.log('  ✅ Second product added');
        console.log(`  ✅ Cart has ${result.item_count} items`);

        if (result.items.length !== 2) throw new Error('Expected 2 items');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 4: Get Cart ───
    console.log('\n--- Test 4: getCart() ---');
    try {
        const cart = await getCart(TEST_USER_ID);

        console.log('  ✅ Cart retrieved');
        console.log(`  ✅ Items: ${cart.items.length}`);
        console.log(`  ✅ Total items: ${cart.item_count}`);
        console.log(`  ✅ Subtotal: $${cart.subtotal}`);

        if (!cart.items[0].name) throw new Error('Product name missing');
        if (!cart.items[0].price) throw new Error('Product price missing');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 5: Update Quantity ───
    console.log('\n--- Test 5: updateCartQuantity() ---');
    try {
        const result = await updateCartQuantity(TEST_USER_ID, 1, 1, 'M', 'Blue');

        console.log('  ✅ Quantity updated to 1');

        if (result.items[0].quantity !== 1) throw new Error('Expected quantity 1');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 6: Remove from Cart ───
    console.log('\n--- Test 6: removeFromCart() ---');
    try {
        const result = await removeFromCart(TEST_USER_ID, 5);

        console.log('  ✅ Product removed');
        console.log(`  ✅ Remaining items: ${result.items.length}`);

        if (result.items.length !== 1) throw new Error('Expected 1 item left');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 7: Coupon Generation ───
    console.log('\n--- Test 7: createCoupon() ---');
    let testCoupon = null;
    try {
        testCoupon = createCoupon(TEST_USER_ID, 'test-session', 20, 'birthday', 15);

        console.log('  ✅ Coupon created');
        console.log(`  ✅ Code: ${testCoupon.code}`);
        console.log(`  ✅ Discount: ${testCoupon.percentage}%`);
        console.log(`  ✅ Expires in: ${testCoupon.expiryMinutes} min`);

        if (!testCoupon.code.startsWith('BIRTHDAY-20-')) throw new Error('Invalid coupon format');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 8: Coupon Validation (Valid) ───
    console.log('\n--- Test 8: validateCoupon() — valid ---');
    try {
        const validation = validateCoupon(testCoupon.code, TEST_USER_ID, 'test-session');

        console.log('  ✅ Coupon valid');
        console.log(`  ✅ Percentage: ${validation.percentage}%`);
        console.log(`  ✅ Reason: ${validation.reason}`);

        if (!validation.valid) throw new Error('Expected coupon to be valid');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 9: Coupon Validation (Invalid Code) ───
    console.log('\n--- Test 9: validateCoupon() — invalid code ---');
    try {
        const validation = validateCoupon('FAKE-COUPON', TEST_USER_ID);

        console.log('  ✅ Correctly rejected');
        console.log(`  ✅ Error: ${validation.error}`);

        if (validation.valid) throw new Error('Expected coupon to be invalid');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 10: Checkout (with Coupon) ───
    console.log('\n--- Test 10: checkout() with coupon ---');
    try {
        const order = await checkout(TEST_USER_ID, testCoupon.code);

        console.log('  ✅ Checkout successful');
        console.log(`  ✅ Order ID: ${order.order_id}`);
        console.log(`  ✅ Subtotal: $${order.subtotal}`);
        console.log(`  ✅ Discount: ${order.discount_percentage}% (-$${order.discount_amount})`);
        console.log(`  ✅ Total: $${order.total}`);
        console.log(`  ✅ Savings: $${order.savings}`);

        if (!order.order_id.startsWith('ORD-')) throw new Error('Invalid order ID format');
        if (order.discount_percentage !== 20) throw new Error('Expected 20% discount');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 11: Cart Cleared After Checkout ───
    console.log('\n--- Test 11: Cart cleared after checkout ---');
    try {
        const cart = await getCart(TEST_USER_ID);

        console.log('  ✅ Cart is empty');

        if (cart.items.length !== 0) throw new Error('Expected empty cart');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 12: Purchase History ───
    console.log('\n--- Test 12: getPurchaseHistory() ---');
    try {
        const history = await getPurchaseHistory(TEST_USER_ID);

        console.log('  ✅ Purchase history retrieved');
        console.log(`  ✅ Orders: ${history.length}`);

        if (history.length !== 1) throw new Error('Expected 1 order');
        if (!history[0].order_id) throw new Error('Missing order_id');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 13: Coupon Already Used ───
    console.log('\n--- Test 13: validateCoupon() — already used ---');
    try {
        const validation = validateCoupon(testCoupon.code, TEST_USER_ID);

        console.log('  ✅ Correctly rejected (already used)');

        if (validation.valid) throw new Error('Expected used coupon to be invalid');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 14: Checkout Empty Cart → Error ───
    console.log('\n--- Test 14: checkout() with empty cart → error ---');
    try {
        await checkout(TEST_USER_ID);
        console.log('  ❌ Should have thrown error');
    } catch (err) {
        if (err.message.includes('Cart is empty')) {
            console.log('  ✅ Correctly rejected empty cart');
        } else {
            console.log(`  ❌ Wrong error: ${err.message}`);
        }
    }

    // ─── Test 15: Clear Cart ───
    console.log('\n--- Test 15: clearCart() ---');
    try {
        // Add items first
        await addToCart(TEST_USER_ID, 10, 1);
        await addToCart(TEST_USER_ID, 11, 2);

        const result = await clearCart(TEST_USER_ID);

        console.log('  ✅ Cart cleared');
        console.log(`  ✅ Items: ${result.items.length}`);

        if (result.items.length !== 0) throw new Error('Expected empty cart');
    } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
    }

    // ─── Test 16: AI Integration (add_to_cart tool) ───
    console.log('\n--- Test 16: AI add_to_cart tool call ---');
    const e2eFlag = process.argv.includes('--e2e');
    if (e2eFlag) {
        console.log('  ℹ️  Requires: FastAPI on :8000 + valid AI key');
        try {
            await clearCart(TEST_USER_ID);

            const aiResponse = await handleClerkMessage({
                userId: TEST_USER_ID,
                message: 'Add product ID 1 to my cart',
                conversationHistory: []
            });

            console.log(`  ✅ Provider: ${aiResponse.provider}`);
            console.log(`  ✅ Tool calls: ${aiResponse.toolCalls?.length || 0}`);
            console.log(`  ✅ Cart updated: ${aiResponse.cartUpdated}`);
            console.log(`  ✅ Cart items: ${aiResponse.cartItemCount}`);

            if (!aiResponse.cartUpdated) {
                console.log('  ⚠️  Cart not updated (AI did not call add_to_cart)');
            }
        } catch (err) {
            console.log(`  ❌ Error: ${err.message}`);
        }
    } else {
        console.log('  ⏭️  Skipping E2E test. Use --e2e to run.');
    }

    // Cleanup
    await cleanupTestUser();

    console.log('\n🏁 === ALL PHASE 5 TESTS COMPLETE ===\n');
}

runTests().catch(err => {
    console.error(`\n💥 Fatal error: ${err.message}\n`);
    process.exit(1);
});
