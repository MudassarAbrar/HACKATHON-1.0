/**
 * User Profile Route Helpers
 * 
 * Handles user profile CRUD operations using the admin client
 * (bypasses RLS for server-side operations on behalf of authenticated users).
 * 
 * Functions:
 *   - upsertProfile(user) — Create or return profile on login
 *   - getProfile(userId)  — Fetch a user's profile
 *   - updateProfile(userId, updates) — Update profile fields
 */

import { supabaseAdmin } from '../lib/supabase.js';

/**
 * Create a profile for a new user, or return the existing one.
 * Called after successful OAuth login.
 * 
 * @param {{ id: string, email: string, user_metadata?: { full_name?: string, name?: string } }} user
 *   - The Supabase auth user object (from session or getUser)
 * @returns {Promise<{ profile: object|null, error: string|null, isNew: boolean }>}
 */
export async function upsertProfile(user) {
    if (!supabaseAdmin) {
        return { profile: null, error: 'Admin client not available (missing service key)', isNew: false };
    }

    if (!user?.id || !user?.email) {
        return { profile: null, error: 'User object must have id and email', isNew: false };
    }

    try {
        // Check if profile already exists
        const { data: existing, error: selectError } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (selectError) {
            return { profile: null, error: `Select failed: ${selectError.message}`, isNew: false };
        }

        // Return existing profile
        if (existing) {
            return { profile: existing, error: null, isNew: false };
        }

        // Create new profile with defaults
        const name = user.user_metadata?.full_name
            || user.user_metadata?.name
            || user.email.split('@')[0];

        const { data: newProfile, error: insertError } = await supabaseAdmin
            .from('user_profiles')
            .insert({
                id: user.id,
                email: user.email,
                name,
            })
            .select()
            .single();

        if (insertError) {
            return { profile: null, error: `Insert failed: ${insertError.message}`, isNew: false };
        }

        return { profile: newProfile, error: null, isNew: true };
    } catch (err) {
        return { profile: null, error: `Unexpected error: ${err.message}`, isNew: false };
    }
}

/**
 * Fetch a user's profile by their auth ID.
 * 
 * @param {string} userId - The user's auth.users.id (UUID)
 * @returns {Promise<{ profile: object|null, error: string|null }>}
 */
export async function getProfile(userId) {
    if (!supabaseAdmin) {
        return { profile: null, error: 'Admin client not available' };
    }

    if (!userId) {
        return { profile: null, error: 'userId is required' };
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            return { profile: null, error: error.message };
        }

        return { profile: data, error: null };
    } catch (err) {
        return { profile: null, error: `Fetch failed: ${err.message}` };
    }
}

/**
 * Update a user's profile fields.
 * 
 * @param {string} userId - The user's auth.users.id (UUID)
 * @param {object} updates - Fields to update (name, vibe_profile, etc.)
 * @returns {Promise<{ profile: object|null, error: string|null }>}
 */
export async function updateProfile(userId, updates) {
    if (!supabaseAdmin) {
        return { profile: null, error: 'Admin client not available' };
    }

    if (!userId) {
        return { profile: null, error: 'userId is required' };
    }

    if (!updates || Object.keys(updates).length === 0) {
        return { profile: null, error: 'No updates provided' };
    }

    // Prevent overwriting protected fields
    const { id, created_at, ...safeUpdates } = updates;
    safeUpdates.updated_at = new Date().toISOString();

    try {
        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .update(safeUpdates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            return { profile: null, error: error.message };
        }

        return { profile: data, error: null };
    } catch (err) {
        return { profile: null, error: `Update failed: ${err.message}` };
    }
}

/**
 * Update user's vibe profile preferences
 * @param {string} userId - User UUID
 * @param {object} preferences - Vibe profile data (style, colors, budget, categories)
 * @returns {Promise<{ profile: object|null, error: string|null }>}
 */
