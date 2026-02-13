/**
 * Clerk API Route — Sophia Chat Orchestrator
 *
 * Pipeline:
 *   1. Get user profile from Supabase
 *   2. Semantic search via FastAPI
 *   3. Inject results into Sophia (Gemini/fallback)
 *   4. Return AI response + tool_calls
 *
 * Rate Limiting:
 *   - 10 requests/user/minute (in-memory token bucket)
 *   - 200 requests/day global cap
 *   - Configurable via RATE_LIMIT_PER_USER and RATE_LIMIT_DAILY_GLOBAL env vars
 */

import { getProfile } from './user-profile.js';
import { createSophiaCompletion } from '../lib/ai-client.js';
import { addToCart } from './cart.js';
import { createCoupon } from './checkout.js';
import { generateTryonImage } from './tryon.js';
import { buildOutfit } from './outfits.js';

// ─── Sentiment Detection ───

function detectSentiment(message) {
    const rudePhrases = ['ripoff', 'scam', 'stupid', 'overpriced', 'robbery', 'waste', 'terrible', 'trash'];
    const politePhrases = ['please', 'thank you', 'appreciate', 'kindly', 'grateful', 'thanks'];

    const messageLower = message.toLowerCase();

    if (rudePhrases.some(phrase => messageLower.includes(phrase))) {
        return 'rude';
    }

    if (politePhrases.some(phrase => messageLower.includes(phrase))) {
        return 'polite';
    }

    return 'neutral';
}

// ─── Session State Management ───

const userSessions = new Map(); // userId → { activeCoupon, rudePriceIncrease, rudeMessageCount }

function getSession(userId) {
    if (!userSessions.has(userId)) {
        userSessions.set(userId, {
            activeCoupon: null,
            rudePriceIncrease: false,
            rudeMessageCount: 0,
        });
    }
    return userSessions.get(userId);
}

function handleRudeBehavior(session, sentiment) {
    if (sentiment === 'rude' && !session.rudePriceIncrease) {
        session.rudePriceIncrease = true;
        session.rudeMessageCount = 1;
        return {
            priceIncrease: true,
            message: "Ooh, with that attitude? Prices just went UP 5%. Want to try asking nicely? 😏",
        };
    }

    // Reset if user becomes polite (after 2 polite messages)
    if (sentiment === 'polite' && session.rudePriceIncrease) {
        session.rudeMessageCount++;
        if (session.rudeMessageCount >= 2) {
            session.rudePriceIncrease = false;
            session.rudeMessageCount = 0;
            return {
                priceReset: true,
                message: "Much better! Prices are back to normal. 😊",
            };
        }
    }

    return null;
}

// ─── Rate Limiter (in-memory) ───

const RATE_LIMIT_PER_USER = parseInt(process.env.RATE_LIMIT_PER_USER || '10', 10);
const RATE_LIMIT_DAILY_GLOBAL = parseInt(process.env.RATE_LIMIT_DAILY_GLOBAL || '200', 10);
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// Per-user: sliding window (1 minute)
const userBuckets = new Map(); // userId → { timestamps: number[] }

// Global: daily counter
let globalCounter = { count: 0, resetAt: Date.now() + 86400000 };

function resetGlobalIfNeeded() {
    if (Date.now() > globalCounter.resetAt) {
        globalCounter = { count: 0, resetAt: Date.now() + 86400000 };
    }
}

function checkRateLimit(userId) {
    // Global check
    resetGlobalIfNeeded();
    if (globalCounter.count >= RATE_LIMIT_DAILY_GLOBAL) {
        return {
            allowed: false,
            reason: `Daily AI limit reached (${RATE_LIMIT_DAILY_GLOBAL}/day). I need some rest! Try again tomorrow 😴`,
            retryAfterMs: globalCounter.resetAt - Date.now(),
        };
    }

    // Per-user check (sliding window)
    const now = Date.now();
    const windowMs = 60000; // 1 minute

    if (!userBuckets.has(userId)) {
        userBuckets.set(userId, { timestamps: [] });
    }

    const bucket = userBuckets.get(userId);
    // Remove timestamps older than 1 minute
    bucket.timestamps = bucket.timestamps.filter(t => now - t < windowMs);

    if (bucket.timestamps.length >= RATE_LIMIT_PER_USER) {
        const oldestTs = bucket.timestamps[0];
        const retryAfterMs = windowMs - (now - oldestTs);
        return {
            allowed: false,
            reason: `Slow down, champ! 🐢 You've sent ${RATE_LIMIT_PER_USER} messages this minute. Wait ${Math.ceil(retryAfterMs / 1000)}s.`,
            retryAfterMs,
        };
    }

    return { allowed: true };
}

