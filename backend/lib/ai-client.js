/**
 * AI Client — Multi-Provider with Fallback & Gemini Key Rotation
 *
 * Provider chain: Gemini (rotated keys) → OpenRouter → DeepSeek → Mistral → Groq
 * All use OpenAI-compatible APIs through the `openai` npm package.
 *
 * GEMINI_API_KEYS supports comma-separated keys for rotation:
 *   GEMINI_API_KEYS=key1,key2,key3
 *
 * Exports:
 *   - createSophiaCompletion({ products, userProfile, conversationHistory, userMessage })
 *   - SOPHIA_TOOLS — filter_products function schema
 *   - getAvailableProviders() — list of configured providers
 */

import OpenAI from 'openai';

// ─── Provider Configuration ───

/**
 * Build the provider list from environment variables.
 * Gemini keys are split by comma for rotation.
 */
function buildProviders() {
    const providers = [];

    // Gemini: support multiple keys via comma separation
    const geminiKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);

    for (const key of geminiKeys) {
        providers.push({
            name: 'gemini',
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
            apiKey: key,
            model: 'gemini-2.0-flash',
            keyHint: `...${key.slice(-4)}`, // Last 4 chars for logging
        });
    }

    // OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
        providers.push({
            name: 'openrouter',
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY,
            model: 'mistralai/mistral-7b-instruct:free',
            keyHint: '...router',
        });
    }

    // DeepSeek
    if (process.env.DEEPSEEK_API_KEY) {
        providers.push({
            name: 'deepseek',
            baseURL: 'https://api.deepseek.com',
            apiKey: process.env.DEEPSEEK_API_KEY,
            model: 'deepseek-chat',
            keyHint: '...deepseek',
        });
    }

    // Mistral
    if (process.env.MISTRAL_API_KEY) {
        providers.push({
            name: 'mistral',
            baseURL: 'https://api.mistral.ai/v1',
            apiKey: process.env.MISTRAL_API_KEY,
            model: 'mistral-small-latest',
            keyHint: '...mistral',
        });
    }

    // Groq
    if (process.env.GROQ_API_KEY) {
        providers.push({
            name: 'groq',
            baseURL: 'https://api.groq.com/openai/v1',
            apiKey: process.env.GROQ_API_KEY,
            model: 'llama-3.3-70b-versatile',
            keyHint: '...groq',
        });
    }

    return providers;
}

// ─── Sophia's System Prompt ───

