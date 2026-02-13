import { supabaseAdmin } from '../lib/supabase.js';
import { getProducts } from './products.js';

/**
 * Phase 8: Outfit Builder - AI-Curated Complete Outfits
 * 
 * Budget allocation: 40% main piece, 30% footwear, 30% accessories
 * Color harmony matching for complementary items
 * Bundle discounts based on item count
 */

/**
 * Color harmony mapping - complementary color pairs
 */
const COLOR_HARMONY = {
    blue: ['beige', 'cream', 'white', 'gray', 'navy'],
    black: ['white', 'gray', 'beige', 'red'],
    white: ['blue', 'black', 'navy', 'gray'],
    red: ['navy', 'black', 'white', 'beige'],
    green: ['brown', 'beige', 'white'],
    navy: ['white', 'beige', 'red', 'cream'],
    beige: ['blue', 'white', 'brown', 'navy'],
    gray: ['white', 'black', 'blue', 'pink'],
    brown: ['beige', 'cream', 'green', 'white'],
    pink: ['gray', 'white', 'navy']
};

/**
 * Occasion formality mapping
 */
const OCCASION_RULES = {
    formal: {
        categories: ['dresses', 'blazers', 'suits', 'heels', 'dress-shoes', 'clutches', 'ties'],
        avoid: ['sneakers', 't-shirts', 'shorts', 'sandals']
    },
    casual: {
        categories: ['t-shirts', 'jeans', 'sneakers', 'hoodies', 'sandals', 'backpacks'],
        avoid: ['blazers', 'suits', 'heels']
    },
    work: {
        categories: ['blazers', 'dress-shirts', 'trousers', 'loafers', 'flats', 'totes'],
        avoid: ['t-shirts', 'sneakers', 'shorts']
    }
};

/**
 * Calculate bundle discount based on item count
 * @param {number} itemCount - Number of items in bundle
 * @returns {number} Discount percentage
 */
function calculateBundleDiscount(itemCount) {
    if (itemCount >= 5) return 10;  // 10% for 5+ items
    if (itemCount >= 4) return 8;   // 8% for 4 items
    if (itemCount >= 3) return 5;   // 5% for 3 items
    return 0;
}

/**
 * Allocate budget across outfit components
 * @param {number} budget - Total budget
 * @returns {object} Budget allocation
 */
function allocateBudget(budget) {
    return {
        mainPiece: budget * 0.40,   // 40% for main clothing item
        footwear: budget * 0.30,    // 30% for shoes
        accessories: budget * 0.30  // 30% for accessories
    };
}

/**
 * Check if colors are harmonious
 * @param {string} baseColor - Primary color
 * @param {string} matchColor - Color to match
 * @returns {boolean} Whether colors harmonize
 */
function colorsMatch(baseColor, matchColor) {
    if (!baseColor || !matchColor) return true; // No preference

    baseColor = baseColor.toLowerCase();
    matchColor = matchColor.toLowerCase();

    // Exact match
    if (baseColor === matchColor) return true;

    // Complementary colors
    const harmonious = COLOR_HARMONY[baseColor] || [];
    return harmonious.includes(matchColor);
}

/**
 * Determine formality level from occasion
 * @param {string} occasion - Event type
 * @returns {string} Formality level
 */
function getFormality(occasion) {
    const occasionLower = occasion.toLowerCase();

    if (occasionLower.includes('wedding') ||
        occasionLower.includes('interview') ||
        occasionLower.includes('gala') ||
        occasionLower.includes('formal')) {
        return 'formal';
    }

    if (occasionLower.includes('work') ||
        occasionLower.includes('office') ||
        occasionLower.includes('business')) {
        return 'work';
    }

    return 'casual';
}

/**
 * Build a complete outfit with AI curation
 * @param {string} userId - User UUID
 * @param {string} occasion - Event type (wedding, work, casual, etc.)
 * @param {number} budget - Total budget for outfit
 * @param {string} style - Style preference (casual, formal, trendy, classic)
 * @param {string} season - Season (spring, summer, fall, winter)
 * @returns {Promise<object>} Complete outfit with items and pricing
 */