function recordUsage(userId) {
    resetGlobalIfNeeded();
    globalCounter.count++;

    if (!userBuckets.has(userId)) {
        userBuckets.set(userId, { timestamps: [] });
    }
    userBuckets.get(userId).timestamps.push(Date.now());
}

// ─── Semantic Search Helper ───

async function searchProducts(query, userPreferences = {}, topK = 5) {
    try {
        const res = await fetch(`${FASTAPI_URL}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query,
                user_preferences: userPreferences,
                top_k: topK,
            }),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.warn(`⚠️ FastAPI /search failed (${res.status}): ${errText}`);
            return { products: [], error: `Search failed: ${res.status}` };
        }

        const data = await res.json();
        return { products: data.products || [], error: null, searchTimeMs: data.search_time_ms };
    } catch (err) {
        console.warn(`⚠️ FastAPI unreachable: ${err.message}`);
        return { products: [], error: `FastAPI unreachable: ${err.message}` };
    }
}

// ─── Main Handler ───

/**
 * Handle a clerk chat message.
 *
 * @param {{ userId: string, message: string, conversationHistory?: object[] }} params
 * @returns {Promise<{ message: string, toolCalls: object[]|null, searchResults: object[], provider: string, model: string, error?: string }>}
 */
export async function handleClerkMessage({ userId, message, conversationHistory = [] }) {
    // Validate
    if (!userId) {
        return { message: '', toolCalls: null, searchResults: [], provider: 'none', model: 'none', error: 'userId is required' };
    }
    if (!message || !message.trim()) {
        return { message: '', toolCalls: null, searchResults: [], provider: 'none', model: 'none', error: 'message is required' };
    }

    // Rate limit check
    const rateCheck = checkRateLimit(userId);
    if (!rateCheck.allowed) {
        return {
            message: rateCheck.reason,
            toolCalls: null,
            searchResults: [],
            provider: 'rate-limited',
            model: 'none',
            rateLimited: true,
            retryAfterMs: rateCheck.retryAfterMs,
        };
    }

    // 1. Get user profile (silent fail — Sophia works without it)
    let userProfile = null;
    try {
        const { profile } = await getProfile(userId);
        userProfile = profile;
    } catch (err) {
        console.warn(`⚠️ Could not fetch profile for ${userId}: ${err.message}`);
    }

    // 2. Semantic search via FastAPI
    const userPrefs = userProfile?.vibe_profile || {};
    const { products: searchResults, error: searchError, searchTimeMs } = await searchProducts(
        message,
        userPrefs,
        5
    );

    if (searchError) {
        console.warn(`⚠️ Search error (non-fatal): ${searchError}`);
    }

    // 3. Detect sentiment and handle rude behavior
    const sentiment = detectSentiment(message);
    const session = getSession(userId);
    const rudeResponse = handleRudeBehavior(session, sentiment);

    // 3b. Call AI with context
    try {
        recordUsage(userId);

        const aiResponse = await createSophiaCompletion({
            products: searchResults,
            userProfile,
            conversationHistory,
            userMessage: message,
        });

        // 4. Execute tool calls if present
        const toolCallResults = [];
        let cartUpdated = false;
        let cartItemCount = 0;
        let couponGenerated = false;
        let generatedCoupon = null;
        let tryonGenerated = false;
        let generatedTryon = null;
        let outfitGenerated = false;
        let generatedOutfit = null;

        if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
            for (const toolCall of aiResponse.toolCalls) {
                const functionName = toolCall.function?.name;
                const args = JSON.parse(toolCall.function?.arguments || '{}');

                if (functionName === 'add_to_cart') {
                    try {
                        const cartResult = await addToCart(
                            userId,
                            args.product_id,
                            args.quantity || 1,
                            args.size || null,
                            args.color || null
                        );
                        cartUpdated = true;
                        cartItemCount = cartResult.item_count;
                        toolCallResults.push({
                            tool: 'add_to_cart',
                            success: true,
                            product_id: args.product_id,
                            cart_item_count: cartItemCount,
                        });
                    } catch (err) {
                        toolCallResults.push({
                            tool: 'add_to_cart',
                            success: false,
                            error: err.message,
                        });
                    }
                }

                if (functionName === 'generate_discount') {
                    try {
                        const { percentage, reason, mood } = args;

                        // Generate coupon with 15-min expiry
                        const coupon = createCoupon(
                            userId,
                            `session_${userId}_${Date.now()}`, // sessionId
                            percentage,
                            reason,
                            15 // minutes
                        );

                        // Store in session for auto-apply
                        session.activeCoupon = coupon.code;

                        couponGenerated = true;
                        generatedCoupon = {
                            code: coupon.code,
                            percentage,
                            reason,
                            expiresAt: coupon.expiresAt,
                            mood: mood || 'friendly',
                        };

                        toolCallResults.push({
                            tool: 'generate_discount',
                            success: true,
                            coupon_code: coupon.code,
                            percentage,
                            expires_at: coupon.expiresAt,
                        });
                    } catch (err) {
                        toolCallResults.push({
                            tool: 'generate_discount',
                            success: false,
                            error: err.message,
                        });
                    }
                }

                if (functionName === 'generate_tryon') {
                    try {
                        const { product_id, product_type } = args;

                        // Generate AI try-on image
                        const tryonResult = await generateTryonImage(
                            userId,
                            product_id,
                            product_type || 'clothing'
                        );

                        tryonGenerated = true;
                        generatedTryon = {
                            try_on_id: tryonResult.try_on_id,
                            image_url: tryonResult.generated_image_url,
                            product_name: tryonResult.product_name,
                        };

                        toolCallResults.push({
                            tool: 'generate_tryon',
                            success: true,
                            try_on_id: tryonResult.try_on_id,
                            image_url: tryonResult.generated_image_url,
                        });
                    } catch (err) {
                        toolCallResults.push({
                            tool: 'generate_tryon',
                            success: false,
                            error: err.message,
                        });
                    }
                }

                // Tool 5: build_outfit - AI-curated complete outfits
                if (functionName === 'build_outfit') {
                    try {
                        const { occasion, budget, style, season } = args;

                        // Build complete outfit with budget allocation
                        const outfitResult = await buildOutfit(
                            userId,
                            occasion,
                            budget,
                            style || 'casual',
                            season || 'summer'
                        );

                        outfitGenerated = true;
                        generatedOutfit = {
                            outfit_id: outfitResult.outfit_id || null,
                            name: outfitResult.name,
                            items: outfitResult.items,
                            total_price: outfitResult.total_price,
                            original_price: outfitResult.original_price,
                            bundle_discount: outfitResult.bundle_discount,
                            occasion: outfitResult.occasion,
                            style: outfitResult.style,
                            season: outfitResult.season,
                        };

                        toolCallResults.push({
                            tool: 'build_outfit',
                            success: true,
                            item_count: outfitResult.items.length,
                            total_price: outfitResult.total_price,
                            bundle_discount: outfitResult.bundle_discount,
                        });
                    } catch (err) {
                        toolCallResults.push({
                            tool: 'build_outfit',
                            success: false,
                            error: err.message,
                        });
                    }
                }
                // filter_products is handled client-side, so we just pass it through
            }
        }

        return {
            message: aiResponse.message,
            toolCalls: aiResponse.toolCalls,
            toolCallResults,
            cartUpdated,
            cartItemCount,
            couponGenerated,
            generatedCoupon,
            tryonGenerated,
            generatedTryon,
            outfitGenerated,
            generatedOutfit,
            priceModifier: rudeResponse ? {
                type: rudeResponse.priceIncrease ? 'increase' : 'reset',
                percentage: 5,
                message: rudeResponse.message,
            } : null,
            sessionState: {
                hasActiveCoupon: !!session.activeCoupon,
                activeCouponCode: session.activeCoupon,
                rudePriceIncrease: session.rudePriceIncrease,
            },
            searchResults,
            provider: aiResponse.provider,
            model: aiResponse.model,
            searchTimeMs,
        };
    } catch (err) {
        console.error(`❌ AI completion failed: ${err.message}`);
        return {
            message: "I'm having trouble thinking right now. Please try again in a moment! 🤔",
            toolCalls: null,
            searchResults,
            provider: 'error',
            model: 'none',
            error: err.message,
        };
    }
}

/**
 * Get current rate limit status for a user.
 */
export function getRateLimitStatus(userId) {
    resetGlobalIfNeeded();

    const now = Date.now();
    const bucket = userBuckets.get(userId);
    const userCount = bucket
        ? bucket.timestamps.filter(t => now - t < 60000).length
        : 0;

    return {
        user: { used: userCount, limit: RATE_LIMIT_PER_USER, windowMs: 60000 },
        global: { used: globalCounter.count, limit: RATE_LIMIT_DAILY_GLOBAL },
    };
}
