/**
 * Dashboard API - User Stats Aggregation & Personalization
 * Provides data for user dashboard: orders, spending, favorites, recommendations
 */

import { supabaseAdmin } from '../lib/supabase.js';
import { getProducts } from './products.js';

/**
 * Get comprehensive dashboard statistics for a user
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Dashboard stats
 */
export async function getDashboardStats(userId) {
    try {
        // Fetch user profile with purchase history and cart
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .select('purchase_history, active_cart, vibe_profile')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error('Error fetching user profile:', profileError.message);
            throw profileError;
        }

        // Count try-on images
        const { count: tryonCount, error: tryonError } = await supabaseAdmin
            .from('user_tryon_images')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (tryonError) {
            console.error('Error counting try-on images:', tryonError.message);
        }

        // Count saved outfits
        const { count: outfitCount, error: outfitError } = await supabaseAdmin
            .from('outfit_bundles')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', userId);

        if (outfitError) {
            console.error('Error counting outfits:', outfitError.message);
        }

        // Analyze purchase history
        const purchaseHistory = profile.purchase_history || [];
        const totalOrders = purchaseHistory.length;
        const totalSpent = purchaseHistory.reduce((sum, order) => sum + (order.total || 0), 0);

        // Extract favorite categories (top 3)
        const categoryCount = {};
        purchaseHistory.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const category = item.category || 'other';
                    categoryCount[category] = (categoryCount[category] || 0) + 1;
                });
            }
        });

        const favoriteCategories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category);

        // Count active coupons (unique coupon codes from purchase history)
        const coupons = new Set();
        purchaseHistory.forEach(order => {
            if (order.coupon_code) {
                coupons.add(order.coupon_code);
            }
        });

        // Cart items count
        const cartItemsCount = Array.isArray(profile.active_cart) ? profile.active_cart.length : 0;

        // Last order date
        const lastOrderDate = purchaseHistory.length > 0
            ? purchaseHistory[purchaseHistory.length - 1].date
            : null;

        return {
            total_orders: totalOrders,
            total_spent: parseFloat(totalSpent.toFixed(2)),
            favorite_categories: favoriteCategories,
            active_coupons_count: coupons.size,
            saved_outfits_count: outfitCount || 0,
            tryon_images_count: tryonCount || 0,
            last_order_date: lastOrderDate,
            cart_items_count: cartItemsCount,
            vibe_profile: profile.vibe_profile || null
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error.message);
        throw error;
    }
}

/**
 * Get recent user activity timeline
 * @param {string} userId - User UUID
 * @param {number} limit - Max activities to return (default: 10)
 * @returns {Promise<Array>} Timeline of recent activities
 */
export async function getRecentActivity(userId, limit = 10) {
    try {
        const activities = [];

        // Fetch user profile for purchase history
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('purchase_history')
            .eq('id', userId)
            .single();

        // Add purchase activities
        if (profile?.purchase_history) {
            profile.purchase_history.forEach(order => {
                activities.push({
                    type: 'purchase',
                    date: order.date,
                    data: {
                        order_id: order.order_id,
                        total: order.total,
                        item_count: order.items?.length || 0
                    }
                });
            });
        }

        // Fetch recent try-on images
        const { data: tryons } = await supabaseAdmin
            .from('user_tryon_images')
            .select('id, product_id, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (tryons) {
            tryons.forEach(tryon => {
                activities.push({
                    type: 'tryon',
                    date: tryon.created_at,
                    data: {
                        tryon_id: tryon.id,
                        product_id: tryon.product_id
                    }
                });
            });
        }

        // Fetch recent saved outfits
        const { data: outfits } = await supabaseAdmin
            .from('outfit_bundles')
            .select('id, name, occasion, created_at')
            .eq('created_by', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (outfits) {
            outfits.forEach(outfit => {
                activities.push({
                    type: 'outfit',
                    date: outfit.created_at,
                    data: {
                        outfit_id: outfit.id,
                        name: outfit.name,
                        occasion: outfit.occasion
                    }
                });
            });
        }

        // Sort by date (newest first) and limit
        return activities
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);

    } catch (error) {
        console.error('Error fetching recent activity:', error.message);
        throw error;
    }
}

/**
 * Get personalized product recommendations based on user's vibe profile
 * @param {string} userId - User UUID
 * @param {number} limit - Max recommendations (default: 5)
 * @returns {Promise<Array>} Personalized product recommendations
 */
export async function getRecommendations(userId, limit = 5) {
    try {
        // Fetch user's vibe profile
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('vibe_profile, purchase_history')
            .eq('id', userId)
            .single();

        const vibeProfile = profile?.vibe_profile;
        const purchaseHistory = profile?.purchase_history || [];

        // Get all products
        const allProducts = await getProducts();

        // If no vibe profile, return random products
        if (!vibeProfile) {
            return allProducts
                .sort(() => 0.5 - Math.random())
                .slice(0, limit);
        }

        // Get purchased product IDs to exclude
        const purchasedIds = new Set();
        purchaseHistory.forEach(order => {
            order.items?.forEach(item => purchasedIds.add(item.product_id));
        });

        // Score products based on vibe profile
        const scoredProducts = allProducts
            .filter(product => !purchasedIds.has(product.id)) // Exclude purchased
            .map(product => {
                let score = 0;

                // Favorite categories boost
                if (vibeProfile.favorite_categories?.includes(product.category)) {
                    score += 30;
                }

                // Favorite colors boost
                if (product.colors && vibeProfile.favorite_colors) {
                    const colorMatch = product.colors.some(color =>
                        vibeProfile.favorite_colors.includes(color.toLowerCase())
                    );
                    if (colorMatch) score += 20;
                }

                // Budget range check
                if (vibeProfile.budget_range) {
                    const { min, max } = vibeProfile.budget_range;
                    if (product.price >= min && product.price <= max) {
                        score += 25;
                    } else if (product.price < min) {
                        score += 10; // Still OK, just cheaper
                    }
                    // No points if over budget
                }

                // Style match (heuristic)
                if (vibeProfile.style) {
                    const styleKeywords = {
                        casual: ['casual', 'everyday', 't-shirt', 'jeans', 'sneakers'],
                        formal: ['formal', 'dress', 'blazer', 'heels', 'suit'],
                        trendy: ['trendy', 'modern', 'stylish', 'fashion'],
                        classic: ['classic', 'timeless', 'elegant', 'traditional']
                    };

                    const keywords = styleKeywords[vibeProfile.style] || [];
                    const description = `${product.name} ${product.description} ${product.category}`.toLowerCase();

                    const hasStyleMatch = keywords.some(keyword => description.includes(keyword));
                    if (hasStyleMatch) score += 15;
                }

                return { ...product, score };
            });

        // Sort by score (highest first) and return top N
        return scoredProducts
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

    } catch (error) {
        console.error('Error getting recommendations:', error.message);
        throw error;
    }
}