export async function buildOutfit(userId, occasion, budget, style = 'casual', season = 'summer') {
    try {
        console.log(`👔 Building outfit: ${occasion}, $${budget}, ${style}, ${season}`);

        // 1. Get all available products
        const allProducts = await getProducts();

        // 2. Allocate budget
        const allocation = allocateBudget(budget);
        console.log(`   Budget allocation: Main $${allocation.mainPiece.toFixed(0)}, Shoes $${allocation.footwear.toFixed(0)}, Access. $${allocation.accessories.toFixed(0)}`);

        // 3. Determine formality level
        const formality = getFormality(occasion);

        // 4. Select main piece (dress OR top+bottom)
        const mainPiece = selectMainPiece(allProducts, allocation.mainPiece, formality, style, season);
        if (!mainPiece) {
            throw new Error(`No suitable main piece found within $${allocation.mainPiece.toFixed(0)} budget`);
        }

        const baseColor = mainPiece.colors?.[0] || 'white';
        console.log(`   Main piece: ${mainPiece.name} ($${mainPiece.price}) - ${baseColor}`);

        // 5. Select footwear (match color and formality)
        const footwear = selectFootwear(allProducts, allocation.footwear, baseColor, formality, season);
        if (!footwear) {
            throw new Error(`No suitable footwear found within $${allocation.footwear.toFixed(0)} budget`);
        }
        console.log(`   Footwear: ${footwear.name} ($${footwear.price})`);

        // 6. Select accessories (1-2 items)
        const accessories = selectAccessories(allProducts, allocation.accessories, baseColor, formality, 2);
        console.log(`   Accessories: ${accessories.length} items`);

        // 7. Compile outfit
        const items = [mainPiece, footwear, ...accessories];
        const originalPrice = items.reduce((sum, item) => sum + item.price, 0);
        const bundleDiscount = calculateBundleDiscount(items.length);
        const totalPrice = originalPrice * (1 - bundleDiscount / 100);

        console.log(`   Original: $${originalPrice.toFixed(2)}, Discount: ${bundleDiscount}%, Final: $${totalPrice.toFixed(2)}`);

        // 8. Generate outfit name
        const outfitName = generateOutfitName(occasion, season, style);

        // 9. Save to database (optional - for now just generate, save later if user wants)
        const outfitData = {
            name: outfitName,
            occasion,
            style,
            season,
            items: items.map(item => ({
                product_id: item.id,
                name: item.name,
                price: item.price,
                category: item.category,
                subcategory: item.subcategory,
                colors: item.colors,
                image_url: item.image_urls?.[0] || null
            })),
            product_ids: items.map(item => item.id),
            total_price: totalPrice,
            original_price: originalPrice,
            bundle_discount: bundleDiscount
        };

        console.log(`✅ Outfit built: ${outfitName}`);

        return outfitData;

    } catch (error) {
        console.error('❌ Outfit building error:', error.message);
        throw error;
    }
}

/**
 * Select main clothing piece (dress OR top+bottom)
 */
function selectMainPiece(products, maxPrice, formality, style, season) {
    const categories = formality === 'formal'
        ? ['dresses', 'blazers', 'suits']
        : formality === 'work'
            ? ['blazers', 'dress-shirts', 'blouses']
            : ['t-shirts', 'shirts', 'sweaters', 'hoodies'];

    const suitable = products.filter(p =>
        categories.some(cat => p.category?.toLowerCase().includes(cat) || p.subcategory?.toLowerCase().includes(cat)) &&
        p.price <= maxPrice &&
        p.price > maxPrice * 0.5 // Target 50-100% of budget
    );

    // Sort by price descending (get best within budget)
    suitable.sort((a, b) => b.price - a.price);

    return suitable[0] || null;
}

/**
 * Select footwear matching color and formality
 */
function selectFootwear(products, maxPrice, baseColor, formality, season) {
    const categories = formality === 'formal'
        ? ['heels', 'dress-shoes', 'oxfords']
        : formality === 'work'
            ? ['loafers', 'flats', 'dress-shoes']
            : ['sneakers', 'sandals', 'boots'];

    const suitable = products.filter(p => {
        const matchesCategory = categories.some(cat =>
            p.category?.toLowerCase().includes(cat) ||
            p.subcategory?.toLowerCase().includes(cat)
        );
        const matchesPrice = p.price <= maxPrice && p.price > maxPrice * 0.4;
        const matchesColor = !p.colors || p.colors.length === 0 || colorsMatch(baseColor, p.colors[0]);

        return matchesCategory && matchesPrice && matchesColor;
    });

    suitable.sort((a, b) => b.price - a.price);

    return suitable[0] || null;
}

