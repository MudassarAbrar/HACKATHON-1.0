/**
 * Product Catalog Route Helpers
 * 
 * Public catalog queries — uses anon client (no auth required).
 * Products table has no RLS; it's a public read-only catalog.
 * 
 * Functions:
 *   - getProducts(filters)           — Fetch all or filtered products
 *   - getProductById(id)             — Fetch single product
 *   - getProductsByCategory(category) — Filter by category
 */

import { supabase } from '../lib/supabase.js';

/**
 * Fetch products with optional filtering.
 * 
 * @param {{ category?: string, gender?: string, minPrice?: number, maxPrice?: number, limit?: number }} [filters]
 * @returns {Promise<{ products: object[], error: string|null }>}
 */
export async function getProducts(filters = {}) {
    try {
        let query = supabase
            .from('products')
            .select('*')
            .order('rating', { ascending: false });

        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (filters.gender) {
            query = query.eq('gender', filters.gender);
        }
        if (filters.minPrice !== undefined) {
            query = query.gte('price', filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
            query = query.lte('price', filters.maxPrice);
        }
        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query;

        if (error) {
            return { products: [], error: error.message };
        }

        return { products: data || [], error: null };
    } catch (err) {
        return { products: [], error: `Fetch failed: ${err.message}` };
    }
}

/**
 * Fetch a single product by ID.
 * 
 * @param {number} id - Product ID (integer)
 * @returns {Promise<{ product: object|null, error: string|null }>}
 */
export async function getProductById(id) {
    if (!id && id !== 0) {
        return { product: null, error: 'Product ID is required' };
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            return { product: null, error: error.message };
        }

        return { product: data, error: null };
    } catch (err) {
        return { product: null, error: `Fetch failed: ${err.message}` };
    }
}

/**
 * Fetch products by category.
 * 
 * @param {string} category - 'clothing', 'accessories', or 'footwear'
 * @returns {Promise<{ products: object[], error: string|null }>}
 */
export async function getProductsByCategory(category) {
    if (!category) {
        return { products: [], error: 'Category is required' };
    }

    const valid = ['clothing', 'accessories', 'footwear'];
    if (!valid.includes(category)) {
        return { products: [], error: `Invalid category: "${category}". Must be one of: ${valid.join(', ')}` };
    }

    return getProducts({ category });
}
