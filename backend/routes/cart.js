import { supabaseAdmin } from '../lib/supabase.js';

/**
 * Add item to cart or update quantity if already exists
 * @param {string} userId - User ID
 * @param {number} productId - Product ID to add
 * @param {number} quantity - Quantity to add (default: 1)
 * @param {string} size - Selected size (optional)
 * @param {string} color - Selected color (optional)
 * @returns {Promise<Object>} Updated cart with items and totals
 */
export async function addToCart(userId, productId, quantity = 1, size = null, color = null) {
    if (!userId) throw new Error('userId is required');
    if (!productId) throw new Error('productId is required');
    if (quantity < 1) throw new Error('quantity must be at least 1');

    // Fetch current cart
    const { data: profile, error: fetchError } = await supabaseAdmin
        .from('user_profiles')
        .select('active_cart')
        .eq('id', userId)
        .single();

    if (fetchError) throw new Error(`Failed to fetch cart: ${fetchError.message}`);

    let cart = profile.active_cart || [];

    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item =>
        item.product_id === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItemIndex !== -1) {
        // Update quantity
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        cart.push({
            product_id: productId,
            quantity,
            size,
            color,
            added_at: new Date().toISOString()
        });
    }

    // Update cart in database
    const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ active_cart: cart })
        .eq('id', userId);

    if (updateError) throw new Error(`Failed to update cart: ${updateError.message}`);

    // Return full cart with product details
    return await getCart(userId);
}

/**
 * Get cart with full product details
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Cart with items, subtotal, total, item_count
 */
export async function getCart(userId) {
    if (!userId) throw new Error('userId is required');

    // Fetch cart
    const { data: profile, error: fetchError } = await supabaseAdmin
        .from('user_profiles')
        .select('active_cart')
        .eq('id', userId)
        .single();

    if (fetchError) throw new Error(`Failed to fetch cart: ${fetchError.message}`);

    const cart = profile.active_cart || [];

    if (cart.length === 0) {
        return {
            items: [],
            subtotal: 0,
            total: 0,
            item_count: 0
        };
    }

    // Get product IDs
    const productIds = cart.map(item => item.product_id);

    // Fetch product details
    const { data: products, error: productsError } = await supabaseAdmin
        .from('products')
        .select('id, name, price, image_urls, category')
        .in('id', productIds);

    if (productsError) throw new Error(`Failed to fetch products: ${productsError.message}`);

    // Build product lookup map
    const productMap = {};
    products.forEach(p => {
        productMap[p.id] = p;
    });

    // Enrich cart items with product details
    const enrichedItems = cart.map(item => {
        const product = productMap[item.product_id];
        if (!product) return null;

        return {
            product_id: item.product_id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image_url: product.image_urls?.[0] || null,
            category: product.category,
            item_total: product.price * item.quantity,
            added_at: item.added_at
        };
    }).filter(item => item !== null);

    // Calculate totals
    const subtotal = enrichedItems.reduce((sum, item) => sum + item.item_total, 0);
    const itemCount = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
        items: enrichedItems,
        subtotal,
        total: subtotal, // Will be adjusted by coupons at checkout
        item_count: itemCount
    };
}

/**
 * Remove item from cart
 * @param {string} userId - User ID
 * @param {number} productId - Product ID to remove
 * @param {string} size - Size to match (optional)
 * @param {string} color - Color to match (optional)
 * @returns {Promise<Object>} Updated cart
 */
export async function removeFromCart(userId, productId, size = null, color = null) {
    if (!userId) throw new Error('userId is required');
    if (!productId) throw new Error('productId is required');

    // Fetch current cart
    const { data: profile, error: fetchError } = await supabaseAdmin
        .from('user_profiles')
        .select('active_cart')
        .eq('id', userId)
        .single();

    if (fetchError) throw new Error(`Failed to fetch cart: ${fetchError.message}`);

    let cart = profile.active_cart || [];

    // Remove matching item
    cart = cart.filter(item =>
        !(item.product_id === productId &&
            item.size === size &&
            item.color === color)
    );

    // Update cart
    const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ active_cart: cart })
        .eq('id', userId);

    if (updateError) throw new Error(`Failed to update cart: ${updateError.message}`);

    return await getCart(userId);
}

/**
 * Update cart item quantity
 * @param {string} userId - User ID
 * @param {number} productId - Product ID
 * @param {number} newQuantity - New quantity (0 to remove)
 * @param {string} size - Size to match (optional)
 * @param {string} color - Color to match (optional)
 * @returns {Promise<Object>} Updated cart
 */
export async function updateCartQuantity(userId, productId, newQuantity, size = null, color = null) {
    if (!userId) throw new Error('userId is required');
    if (!productId) throw new Error('productId is required');
    if (newQuantity < 0) throw new Error('quantity cannot be negative');

    // If quantity is 0, remove item
    if (newQuantity === 0) {
        return await removeFromCart(userId, productId, size, color);
    }

    // Fetch current cart
    const { data: profile, error: fetchError } = await supabaseAdmin
        .from('user_profiles')
        .select('active_cart')
        .eq('id', userId)
        .single();

    if (fetchError) throw new Error(`Failed to fetch cart: ${fetchError.message}`);

    let cart = profile.active_cart || [];

    // Find and update item
    const itemIndex = cart.findIndex(item =>
        item.product_id === productId &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex === -1) {
        throw new Error('Item not found in cart');
    }

    cart[itemIndex].quantity = newQuantity;

    // Update cart
    const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ active_cart: cart })
        .eq('id', userId);

    if (updateError) throw new Error(`Failed to update cart: ${updateError.message}`);

    return await getCart(userId);
}

/**
 * Clear entire cart
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Empty cart
 */
export async function clearCart(userId) {
    if (!userId) throw new Error('userId is required');

    const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({ active_cart: [] })
        .eq('id', userId);

    if (error) throw new Error(`Failed to clear cart: ${error.message}`);

    return {
        items: [],
        subtotal: 0,
        total: 0,
        item_count: 0
    };
}
