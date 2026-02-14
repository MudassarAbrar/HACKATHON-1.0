import { supabaseAdmin } from './lib/supabase.js';

/**
 * Fix image URLs to match actual filenames in public/images/products/
 * 
 * The database has incorrect filenames that don't match the actual files.
 * This script creates a proper mapping based on product names and categories.
 */

// Mapping of product names/categories to actual image files
const imageMapping = {
    // Sweaters & Tops
    'Cashmere Crewneck Sweater': 'cashmere-turtleneck.png',
    'Cashmere Turtleneck': 'cashmere-turtleneck.png',

    // Jackets
    'Classic Leather Jacket': 'denim-jacket.png',
    'Denim Jacket': 'denim-jacket.png',

    // Blazers
    'Tailored Wool Blazer': 'navy-blazer.png',
    'Navy Blazer': 'navy-blazer.png',

    // Dresses
    'Linen Summer Dress': 'linen-summer-dress.png',
    'Red Cocktail Dress': 'red-cocktail-dress.png',

    // Blouses
    'Silk Charmeuse Blouse': 'silk-blouse.png',
    'Silk Blouse': 'silk-blouse.png',

    // Pants
    'Cargo Pants': 'cargo-pants.png',
    'Tailored Trousers': 'tailored-trousers.png',

    // Suits
    'Linen Summer Suit': 'linen-summer-suit.png',

    // Boots
    'Suede Chelsea Boots': 'chelsea-boots.png',
    'Chelsea Boots': 'chelsea-boots.png',
    'Waterproof Hiking Boots': 'chelsea-boots.png',

    // Shoes
    'Leather Loafers': 'leather-loafers.png',
    'White Sneakers': 'white-sneakers.png',
    'Ultraboost Running Sneakers': 'white-sneakers.png',
    'Canvas Slip-On Sneakers': 'white-sneakers.png',
    'Leather Ballet Flats': 'white-sneakers.png',
    'Strappy Block Heel Sandals': 'white-sneakers.png',

    // Bags
    'Quilted Leather Crossbody Bag': 'leather-messenger-bag.png',
    'Straw Crossbody': 'straw-crossbody.png',
    'Leather Messenger Bag': 'leather-messenger-bag.png',

    // Accessories
    'Polarized Aviator Sunglasses': 'aviator-sunglasses.png',
    'Aviator Sunglasses': 'aviator-sunglasses.png',
    'Leather Watch': 'leather-watch.png',
    'Italian Silk Scarf': 'wool-scarf.png',
    'Wool Scarf': 'wool-scarf.png',
    'Silver Necklace': 'silver-necklace.png',
    'Art Deco Statement Earrings': 'silver-necklace.png',
    'Reversible Leather Belt': 'leather-watch.png',
};

async function fixAllImageUrls() {
    console.log('🔧 Starting comprehensive image URL fix...\n');

    try {
        // Get all products
        const { data: products, error: fetchError } = await supabaseAdmin
            .from('products')
            .select('id, name, category, subcategory');

        if (fetchError) {
            throw new Error(`Failed to fetch products: ${fetchError.message}`);
        }

        console.log(`📦 Found ${products.length} products\n`);

        let updatedCount = 0;
        let notFoundCount = 0;

        for (const product of products) {
            // Try to find a matching image
            let imageFile = imageMapping[product.name];

            if (!imageFile) {
                console.log(`⚠️  No mapping for: ${product.name}`);
                notFoundCount++;
                continue;
            }

            const newImageUrl = `/images/products/${imageFile}`;

            const { error: updateError } = await supabaseAdmin
                .from('products')
                .update({ image_urls: [newImageUrl] })
                .eq('id', product.id);

            if (updateError) {
                console.error(`❌ Failed to update ${product.name}: ${updateError.message}`);
            } else {
                console.log(`✅ ${product.name} → ${imageFile}`);
                updatedCount++;
            }
        }

        console.log(`\n✨ Migration complete!`);
        console.log(`   Updated: ${updatedCount} products`);
        console.log(`   No mapping: ${notFoundCount} products`);

        // Verify
        console.log('\n🔍 Verifying sample products...');
        const { data: verify } = await supabaseAdmin
            .from('products')
            .select('name, image_urls')
            .limit(5);

        if (verify) {
            verify.forEach(p => console.log(`  ${p.name}: ${p.image_urls[0]}`));
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

fixAllImageUrls();