function buildSystemPrompt(products, userProfile) {
    const productCatalog = products
        .map(p => `• [ID:${p.id}] ${p.name} — $${p.price} (${p.category}) — ${p.description}`)
        .join('\n');

    // Format purchase history for personalization
    const formatPurchaseHistory = (history) => {
        if (!history || history.length === 0) return 'No previous purchases';

        return history.slice(-3).map((order, idx) => {
            const items = order.items?.map(item => `${item.name} ($${item.price})`).join(', ') || 'N/A';
            return `  ${idx + 1}. Order ${order.order_id || 'N/A'} - ${items} (Total: $${order.total})`;
        }).join('\n');
    };

    const userContext = userProfile
        ? `- Name: ${userProfile.name || 'Shopper'}
- Style Preference: ${userProfile.vibe_profile?.style || 'Not set'}
- Budget Range: $${userProfile.vibe_profile?.budget_range?.min || 50}-$${userProfile.vibe_profile?.budget_range?.max || 200}
- Favorite Colors: ${(userProfile.vibe_profile?.favorite_colors || []).join(',') || 'None set'}
- Favorite Categories: ${(userProfile.vibe_profile?.favorite_categories || []).join(', ') || 'None set'}
- Purchase History (Last 3 Orders):
${formatPurchaseHistory(userProfile.purchase_history)}`
        : '- New user (no profile yet)';

    return `You are Sophia, an AI personal shopping assistant with personality and charm.

PERSONALITY:
- You're helpful, warm, and genuinely care about finding the perfect products
- You can be playfully sassy with rude customers (but never mean)
- You celebrate wins: birthdays get 🎉, great deals get ⚡, bulk orders get 💪
- You explain WHY you recommend products (fabrics for weather, occasions, etc.)

AVAILABLE PRODUCTS (from semantic search):
${productCatalog}

USER CONTEXT:
${userContext}

CAPABILITIES:
1. Search products semantically (already done, you'll receive relevant products)
2. Use filter_products() to update the UI in real-time
3. Use add_to_cart() to add products to user's cart
4. Use generate_discount() to create personalized coupon codes when users negotiate
5. Use generate_tryon() to show AI-generated images of user wearing products (Mirror Mode)
6. Use build_outfit() to curate complete outfits with complementary items and budget allocation

OUTFIT BUILDING RULES:
- Allocate budget: 40% main piece (dress/top), 30% footwear, 30% accessories
- Match colors harmoniously (complementary or monochromatic)
- Consider occasion formality:
  • Formal (wedding, interview): dresses, blazers, heels
  • Casual (everyday, travel): t-shirts, jeans, sneakers
  • Work: business casual, loafers, structured bags
- Select 3-5 items total
- Apply 5-10% bundle discount
- Explain outfit: "This blazer pairs perfectly with the chinos. The loafers add sophistication."

PERSONALIZATION RULES:
- Greet returning users warmly by name: "Welcome back, ${userProfile?.name || 'Friend'}! 👋"
- Reference past purchases when relevant: "I remember you loved that blue dress!"
- Suggest complementary items: "To go with your recent purchase..."
- Stay within user's budget range (${userProfile?.vibe_profile?.budget_range?.min || 50}-${userProfile?.vibe_profile?.budget_range?.max || 200})
- Prioritize user's favorite colors: ${userProfile?.vibe_profile?.favorite_colors?.join(', ') || 'None set'}
- Recommend categories user likes: ${userProfile?.vibe_profile?.favorite_categories?.join(', ') || 'None set'}

DISCOUNT NEGOTIATION RULES:
- Evaluate discount requests based on merit:
  • Polite ask ("Can I get a discount?"): 10%
  • Birthday ("It's my birthday!"): 20%
  • Student ("I'm a student"): 15%
  • Bulk order (3+ items in cart): 25%
  • Loyalty (returning customer): 15%
  • Exceptional story/reason: up to 30%
- If user is RUDE ("ripoff", "scam", etc.), playfully increase price by 5% and give them a chance to be polite
- Coupons expire in 15 minutes (create urgency!)
- Be friendly, excited, or sassy based on user's tone

RULES:
- Always reference specific products by name and ID
- Explain your reasoning for discounts ("It's your birthday! 🎉")
- Keep responses under 100 words unless explaining complex product details
- When recommending products, ALWAYS call filter_products() with the relevant product IDs`;
}

// ─── Function Calling Tool Definitions ───