/**
 * Select accessories (bags, jewelry, etc.)
 */
function selectAccessories(products, maxPrice, baseColor, formality, count = 2) {
    const categories = formality === 'formal'
        ? ['clutches', 'jewelry', 'watches', 'ties', 'scarves']
        : formality === 'work'
            ? ['totes', 'briefcases', 'watches', 'belts']
            : ['backpacks', 'sunglasses', 'hats', 'jewelry'];

    const suitable = products.filter(p => {
        const matchesCategory = categories.some(cat =>
            p.category?.toLowerCase().includes(cat) ||
            p.subcategory?.toLowerCase().includes(cat)
        );
        const matchesColor = !p.colors || p.colors.length === 0 || colorsMatch(baseColor, p.colors[0]);

        return matchesCategory && matchesColor;
    });

    // Sort by price and pick top items within budget
    suitable.sort((a, b) => b.price - a.price);

    const selected = [];
    let remaining = maxPrice;

    for (const item of suitable) {
        if (selected.length >= count) break;
        if (item.price <= remaining * 0.6) { // Don't overspend
            selected.push(item);
            remaining -= item.price;
        }
    }

    return selected;
}

/**
 * Generate outfit name
 */
function generateOutfitName(occasion, season, style) {
    const seasonName = season.charAt(0).toUpperCase() + season.slice(1);
    const occasionName = occasion.charAt(0).toUpperCase() + occasion.slice(1);
    return `${seasonName} ${occasionName} - ${style.charAt(0).toUpperCase() + style.slice(1)} Look`;
}

/**
 * Save outfit to database
 * @param {string} userId - User UUID
 * @param {object} outfitData - Outfit data
 * @param {boolean} isPublic - Whether outfit is public
 * @returns {Promise<string>} Outfit ID
 */
export async function saveOutfit(userId, outfitData, isPublic = false) {
    try {
        const { data, error } = await supabaseAdmin
            .from('outfit_bundles')
            .insert({
                name: outfitData.name,
                occasion: outfitData.occasion,
                style: outfitData.style,
                season: outfitData.season,
                product_ids: outfitData.product_ids,
                total_price: outfitData.total_price,
                bundle_discount: outfitData.bundle_discount,
                created_by: userId,
                is_public: isPublic
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`✅ Outfit saved: ${data.id}`);
        return data.id;

    } catch (error) {
        console.error('❌ Error saving outfit:', error.message);
        throw error;
    }
}

/**
 * Get user's saved outfits
 * @param {string} userId - User UUID
 * @param {string} occasion - Optional occasion filter
 * @returns {Promise<Array>} List of outfits
 */
export async function getOutfits(userId, occasion = null) {
    try {
        let query = supabaseAdmin
            .from('outfit_bundles')
            .select('*')
            .eq('created_by', userId)
            .order('created_at', { ascending: false });

        if (occasion) {
            query = query.eq('occasion', occasion);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data;

    } catch (error) {
        console.error('❌ Error fetching outfits:', error.message);
        throw error;
    }
}

/**
 * Get public outfits for inspiration
 * @param {string} occasion - Optional occasion filter
 * @param {number} limit - Max results
 * @returns {Promise<Array>} List of public outfits
 */
export async function getPublicOutfits(occasion = null, limit = 20) {
    try {
        let query = supabaseAdmin
            .from('outfit_bundles')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (occasion) {
            query = query.eq('occasion', occasion);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data;

    } catch (error) {
        console.error('❌ Error fetching public outfits:', error.message);
        throw error;
    }
}

/**
 * Delete outfit
 * @param {string} userId - User UUID
 * @param {string} outfitId - Outfit UUID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteOutfit(userId, outfitId) {
    try {
        const { error } = await supabaseAdmin
            .from('outfit_bundles')
            .delete()
            .eq('id', outfitId)
            .eq('created_by', userId); // RLS-style check

        if (error) throw error;

        console.log(`✅ Outfit deleted: ${outfitId}`);
        return true;

    } catch (error) {
        console.error('❌ Error deleting outfit:', error.message);
        throw error;
    }
}