export async function updateVibeProfile(userId, preferences) {
    if (!userId) {
        return { profile: null, error: 'userId is required' };
    }

    // Validate preferences structure
    const validStyles = ['casual', 'formal', 'trendy', 'classic'];
    if (preferences.style && !validStyles.includes(preferences.style)) {
        return { profile: null, error: `Invalid style. Must be one of: ${validStyles.join(', ')}` };
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .update({ vibe_profile: preferences })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            return { profile: null, error: error.message };
        }

        return { profile: data, error: null };
    } catch (err) {
        return { profile: null, error: `Vibe update failed: ${err.message}` };
    }
}

/**
 * Auto-detect vibe profile from user's purchase history
 * @param {string} userId - User UUID
 * @returns {Promise<{ vibe_profile: object|null, error: string|null }>}
 */
export async function detectVibeProfile(userId) {
    if (!userId) {
        return { vibe_profile: null, error: 'userId is required' };
    }

    try {
        // Fetch purchase history
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('purchase_history')
            .eq('id', userId)
            .single();

        const purchaseHistory = profile?.purchase_history || [];

        if (purchaseHistory.length === 0) {
            return { vibe_profile: null, error: 'No purchase history to analyze' };
        }

        // Analyze purchases
        const categoryCount = {};
        const colorCount = {};
        let totalSpent = 0;
        let orderCount = 0;

        purchaseHistory.forEach(order => {
            totalSpent += order.total || 0;
            orderCount++;

            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    // Count categories
                    const category = item.category || 'other';
                    categoryCount[category] = (categoryCount[category] || 0) + 1;

                    // Count colors
                    if (item.colors && Array.isArray(item.colors)) {
                        item.colors.forEach(color => {
                            const normalizedColor = color.toLowerCase();
                            colorCount[normalizedColor] = (colorCount[normalizedColor] || 0) + 1;
                        });
                    }
                });
            }
        });

        // Top 3 categories
        const favorite_categories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([cat]) => cat);

        // Top 3 colors
        const favorite_colors = Object.entries(colorCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([col]) => col);

        // Average budget
        const avgOrderValue = totalSpent / orderCount;
        const budget_range = {
            min: Math.floor(avgOrderValue * 0.7),
            max: Math.ceil(avgOrderValue * 1.5)
        };

        // Detect style (heuristic based on categories)
        let style = 'casual'; // default
        const formalCategories = ['dresses', 'blazers', 'heels', 'suits'];
        const casualCategories = ['t-shirts', 'jeans', 'sneakers', 'hoodies'];
        const trendyCategories = ['accessories', 'shoes', 'bags'];

        const hasFormal = favorite_categories.some(cat => formalCategories.includes(cat));
        const hasCasual = favorite_categories.some(cat => casualCategories.includes(cat));
        const hasTrendy = favorite_categories.some(cat => trendyCategories.includes(cat));

        if (hasFormal) style = 'formal';
        else if (hasCasual) style = 'casual';
        else if (hasTrendy) style = 'trendy';

        const vibe_profile = {
            style,
            favorite_colors,
            budget_range,
            favorite_categories
        };

        return { vibe_profile, error: null };

    } catch (err) {
        return { vibe_profile: null, error: `Detection failed: ${err.message}` };
    }
}

/**
 * Get user's vibe profile (or auto-detect if not set)
 * @param {string} userId - User UUID
 * @returns {Promise<{ vibe_profile: object|null, error: string|null }>}
 */
export async function getVibeProfile(userId) {
    if (!userId) {
        return { vibe_profile: null, error: 'userId is required' };
    }

    try {
        // Fetch existing vibe profile
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('vibe_profile')
            .eq('id', userId)
            .single();

        // If exists, return it
        if (profile?.vibe_profile) {
            return { vibe_profile: profile.vibe_profile, error: null };
        }

        // Otherwise, auto-detect and save
        const detected = await detectVibeProfile(userId);

        if (detected.vibe_profile) {
            // Save detected profile
            await updateVibeProfile(userId, detected.vibe_profile);
            return { vibe_profile: detected.vibe_profile, error: null };
        }

        return { vibe_profile: null, error: detected.error };

    } catch (err) {
        return { vibe_profile: null, error: `Failed to get vibe profile: ${err.message}` };
    }
}