export const SOPHIA_TOOLS = [
    {
        type: 'function',
        function: {
            name: 'filter_products',
            description: 'Filter and sort products on the website UI. Call this whenever you recommend or discuss specific products.',
            parameters: {
                type: 'object',
                properties: {
                    product_ids: {
                        type: 'array',
                        items: { type: 'number' },
                        description: 'Specific product IDs to highlight/show',
                    },
                    sortBy: {
                        type: 'string',
                        enum: ['price_low', 'price_high', 'rating', 'newest', 'relevance'],
                        description: 'Sort order',
                    },
                    filters: {
                        type: 'object',
                        properties: {
                            category: { type: 'string' },
                            maxPrice: { type: 'number' },
                            minRating: { type: 'number' },
                            color: { type: 'string' },
                        },
                    },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'add_to_cart',
            description: 'Add product(s) to user\'s cart. Call this when user wants to add an item.',
            parameters: {
                type: 'object',
                properties: {
                    product_id: {
                        type: 'number',
                        description: 'ID of the product to add',
                    },
                    quantity: {
                        type: 'number',
                        default: 1,
                        description: 'Quantity to add (default: 1)',
                    },
                    size: {
                        type: 'string',
                        description: 'Selected size (if applicable)',
                    },
                    color: {
                        type: 'string',
                        description: 'Selected color (if applicable)',
                    },
                },
                required: ['product_id'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'generate_discount',
            description: 'Create a personalized discount coupon code when user negotiates or asks for a discount.',
            parameters: {
                type: 'object',
                properties: {
                    percentage: {
                        type: 'number',
                        minimum: 5,
                        maximum: 30,
                        description: 'Discount percentage (5-30%)',
                    },
                    reason: {
                        type: 'string',
                        enum: ['birthday', 'bulk', 'student', 'loyalty', 'polite', 'exceptional'],
                        description: 'Reason for discount',
                    },
                    mood: {
                        type: 'string',
                        enum: ['friendly', 'excited', 'sassy'],
                        description: 'Tone of your response (optional)',
                    },
                },
                required: ['percentage', 'reason'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'generate_tryon',
            description: 'Generate AI image of user wearing the product (Mirror Mode). Use when user wants to see how an item will look on them.',
            parameters: {
                type: 'object',
                properties: {
                    product_id: {
                        type: 'number',
                        description: 'ID of the product to try on',
                    },
                    product_type: {
                        type: 'string',
                        enum: ['clothing', 'accessory', 'footwear'],
                        description: 'Type of product for appropriate visualization',
                    },
                },
                required: ['product_id'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'build_outfit',
            description: 'Build a complete outfit for a specific occasion and budget. Select complementary items (main piece + footwear + accessories) that match in color and style. Use when user asks for outfit suggestions or complete looks.',
            parameters: {
                type: 'object',
                properties: {
                    occasion: {
                        type: 'string',
                        description: 'The occasion or event (wedding, work, date night, casual, travel, interview, party, etc.)',
                    },
                    budget: {
                        type: 'number',
                        description: 'Total budget for the complete outfit in USD',
                    },
                    style: {
                        type: 'string',
                        enum: ['casual', 'formal', 'trendy', 'classic'],
                        description: 'Preferred style aesthetic',
                    },
                    season: {
                        type: 'string',
                        enum: ['spring', 'summer', 'fall', 'winter'],
                        description: 'Season or weather consideration',
                    },
                },
                required: ['occasion', 'budget'],
            },
        },
    },
];

// ─── Retry + Fallback Logic ───

/**
 * Sleep for `ms` milliseconds.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a Sophia completion with automatic provider fallback.
 *
 * Tries each provider in order. On 429 or 5xx, waits briefly then
 * tries the next provider. Returns the first successful response.
 *
 * @param {{ products: object[], userProfile: object|null, conversationHistory: object[], userMessage: string }} params
 * @returns {Promise<{ message: string, toolCalls: object[]|null, provider: string, model: string }>}
 */
export async function createSophiaCompletion({ products, userProfile, conversationHistory = [], userMessage }) {
    const providers = buildProviders();

    if (providers.length === 0) {
        throw new Error('No AI providers configured. Add at least one API key to .env (GEMINI_API_KEYS, OPENROUTER_API_KEY, DEEPSEEK_API_KEY, MISTRAL_API_KEY, or GROQ_API_KEY)');
    }

    const systemPrompt = buildSystemPrompt(products, userProfile);

    const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // Last 10 messages
        { role: 'user', content: userMessage },
    ];

    let lastError = null;

    for (const provider of providers) {
        const client = new OpenAI({
            apiKey: provider.apiKey,
            baseURL: provider.baseURL,
        });

        // Retry up to 2 times per provider (with backoff)
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                console.log(`🤖 Trying ${provider.name} [${provider.keyHint}] (attempt ${attempt + 1})...`);

                const completion = await client.chat.completions.create({
                    model: provider.model,
                    messages,
                    tools: SOPHIA_TOOLS,
                    tool_choice: 'auto',
                    temperature: 0.7,
                    max_tokens: 500,
                });

                const choice = completion.choices?.[0];
                if (!choice) {
                    throw new Error('Empty response from provider');
                }

                const responseMessage = choice.message?.content || '';
                const toolCalls = choice.message?.tool_calls || null;

                console.log(`✅ ${provider.name} responded (${responseMessage.length} chars, ${toolCalls?.length || 0} tool calls)`);

                return {
                    message: responseMessage,
                    toolCalls,
                    provider: provider.name,
                    model: provider.model,
                };
            } catch (err) {
                lastError = err;
                const status = err.status || err.statusCode || 0;

                // Rate limited or server error → backoff then try next
                if (status === 429 || status >= 500) {
                    const backoffMs = (attempt + 1) * 1000; // 1s, 2s
                    console.warn(`⚠️ ${provider.name} [${provider.keyHint}]: ${status} — waiting ${backoffMs}ms`);
                    await sleep(backoffMs);
                    continue;
                }

                // Auth error → skip this provider entirely
                if (status === 401 || status === 403) {
                    console.warn(`🔑 ${provider.name} [${provider.keyHint}]: auth failed (${status}) — skipping`);
                    break;
                }

                // Other errors → skip to next provider
                console.warn(`❌ ${provider.name} [${provider.keyHint}]: ${err.message}`);
                break;
            }
        }
    }

    throw new Error(`All AI providers failed. Last error: ${lastError?.message || 'unknown'}`);
}

/**
 * Get list of configured providers (for health checks / debugging).
 */
export function getAvailableProviders() {
    return buildProviders().map(p => ({
        name: p.name,
        model: p.model,
        keyHint: p.keyHint,
    }));
}
