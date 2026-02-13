/**
 * Test: Phase 3 — Product Catalog & Display
 * 
 * Verifies:
 *   1. Module imports
 *   2. products table exists with 20 rows
 *   3. getProducts() returns all 20
 *   4. getProductById(1) returns correct product
 *   5. getProductById(999) returns null
 *   6. getProductsByCategory('clothing') returns 7
 *   7. getProductsByCategory('accessories') returns 7
 *   8. getProductsByCategory('footwear') returns 6
 *   9. getProductsByCategory('invalid') returns error
 *  10. getProducts with price filter works
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 === PHASE 3: PRODUCT CATALOG & DISPLAY ===\n');

// ─── Test 1: Import products module ───
console.log('--- Test 1: Import products.js ---');
let getProducts, getProductById, getProductsByCategory;
try {
    ({ getProducts, getProductById, getProductsByCategory } = await import('./routes/products.js'));
    console.log(`  getProducts:           ${typeof getProducts === 'function' ? '✅' : '❌'}`);
    console.log(`  getProductById:        ${typeof getProductById === 'function' ? '✅' : '❌'}`);
    console.log(`  getProductsByCategory: ${typeof getProductsByCategory === 'function' ? '✅' : '❌'}`);
} catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
    process.exit(1);
}

// ─── Test 2: products table has 20 rows ───
console.log('\n--- Test 2: products table has 20 rows ---');
try {
    const { supabase } = await import('./lib/supabase.js');
    const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.log(`  ❌ Query failed: ${error.message}`);
    } else if (count === 20) {
        console.log(`  ✅ Table has exactly 20 products`);
    } else {
        console.log(`  ❌ Expected 20, got ${count}`);
    }
} catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`);
}

// ─── Test 3: getProducts() returns all 20 ───
console.log('\n--- Test 3: getProducts() → 20 items ---');
try {
    const { products, error } = await getProducts();
    if (error) {
        console.log(`  ❌ Error: ${error}`);
    } else if (products.length === 20) {
        console.log(`  ✅ Returned all 20 products`);
    } else {
        console.log(`  ❌ Expected 20, got ${products.length}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 4: getProductById(1) returns first product ───
console.log('\n--- Test 4: getProductById(1) → Linen Summer Dress ---');
try {
    const { product, error } = await getProductById(1);
    if (error) {
        console.log(`  ❌ Error: ${error}`);
    } else if (product && product.name === 'Linen Summer Dress') {
        console.log(`  ✅ Found "${product.name}" at $${product.price}`);
    } else if (product) {
        console.log(`  ⚠️ Found product but name is "${product.name}"`);
    } else {
        console.log(`  ❌ Product not found`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 5: getProductById(999) → null ───
console.log('\n--- Test 5: getProductById(999) → null ---');
try {
    const { product, error } = await getProductById(999);
    if (!product && !error) {
        console.log(`  ✅ Correctly returned null (product does not exist)`);
    } else if (error) {
        console.log(`  ⚠️ Returned error: "${error}"`);
    } else {
        console.log(`  ❌ Unexpected product: ${JSON.stringify(product)}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 6: getProductsByCategory('clothing') → 7 ───
console.log('\n--- Test 6: getProductsByCategory("clothing") → 7 ---');
try {
    const { products, error } = await getProductsByCategory('clothing');
    if (error) {
        console.log(`  ❌ Error: ${error}`);
    } else if (products.length === 7) {
        console.log(`  ✅ Found 7 clothing items`);
    } else {
        console.log(`  ❌ Expected 7, got ${products.length}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 7: getProductsByCategory('accessories') → 7 ───
console.log('\n--- Test 7: getProductsByCategory("accessories") → 7 ---');
try {
    const { products, error } = await getProductsByCategory('accessories');
    if (error) {
        console.log(`  ❌ Error: ${error}`);
    } else if (products.length === 7) {
        console.log(`  ✅ Found 7 accessories`);
    } else {
        console.log(`  ❌ Expected 7, got ${products.length}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 8: getProductsByCategory('footwear') → 6 ───
console.log('\n--- Test 8: getProductsByCategory("footwear") → 6 ---');
try {
    const { products, error } = await getProductsByCategory('footwear');
    if (error) {
        console.log(`  ❌ Error: ${error}`);
    } else if (products.length === 6) {
        console.log(`  ✅ Found 6 footwear items`);
    } else {
        console.log(`  ❌ Expected 6, got ${products.length}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 9: getProductsByCategory('invalid') → error ───
console.log('\n--- Test 9: getProductsByCategory("invalid") → error ---');
try {
    const { products, error } = await getProductsByCategory('invalid');
    if (error && error.includes('Invalid category')) {
        console.log(`  ✅ Correctly rejected: "${error}"`);
    } else {
        console.log(`  ❌ Unexpected: error=${error}, count=${products.length}`);
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

// ─── Test 10: getProducts with price filter ───
console.log('\n--- Test 10: getProducts({ maxPrice: 100 }) ---');
try {
    const { products, error } = await getProducts({ maxPrice: 100 });
    if (error) {
        console.log(`  ❌ Error: ${error}`);
    } else {
        const allUnder100 = products.every(p => parseFloat(p.price) <= 100);
        if (allUnder100 && products.length > 0) {
            console.log(`  ✅ Found ${products.length} products under $100 (all prices valid)`);
        } else if (products.length === 0) {
            console.log(`  ⚠️ No products under $100 found`);
        } else {
            console.log(`  ❌ Some products exceed $100`);
        }
    }
} catch (err) {
    console.log(`  ❌ CRASHED: ${err.message}`);
}

console.log('\n🏁 === ALL PHASE 3 TESTS COMPLETE ===\n');
