import { supabaseAdmin } from '../lib/supabase.js';
import { getCart, clearCart } from './cart.js';

// In-memory coupon store for hackathon
// Format: { couponCode: { userId, sessionId, percentage, reason, expiresAt, used } }
const couponStore = new Map();

/**
 * Generate unique coupon code
 * @param {string} reason - Reason for discount (birthday, bulk, student, etc.)
 * @param {number} percentage - Discount percentage
 * @returns {string} Coupon code in format REASON-XX-SUFFIX
 */
export function generateCouponCode(reason, percentage) {
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${reason.toUpperCase()}-${percentage}-${suffix}`;
}

/**
 * Create a new coupon
 * @param {string} userId - User ID (for user-locked coupons)
 * @param {string} sessionId - Session ID (for session-locked coupons)
 * @param {number} percentage - Discount percentage (5-30%)
 * @param {string} reason - Reason for discount
 * @param {number} expiryMinutes - Expiry time in minutes (default: 15)
 * @returns {Object} Coupon details
 */
export function createCoupon(userId, sessionId, percentage, reason, expiryMinutes = 15) {
    if (percentage < 5 || percentage > 30) {
        throw new Error('Discount percentage must be between 5% and 30%');
    }

    const validReasons = ['birthday', 'bulk', 'student', 'loyalty', 'polite', 'exceptional'];
    if (!validReasons.includes(reason.toLowerCase())) {
        throw new Error(`Invalid reason. Must be one of: ${validReasons.join(', ')}`);
    }

    const code = generateCouponCode(reason, percentage);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const coupon = {
        code,
        userId,
        sessionId,
        percentage,
        reason,
        expiresAt,
        used: false,
        createdAt: new Date()
    };

    couponStore.set(code, coupon);

    return {
        code,
        percentage,
        reason,
        expiresAt: expiresAt.toISOString(),
        expiryMinutes
    };
}

/**
 * Validate a coupon code
 * @param {string} couponCode - Coupon code to validate
 * @param {string} userId - User ID attempting to use coupon
 * @param {string} sessionId - Session ID (optional)
 * @returns {Object} Validation result
 */
export function validateCoupon(couponCode, userId, sessionId = null) {
    if (!couponCode) {
        return { valid: false, error: 'Coupon code is required' };
    }

    const coupon = couponStore.get(couponCode);

    if (!coupon) {
        return { valid: false, error: 'Invalid coupon code' };
    }

    // Check if already used
    if (coupon.used) {
        return { valid: false, error: 'Coupon has already been used' };
    }

    // Check expiry
    if (new Date() > new Date(coupon.expiresAt)) {
        return { valid: false, error: 'Coupon has expired' };
    }

    // Check user match (if user-locked)
    if (coupon.userId && coupon.userId !== userId) {
        return { valid: false, error: 'Coupon is not valid for this user' };
    }

    // Check session match (if session-locked)
    if (coupon.sessionId && sessionId && coupon.sessionId !== sessionId) {
        return { valid: false, error: 'Coupon is not valid for this session' };
    }

    return {
        valid: true,
        percentage: coupon.percentage,
        reason: coupon.reason,
        expiresAt: coupon.expiresAt
    };
}

/**
 * Mark coupon as used
 * @param {string} couponCode - Coupon code to mark as used
 */
export function markCouponAsUsed(couponCode) {
    const coupon = couponStore.get(couponCode);
    if (coupon) {
        coupon.used = true;
        couponStore.set(couponCode, coupon);
    }
}

/**
 * Process checkout
 * @param {string} userId - User ID
 * @param {string} couponCode - Optional coupon code
 * @param {string} sessionId - Optional session ID for coupon validation
 * @returns {Promise<Object>} Order confirmation
 */
export async function checkout(userId, couponCode = null, sessionId = null) {
    if (!userId) throw new Error('userId is required');

    // Get cart
    const cart = await getCart(userId);

    if (cart.items.length === 0) {
        throw new Error('Cart is empty');
    }

    let subtotal = cart.subtotal;
    let discountPercentage = 0;
    let discountAmount = 0;
    let validatedCoupon = null;

    // Validate and apply coupon if provided
    if (couponCode) {
        const validation = validateCoupon(couponCode, userId, sessionId);

        if (!validation.valid) {
            throw new Error(validation.error);
        }

        discountPercentage = validation.percentage;
        discountAmount = Math.round(subtotal * (discountPercentage / 100));
        validatedCoupon = {
            code: couponCode,
            percentage: discountPercentage,
            reason: validation.reason
        };

        // Mark coupon as used
        markCouponAsUsed(couponCode);
    }

    const total = subtotal - discountAmount;

    // Generate order ID: ORD-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${dateStr}-${randomSuffix}`;

    // Create order object
    const order = {
        order_id: orderId,
        items: cart.items.map(item => ({
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color
        })),
        subtotal,
        discount_percentage: discountPercentage,
        discount_amount: discountAmount,
        total,
        coupon_code: couponCode,
        coupon_reason: validatedCoupon?.reason || null,
        created_at: now.toISOString()
    };

    // Fetch current purchase history
    const { data: profile, error: fetchError } = await supabaseAdmin
        .from('user_profiles')
        .select('purchase_history')
        .eq('id', userId)
        .single();

    if (fetchError) throw new Error(`Failed to fetch profile: ${fetchError.message}`);

    const purchaseHistory = profile.purchase_history || [];
    purchaseHistory.push(order);

    // Update profile: add order to purchase_history and clear cart
    const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
            purchase_history: purchaseHistory,
            active_cart: []
        })
        .eq('id', userId);

    if (updateError) throw new Error(`Failed to save order: ${updateError.message}`);

    return {
        success: true,
        order_id: orderId,
        items: order.items,
        subtotal,
        discount_percentage: discountPercentage,
        discount_amount: discountAmount,
        total,
        savings: discountAmount,
        coupon_used: validatedCoupon,
        created_at: order.created_at
    };
}

/**
 * Get user's purchase history
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of orders
 */
export async function getPurchaseHistory(userId) {
    if (!userId) throw new Error('userId is required');

    const { data: profile, error } = await supabaseAdmin
        .from('user_profiles')
        .select('purchase_history')
        .eq('id', userId)
        .single();

    if (error) throw new Error(`Failed to fetch purchase history: ${error.message}`);

    return profile.purchase_history || [];
}
