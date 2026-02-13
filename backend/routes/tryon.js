import { supabaseAdmin } from '../lib/supabase.js';
import { getProductById } from './products.js';
import OpenAI from 'openai';

/**
 * Phase 7: Mirror Mode - Virtual Try-On Generation
 * 
 * Uses OpenRouter for AI image generation (text-to-image approach)
 * For true virtual try-on, upgrade to Replicate API later
 */

const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'https://theshopkeeper.app',
        'X-Title': 'The Shopkeeper - AI Shopping Assistant'
    }
});

/**
 * Generate virtual try-on image using AI
 * @param {string} userId - User UUID
 * @param {number} productId - Product ID
 * @param {string} productType - 'clothing', 'accessory', or 'footwear'
 * @returns {Promise<{success: boolean, generated_image_url: string, try_on_id: string}>}
 */
export async function generateTryonImage(userId, productId, productType = 'clothing') {
    try {
        // 1. Validate product type
        const validTypes = ['clothing', 'accessory', 'footwear'];
        if (!validTypes.includes(productType)) {
            throw new Error(`Invalid product_type. Must be one of: ${validTypes.join(', ')}`);
        }

        // 2. Fetch product details
        const product = await getProductById(productId);
        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        // 3. Get user photo (optional - we'll use a generic model for hackathon)
        const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('photo_url, name')
            .eq('id', userId)
            .single();

        // 4. Generate AI image using OpenRouter (text-to-image approach)
        const prompt = buildTryOnPrompt(product, productType, profile?.name || 'model');

        console.log(`🎨 Generating try-on image for product ${productId}...`);
        console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

        const response = await openrouter.images.generate({
            model: 'black-forest-labs/flux-schnell',  // Fast, cheap model
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'url'
        });

        const generatedImageUrl = response.data[0].url;

        // 5. Save to database
        const { data: tryonRecord, error: insertError } = await supabaseAdmin
            .from('user_tryon_images')
            .insert({
                user_id: userId,
                product_id: productId,
                generated_image_url: generatedImageUrl,
                user_photo_url: profile?.photo_url || null,
                product_type: productType
            })
            .select()
            .single();

        if (insertError) {
            throw new Error(`Failed to save try-on image: ${insertError.message}`);
        }

        console.log(`✅ Try-on image generated and saved: ${tryonRecord.id}`);

        return {
            success: true,
            generated_image_url: generatedImageUrl,
            try_on_id: tryonRecord.id,
            product_name: product.name
        };

    } catch (error) {
        console.error('❌ Try-on generation error:', error.message);
        throw error;
    }
}

/**
 * Build text-to-image prompt for virtual try-on
 * @param {object} product - Product details
 * @param {string} productType - Product type
 * @param {string} modelName - Name for personalization (optional)
 * @returns {string} Prompt for AI image generation
 */
function buildTryOnPrompt(product, productType, modelName = 'model') {
    const { name, description, category, subcategory, colors = [] } = product;

    // Base prompt for professional fashion photography
    let prompt = `Professional fashion photography, studio lighting, white background. `;

    // Add model description
    prompt += `Full body portrait of an attractive fashion model `;

    // Add product details based on type
    if (productType === 'clothing') {
        const color = colors[0] || 'stylish';
        prompt += `wearing ${color} ${subcategory || 'clothing'}, ${description}. `;
        prompt += `The ${name} fits perfectly, showcasing the design and fabric. `;
    } else if (productType === 'accessory') {
        prompt += `wearing ${name}. ${description}. `;
        prompt += `The accessory complements the outfit beautifully. `;
    } else if (productType === 'footwear') {
        const color = colors[0] || 'stylish';
        prompt += `wearing ${color} ${name}. Full body shot showing the footwear clearly. ${description}. `;
    }

    // Add quality modifiers
    prompt += `High resolution, professional quality, realistic, detailed, fashion catalog style.`;

    return prompt;
}

/**
 * Get all try-on images for a user (optionally filtered by product)
 * @param {string} userId - User UUID
 * @param {number|null} productId - Optional product ID filter
 * @returns {Promise<Array>} Array of try-on image records
 */
export async function getTryonImages(userId, productId = null) {
    try {
        let query = supabaseAdmin
            .from('user_tryon_images')
            .select(`
        id,
        product_id,
        generated_image_url,
        user_photo_url,
        product_type,
        created_at,
        products (
          name,
          price,
          category,
          image_urls
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        // Optional product filter
        if (productId) {
            query = query.eq('product_id', productId);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch try-on images: ${error.message}`);
        }

        // Format response
        return data.map(item => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.products?.name || 'Unknown Product',
            product_price: item.products?.price || 0,
            product_category: item.products?.category || 'Unknown',
            generated_image_url: item.generated_image_url,
            user_photo_url: item.user_photo_url,
            product_type: item.product_type,
            created_at: item.created_at
        }));

    } catch (error) {
        console.error('❌ Error fetching try-on images:', error.message);
        throw error;
    }
}

/**
 * Delete a try-on image
 * @param {string} userId - User UUID
 * @param {string} tryonId - Try-on image UUID
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteTryonImage(userId, tryonId) {
    try {
        const { error } = await supabaseAdmin
            .from('user_tryon_images')
            .delete()
            .eq('id', tryonId)
            .eq('user_id', userId); // RLS-style manual check

        if (error) {
            throw new Error(`Failed to delete try-on image: ${error.message}`);
        }

        console.log(`✅ Try-on image deleted: ${tryonId}`);

        return { success: true };

    } catch (error) {
        console.error('❌ Error deleting try-on image:', error.message);
        throw error;
    }
}

/**
 * Update user's photo URL in profile (for future use)
 * @param {string} userId - User UUID  
 * @param {string} photoUrl - Photo URL from Supabase Storage
 * @returns {Promise<{success: boolean}>}
 */
export async function updateUserPhoto(userId, photoUrl) {
    try {
        const { error } = await supabaseAdmin
            .from('user_profiles')
            .update({ photo_url: photoUrl })
            .eq('id', userId);

        if (error) {
            throw new Error(`Failed to update user photo: ${error.message}`);
        }

        console.log(`✅ User photo updated for ${userId}`);

        return { success: true };

    } catch (error) {
        console.error('❌ Error updating user photo:', error.message);
        throw error;
    }
}
