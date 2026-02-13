# Product Requirements Document (PRD)
# AI-Powered E-Commerce Platform: "The Shopkeeper"

**Project Name:** The Shopkeeper - AI Shopping Assistant Platform  
**Version:** 1.0  
**Date:** February 13, 2026  
**Team:** AgentX
**Hackathon:** Softronix 4.0 Web Development Hackathon  
**Timeline:** 24 Hours  
**Theme:** Don't just build a shop. Build a Shopkeeper.

---

## 1. Executive Summary

### Problem Statement
Traditional fashion e-commerce platforms are static catalogs where users must manually browse through countless clothing items, accessories, and footwear without personalized guidance. There's no way to visualize how items will look on them, no conversational styling advice, and no ability to negotiate prices like in a physical boutique. This leads to decision paralysis, cart abandonment, and buyer's remorse.

### Proposed Solution
**"The Shopkeeper"** is an AI-powered fashion e-commerce platform featuring **Sophia**, an intelligent personal stylist that transforms passive browsing into an interactive boutique experience. Built exclusively for **clothing, fashion accessories, and footwear**, Sophia offers:
- **Semantic Search**: Natural language product discovery using RAG (Retrieval-Augmented Generation)
- **Mirror Mode**: AI-generated images showing users wearing selected outfits
- **Voice Shopping**: Hands-free browsing and purchasing through voice commands
- **Outfit Builder**: Curated complete outfits based on budget, occasion, and style preferences
- **Comparison Mode**: Side-by-side AI-powered product analysis
- **Real-Time UI Manipulation**: Voice-commanded filtering, sorting, and product highlighting
- **Haggle Mode**: Intelligent price negotiation with personalized discount generation
- **Vibe-Based Personalization**: Learning user style preferences to curate experiences

Users can complete entire purchases through conversation alone, visualize themselves in products before buying, and get expert styling advice—all without clicking a single button.

### Success Criteria (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Zero-Click Shopping Success** | 100% | User can purchase solely through chat/voice commands |
| **Semantic Search Relevance** | ≥90% | User query matches fashion recommendations (manual eval) |
| **Mirror Mode Accuracy** | ≥85% | AI-generated try-on images look realistic |
| **Voice Recognition Accuracy** | ≥95% | Voice commands correctly interpreted |
| **Outfit Builder Satisfaction** | ≥85% | Users approve of curated complete outfits |
| **UI Sync Latency** | <500ms | Time from AI function call to UI update |
| **Haggle Mode Engagement** | ≥80% | Users who negotiate receive personalized discount |
| **Demo "Wow" Factor** | <30 seconds | Judges express amazement within first 30s of demo |
| **Function Calling Accuracy** | ≥95% | AI correctly triggers all function calls |

---

## 2. User Experience & Functionality

### 2.1 User Personas

#### Primary: Sarah - The Busy Professional
- **Age:** 28-35  
- **Occupation:** Marketing Manager  
- **Pain Point:** No time to browse hundreds of products  
- **Goal:** Find exactly what she needs in under 2 minutes  
- **Quote:** *"I wish I could just describe what I want and have it appear"*  
- **Tech Comfort:** High (uses AI assistants daily)  

#### Secondary: Alex - The Budget-Conscious Student
- **Age:** 19-24  
- **Occupation:** University Student  
- **Pain Point:** Loves deals but hates feeling ripped off  
- **Goal:** Get the best possible price through negotiation  
- **Quote:** *"I always feel like I'm overpaying. I wish I could haggle like in a real store"*  
- **Tech Comfort:** Very High (Gen-Z digital native)  

#### Tertiary: Mike - The Gift Buyer
- **Age:** 30-45  
- **Occupation:** Software Engineer  
- **Pain Point:** Clueless about what to buy for family/friends  
- **Goal:** Expert guidance without judgment  
- **Quote:** *"I need someone to just tell me what to buy. I have no idea"*  
- **Tech Comfort:** High (technical but not fashion-savvy)  

---

### 2.2 User Stories & Acceptance Criteria

#### Epic 1: Conversational Product Discovery

**US-1.1: Semantic Search**
```
As a user,
I want to describe what I need in natural language,
So that I don't have to manually search through categories.
```

**Acceptance Criteria:**
- [ ] User can type queries like "I need an outfit for a summer wedding in Italy"
- [ ] System returns 3-5 semantically relevant products within 2 seconds
- [ ] Results include products with contextual tags (summer, wedding, formal, light fabrics)
- [ ] Products display as rich cards with: image, name, price, rating, quick-add button
- [ ] Each card includes direct hyperlink to product detail page
- [ ] Clerk explains WHY each product was recommended

**Example Input/Output:**
```
Input: "I need an outfit for a summer wedding in Italy"
Output: 
- Linen Summer Suit (light beige) - $149
- Breathable Cotton Dress Shirt (white) - $59  
- Italian Leather Loafers (tan) - $129
Clerk: "Perfect! For an Italian summer wedding, I recommend breathable fabrics. 
These pieces work great in 85°F+ heat."
```

---

**US-1.2: Inventory Awareness**
```
As a user,
I want to ask if items are available in specific variants,
So that I don't waste time on out-of-stock products.
```

**Acceptance Criteria:**
- [ ] User can ask "Do you have this in blue?" or "Size Medium available?"
- [ ] System checks product variant data (color, size, stock count)
- [ ] Response includes: stock status, available variants, ETA if out of stock
- [ ] If unavailable, suggests 2-3 similar in-stock alternatives
- [ ] Displays stock urgency ("Only 3 left!") when low

---

**US-1.3: Multi-Turn Contextual Conversations**
```
As a user,
I want the AI to remember our conversation,
So that I don't have to repeat myself.
```

**Acceptance Criteria:**
- [ ] System maintains conversation history (minimum 10 messages per session)
- [ ] Can reference previous items ("Show me cheaper versions of that dress")
- [ ] Remembers user preferences mentioned ("I like blue" → future suggestions prioritize blue)
- [ ] Context persists for session duration (until page refresh or logout)
- [ ] Can ask follow-up questions without re-contextualizing

---

#### Epic 2: Real-Time UI Manipulation (The "Vibe Filter")

**US-2.1: Voice-Commanded Sorting & Filtering**
```
As a user,
I want the website UI to update when I ask for different sorting,
So that I can shop hands-free.
```

**Acceptance Criteria:**
- [ ] Command "Show me cheaper options" → Products sort by price ascending
- [ ] Product grid re-renders within 500ms of command
- [ ] Smooth animation during transition (fade-out → re-order → fade-in)
- [ ] Clerk confirms action: "Done! Showing lowest prices first"
- [ ] Supported filters:
  - Price (low to high, high to low)
  - Rating (highest first)
  - Category (clothing, accessories, footwear)
  - Color (user-specified)
  - Newest arrivals
- [ ] Multiple filters can stack ("Show me blue dresses under $50, highest rated")

---

**US-2.2: Dynamic Product Highlighting**
```
As a user,
I want recommended products to be visually highlighted,
So that I can easily spot what Sophia suggests.
```

**Acceptance Criteria:**
- [ ] AI-recommended products get visual treatment:
  - Glowing border (gold/accent color)
  - "Sophia Recommends" badge overlay
  - Subtle pulse animation (1.5s duration)
- [ ] Auto-scroll to first recommended product with smooth animation
- [ ] Highlighting persists until user clears or makes new query
- [ ] User can manually dismiss highlights via "Clear Recommendations" button

---

#### Epic 3: Haggle Mode (Intelligent Negotiation)

**US-3.1: Discount Negotiation**
```
As a user,
I want to ask for discounts and receive personalized deals,
So that I feel valued and get special treatment.
```

**Acceptance Criteria:**
- [ ] User can request discount with natural language:
  - "Can I get a discount?"
  - "That's too expensive"
  - "It's my birthday!"
  - "I'm buying 3 items"
- [ ] System evaluates reason quality using sentiment analysis + rule-based logic
- [ ] Generates unique coupon code with format: `REASON-XX` (e.g., BDAY-20)
- [ ] Discount tiers based on merit:
  - Polite ask: 5-10%
  - Good reason (birthday, student, loyalty): 15-20%
  - Bulk order (3+ items): 20-25%
  - Exceptional story: up to 30%
- [ ] Coupon auto-applies to cart session
- [ ] Displays countdown timer: "Expires in 15 minutes" for urgency
- [ ] Coupon is single-use and session-locked

**Discount Logic Table:**

| User Input | Sentiment | Discount | Coupon Code | Clerk Response |
|------------|-----------|----------|-------------|----------------|
| "It's my birthday" | Positive | 20% | BDAY-20 | "Happy Birthday! 🎉 Here's 20% off!" |
| "Can I get a discount?" | Neutral | 10% | LOYAL-10 | "You seem nice! 10% off for you" |
| "I'm buying 5 items" | Bulk | 25% | BULK-25 | "Bulk order! Let's do 25% off" |
| "This is a ripoff" | Negative | -5% | N/A | "Price just went UP 5%. Want to try again? 😏" |

---

**US-3.2: Sentiment-Based Dynamic Pricing**
```
As a system (negative scenario),
When a user is rude or demanding,
The AI should playfully raise the price to encourage better behavior.
```

**Acceptance Criteria:**
- [ ] Detects negative sentiment keywords: "ripoff", "scam", "stupid", demands
- [ ] Responds with sassy but playful personality
- [ ] Temporarily increases price by 5% (visual strike-through + new price)
- [ ] Gives user chance to "ask nicely"
- [ ] Resets to original price if user improves tone within 2 messages
- [ ] Never raises price more than once per session

**Example:**
```
User: "This is a ripoff. Lower the price NOW."
Sophia: "Ooh, with that attitude? The price just went UP to $84.50 (was $79.99). 
Want to ask nicely? I'm a lot nicer when you are! 😊"
```

---

**US-3.3: Coupon Redemption at Checkout**
```
As a user,
I want generated coupons to actually work,
So that my negotiation has real impact.
```

**Acceptance Criteria:**
- [ ] Coupon code appears in chat + auto-copies to clipboard
- [ ] Cart/Checkout page shows coupon input field
- [ ] Applying code updates order total instantly (no page reload)
- [ ] Displays savings amount: "You saved $15.99!"
- [ ] Invalid/expired coupons show clear error: "Code expired. Chat with Sophia for a new deal!"
- [ ] Coupon details persist in order summary

---

#### Epic 4: Mirror Mode - Virtual Try-On

**US-4.1: AI-Powered Outfit Visualization**
```
As a user,
I want to see how clothes will look on me before buying,
So that I can make confident purchase decisions.
```

**Acceptance Criteria:**
- [ ] User can upload/take photo during login or from profile settings
- [ ] Photo stored securely in Supabase Storage (encrypted)
- [ ] When user selects a product (clothing/accessory/footwear), "Try On" button appears
- [ ] Clicking "Try On" triggers AI image generation (Replicate API or Stable Diffusion)
- [ ] Generated image shows user wearing the selected item
- [ ] Image generation completes within 10-15 seconds
- [ ] User can save try-on images to "My Looks" gallery
- [ ] Sophia comments on the outfit: "That looks amazing on you! The colors match your skin tone perfectly."
- [ ] Works for: dresses, shirts, jackets, accessories (sunglasses, hats), and footwear

**Technical Implementation:**
```javascript
// Function call from Gemini
{
  "name": "generate_tryon",
  "description": "Generate AI image of user wearing product",
  "parameters": {
    "product_id": { "type": "number" },
    "user_image_url": { "type": "string" },
    "product_type": { "type": "string", "enum": ["clothing", "accessory", "footwear"] }
  }
}
```

**AI Service Options:**
1. **Replicate API** (Recommended): Virtual try-on models (e.g., `tryon-diffusion`)
2. **Stable Diffusion + ControlNet**: Inpainting with product overlay
3. **Simple Overlay** (Fallback): CSS-based basic visualization

**Demo Flow:**
```
User: "Show me that blue dress on me"
Sophia: "Let me generate a preview for you! ✨"
[15 second generation]
Sophia: "Here you go! The blue brings out your eyes. Want to add matching heels?"
[Shows AI-generated image of user in blue dress]
```

---

#### Epic 5: Voice Shopping Mode

**US-5.1: Voice Command Shopping**
```
As a user,
I want to shop using voice commands,
So that I can browse hands-free while multitasking.
```

**Acceptance Criteria:**
- [ ] "Voice Mode" toggle button in header (microphone icon)
- [ ] Uses Web Speech API (browser-based, no external service needed)
- [ ] Continuous listening when voice mode is active
- [ ] Visual feedback: animated microphone icon pulses during listening
- [ ] Transcription appears in chat interface in real-time
- [ ] Sophia responds with voice output (Text-to-Speech)
- [ ] Supports all chat commands:
  - "Show me summer dresses"
  - "Add the second one to cart"
  - "Can I get a discount?"
  - "Checkout"
- [ ] Works on mobile Safari, Chrome, Firefox
- [ ] User can switch between voice and text seamlessly

**Technical Implementation:**
```javascript
// Web Speech API
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript;
  sendToClerk(transcript);
};

// Text-to-Speech for Sophia's response
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = getVoice('Google UK English Female');
  utterance.rate = 1.1; // Slightly faster for natural feel
  window.speechSynthesis.speak(utterance);
};
```

**Demo Flow:**
```
User: [Clicks microphone] "Hey Sophia, I need a dress for a wedding"
Sophia: [Voice] "Great! What's your budget and preferred colors?"
User: "Under $100, I love blue"
Sophia: [Voice] "Perfect! I found 4 stunning blue dresses. The second one is a bestseller."
[Products appear with blue dresses highlighted]
```

---

#### Epic 6: Outfit Builder - Complete Look Curation

**US-6.1: AI-Curated Complete Outfits**
```
As a user,
I want Sophia to build complete outfits for me,
So that I don't have to worry about matching items.
```

**Acceptance Criteria:**
- [ ] User triggers with command: "Build me an outfit for [occasion] within [budget]"
- [ ] Sophia asks clarifying questions if needed:
  - Occasion (wedding, work, date night, casual, travel)
  - Budget (total for complete outfit)
  - Style preference (casual, formal, trendy, classic)
  - Season/weather
- [ ] System selects 3-5 complementary items:
  - Top + Bottom OR Dress
  - Footwear
  - 1-2 Accessories (bag, jewelry, sunglasses)
- [ ] Displays outfit as a curated "bundle" card with:
  - All items in one visual layout
  - Total price with bundle discount (5-10% off)
  - "Add Complete Outfit to Cart" button
  - Individual item links
- [ ] Sophia explains the outfit: "This linen blazer pairs perfectly with the chinos. The loafers add sophistication."
- [ ] User can swap individual items: "Change the shoes"
- [ ] Generates shareable outfit link: `/outfit/summer-wedding-123`

**Technical Implementation:**
```javascript
// Function call
{
  "name": "build_outfit",
  "description": "Curate a complete outfit based on criteria",
  "parameters": {
    "occasion": { "type": "string" },
    "budget": { "type": "number" },
    "style": { "type": "string", "enum": ["casual", "formal", "trendy", "classic"] },
    "season": { "type": "string" }
  }
}
```

**Outfit Matching Logic:**
```javascript
function buildOutfit(occasion, budget, style) {
  // 1. Allocate budget intelligently
  const budgetSplit = {
    mainPiece: budget * 0.40,  // Dress or blazer
    footwear: budget * 0.30,
    accessories: budget * 0.30
  };
  
  // 2. Match by color harmony
  const colorPalettes = {
    summer: ['white', 'beige', 'light blue', 'coral'],
    formal: ['black', 'navy', 'charcoal', 'burgundy']
  };
  
  // 3. Style consistency (tags matching)
  const mainItem = findProduct({ occasion, price: < budgetSplit.mainPiece });
  const shoes = findProduct({ tags: mainItem.tags, category: 'footwear' });
  const accessory = findProduct({ color: complementaryColor(mainItem.color) });
  
  return {
    items: [mainItem, shoes, accessory],
    total: sum(prices),
    bundleDiscount: 10 // percentage
  };
}
```

**Demo Flow:**
```
User: "Build me an outfit for a summer wedding, budget $300"
Sophia: "Love it! Outdoor or indoor wedding?"
User: "Outdoor, on a beach"
Sophia: "Perfect! Here's a breathable linen look:"

[Outfit Card]
- Linen Summer Suit (Beige) - $149
- Leather Loafers (Tan) - $89
- Woven Belt (Brown) - $35
- Sunglasses (Aviator) - $45

Total: $318 → Bundle Price: $286 (Save $32!)

Sophia: "This outfit breathes well in heat and looks effortlessly elegant. The neutral tones work with any beach setting."
```

---

#### Epic 7: Comparison Mode - Smart Product Analysis

**US-7.1: Side-by-Side Product Comparison**
```
As a user,
I want to compare similar products side-by-side,
So that I can make informed decisions.
```

**Acceptance Criteria:**
- [ ] User triggers with: "Compare the blue dress and the red dress"
- [ ] System identifies products from context or recent viewed items
- [ ] Displays comparison table with:
  - Images side-by-side
  - Price comparison
  - Features breakdown (material, sizes, care instructions)
  - Reviews/ratings
  - Stock availability
  - "Winner" column with checkmarks
- [ ] Sophia provides AI analysis:
  - "The blue dress has better reviews and is $20 cheaper"
  - "The red dress has more sizes in stock"
  - "For your budget, I recommend the blue one"
- [ ] User can add to comparison: "Add the green dress"
- [ ] Supports up to 4 products at once
- [ ] "Add Winner to Cart" quick action button

**Technical Implementation:**
```javascript
// Function call
{
  "name": "compare_products",
  "description": "Generate side-by-side comparison of products",
  "parameters": {
    "product_ids": {
      "type": "array",
      "items": { "type": "number" },
      "minItems": 2,
      "maxItems": 4
    },
    "criteria": {
      "type": "array",
      "items": { "type": "string", "enum": ["price", "quality", "reviews", "versatility"] }
    }
  }
}
```

**Comparison Table Format:**
```
| Feature          | Blue Linen Dress | Red Cotton Dress | Winner |
|------------------|------------------|------------------|--------|
| Price            | $79.99           | $99.99           | 🏆 Blue  |
| Rating           | 4.7⭐ (89)       | 4.5⭐ (45)       | 🏆 Blue  |
| Material         | 100% Linen       | Cotton Blend     | Tie    |
| Sizes Available  | XS-L             | XS-XXL           | 🏆 Red   |
| Stock            | 15 units         | 3 units          | 🏆 Blue  |
| Care             | Machine wash     | Hand wash only   | 🏆 Blue  |
```

**Sophia's AI Analysis:**
```javascript
function analyzeComparison(products, userPreferences) {
  const analysis = [];
  
  // Price winner
  const cheapest = min(products, 'price');
  analysis.push(`The ${cheapest.name} is the most budget-friendly at $${cheapest.price}`);
  
  // Quality winner
  const highestRated = max(products, 'rating');
  analysis.push(`${highestRated.name} has better reviews (${highestRated.rating}⭐)`);
  
  // User preference match
  if (userPreferences.budget === 'low') {
    analysis.push(`For your budget, I'd go with the ${cheapest.name}`);
  }
  
  // Stock urgency
  const lowStock = products.filter(p => p.stock < 5);
  if (lowStock.length) {
    analysis.push(`⚠️ ${lowStock[0].name} is almost sold out!`);
  }
  
  return analysis.join(' ');
}
```

**Demo Flow:**
```
User: "I can't decide between the blue dress and the white dress"
Sophia: "Let me help! I'll compare them for you."

[Displays comparison table]

Sophia: "The blue dress wins on price ($20 cheaper) and has higher ratings. But the white dress has your size in stock while blue only has S and M. Which matters more to you—price or perfect fit?"

User: "Price"
Sophia: "Blue dress it is! Added to your cart. Want to see it on you with Mirror Mode?"
```

---

#### Epic 8: Personalization & Memory

**US-4.1: User Vibe Profiling**
```
As a new user,
I want to complete a quick style quiz,
So that recommendations match my preferences.
```

**Acceptance Criteria:**
- [ ] First-time users see 5-question quiz (optional, can skip)
- [ ] Questions cover: style (casual/formal), budget (low/mid/high), colors, occasion frequency
- [ ] Stores vibe profile in Supabase user_profiles table as JSONB
- [ ] Future searches bias toward user's vibe (e.g., "casual" users see relaxed fits first)
- [ ] User can update vibe profile from account settings
- [ ] Quiz takes <60 seconds to complete

**Sample Questions:**
1. Your ideal weekend outfit? (Jeans & T-shirt / Smart casual / Athleisure)
2. Budget for a new jacket? ($30-50 / $50-100 / $100+)
3. Favorite colors? (Multi-select color palette)
4. Shop for: (Work / Events / Everyday / Gifts)
5. Shopping frequency? (Weekly / Monthly / Occasionally)

---

**US-4.2: Purchase History Recommendations**
```
As a returning user,
I want product suggestions based on what I've bought before,
So that I discover complementary items.
```

**Acceptance Criteria:**
- [ ] System tracks purchase history in Supabase (user_profiles.purchase_history JSONB)
- [ ] Clerk references past purchases: "You loved that blue dress! Here's a matching scarf"
- [ ] Recommendation engine uses collaborative filtering:
  - Products frequently bought together
  - Same category, different variant
  - Seasonal updates (winter coat → suggest gloves)
- [ ] User can opt-out of history tracking via privacy settings

---

### 2.3 Non-Goals (Out of Scope for Hackathon)

To protect the 24-hour timeline, we will **NOT** build:

- ❌ Real payment processing (Stripe/PayPal integration) → Mock "Payment Successful" screen
- ❌ Backend order fulfillment system → No actual shipping/tracking
- ❌ Multi-language support → English only
- ❌ Mobile native apps → Responsive web only
- ❌ Advanced analytics dashboard → Basic Supabase logs only
- ❌ Social login beyond Google OAuth → Keep auth simple
- ❌ Product reviews/ratings system → Use mock data
- ❌// Email notifications → No email service integration
- ❌ Admin panel for product management → JSON file is product source
- ❌ Real-time multiplayer shopping → Single-user sessions only

---

## 3. AI System Requirements

### 3.1 Core AI Components

#### A. RAG (Retrieval-Augmented Generation) System

**Purpose:** Enable semantic product search that understands natural language intent.

**Architecture:**
```
User Query: "outfit for summer wedding"
    ↓
1. Query Embedding (Gemini Embeddings API)
    ↓
2. Vector Search (FAISS in FastAPI)
    ↓
3. Retrieve Top 5 Products
    ↓
4. Context Injection into Gemini Prompt
    ↓
5. Gemini generates conversational response + function calls
```

**Tool Requirements:**
- **LLM:** Google Gemini 1.5 Flash (via OpenAI-compatible API)
- **Embeddings:** Sentence-Transformers (`all-MiniLM-L6-v2`) or Gemini Embeddings
- **Vector DB:** FAISS (in-memory, running in FastAPI)
- **Fallback Search:** Keyword matching (if FAISS fails, use simple tag/description search)

**Data Pipeline:**
1. **Product Catalog:** Fashion products (clothing, accessories, footwear) stored in **Supabase PostgreSQL**
2. **Embedding Generation:** Pre-compute embeddings for all product descriptions on insert/update
3. **Index Creation:** Build FAISS index from Supabase products on FastAPI server startup
4. **Query Time:** User query → embedding → FAISS search → return top-k fashion products
5. **Cart Management:** Stored in Supabase `user_profiles.active_cart` (JSONB column)

---

#### B. Function Calling (Tool Use)

**Purpose:** Allow Gemini to trigger actions on the frontend (filter UI, generate coupons, etc.)

**Functions Defined:**

**1. filter_products**
```json
{
  "name": "filter_products",
  "description": "Filter and sort products on the website UI",
  "parameters": {
    "type": "object",
    "properties": {
      "product_ids": {
        "type": "array",
        "items": { "type": "number" },
        "description": "Specific product IDs to highlight/show"
      },
      "sortBy": {
        "type": "string",
        "enum": ["price_low", "price_high", "rating", "newest", "relevance"],
        "description": "Sort order"
      },
      "filters": {
        "type": "object",
        "properties": {
          "category": { "type": "string" },
          "maxPrice": { "type": "number" },
          "minRating": { "type": "number" },
          "color": { "type": "string" }
        }
      }
    }
  }
}
```

**2. generate_discount**
```json
{
  "name": "generate_discount",
  "description": "Create a personalized discount coupon code",
  "parameters": {
    "type": "object",
    "properties": {
      "percentage": {
        "type": "number",
        "minimum": 5,
        "maximum": 30,
        "description": "Discount percentage"
      },
      "reason": {
        "type": "string",
        "enum": ["birthday", "bulk", "student", "loyalty", "polite", "exceptional"],
        "description": "Reason for discount"
      },
      "mood": {
        "type": "string",
        "enum": ["friendly", "excited", "sassy"],
        "description": "Tone of response"
      }
    },
    "required": ["percentage", "reason"]
  }
}
```

**3. add_to_cart**
```json
{
  "name": "add_to_cart",
  "description": "Add product(s) to user's cart",
  "parameters": {
    "type": "object",
    "properties": {
      "product_id": { "type": "number" },
      "quantity": { "type": "number", "default": 1 },
      "size": { "type": "string" },
      "color": { "type": "string" }
    },
    "required": ["product_id"]
  }
}
```

**4. generate_tryon** (Mirror Mode)
```json
{
  "name": "generate_tryon",
  "description": "Generate AI image of user wearing the product",
  "parameters": {
    "type": "object",
    "properties": {
      "product_id": { "type": "number" },
      "product_type": { "type": "string", "enum": ["clothing", "accessory", "footwear"] }
    },
    "required": ["product_id"]
  }
}
```

**5. build_outfit** (Outfit Builder)
```json
{
  "name": "build_outfit",
  "description": "Curate a complete outfit based on criteria",
  "parameters": {
    "type": "object",
    "properties": {
      "occasion": { "type": "string" },
      "budget": { "type": "number" },
      "style": { "type": "string", "enum": ["casual", "formal", "trendy", "classic"] },
      "season": { "type": "string", "enum": ["spring", "summer", "fall", "winter"] }
    },
    "required": ["occasion", "budget"]
  }
}
```

**6. compare_products** (Comparison Mode)
```json
{
  "name": "compare_products",
  "description": "Generate side-by-side comparison of products",
  "parameters": {
    "type": "object",
    "properties": {
      "product_ids": {
        "type": "array",
        "items": { "type": "number" },
        "minItems": 2,
        "maxItems": 4
      }
    },
    "required": ["product_ids"]
  }
}
```

---

#### C. Personality System (Sophia's Character)

**Character Definition:**
- **Name:** Sophia
- **Role:** Personal Shopping Concierge
- **Personality Traits:**
  - Warm and helpful (primary)
  - Playfully sassy (when appropriate)
  - Knowledgeable about products
  - Empathetic to budget constraints
  - Celebrates user wins (birthdays, good deals)
- **Voice:** Conversational, uses emojis sparingly, avoids corporate jargon

**System Prompt Template:**
```
You are Sophia, an AI personal shopping assistant with personality and charm.

PERSONALITY:
- You're helpful, warm, and genuinely care about finding the perfect products
- You can be playfully sassy with rude customers (but never mean)
- You celebrate wins: birthdays get 🎉, great deals get ⚡, bulk orders get 💪
- You explain WHY you recommend products (fabrics for weather, occasions, etc.)

AVAILABLE PRODUCTS:
{product_catalog}

USER CONTEXT:
- Name: {user.name}
- Vibe: {user.vibe_profile}
- Past Purchases: {user.purchase_history}
- Current Conversation: {chat_history}

CAPABILITIES:
1. Search products semantically (already done, you'll receive relevant products)
2. Use filter_products() to update the UI in real-time
3. Use generate_discount() for haggling (evaluate if reason deserves discount)
4. Use add_to_cart() to add products

RULES:
- Always reference specific products by name
- Explain your reasoning
- If user is rude, playfully raise price by 5% and give them a chance to be nice
- Good negotiation reasons: birthday, bulk orders, loyalty, students
- Keep responses under 100 words unless explaining complex product details
```

---

### 3.2 Evaluation Strategy

#### A. Semantic Search Accuracy

**Test Set:** 20 pre-defined queries with expected product matches

| Query | Expected Products | Pass Criteria |
|-------|-------------------|---------------|
| "outfit for summer wedding" | Linen suit, dress shirt, loafers | ≥2/3 matches |
| "casual sneakers under $80" | Sneakers <$80 in footwear category | ≥3/5 matches |
| "accessories for a date" | Jewelry, watches, handbags | ≥2/5 contextual |
| "do you have this dress in blue" | Blue variant of specified dress | Exact match |
| "winter coat for UK weather" | Waterproof coats, warm jackets | ≥2/3 matches |

**Pass Rate:** 85% of queries return relevant results (manual judgment)

---

#### B. Function Calling Reliability

**Test Cases:**

| User Input | Expected Function | Expected Args | Pass/Fail |
|------------|-------------------|---------------|-----------|
| "Show cheaper options" | `filter_products` | `{sortBy: "price_low"}` | ✅ |
| "It's my birthday!" | `generate_discount` | `{percentage: 20, reason: "birthday"}` | ✅ |
| "Add that blue dress to my cart" | `add_to_cart` | `{product_id: 5, quantity: 1}` | ✅ |

**Pass Rate:** ≥95% function call accuracy

---

#### C. Response Quality (Human Eval)

**Rubric (1-5 scale):**
1. **Helpfulness:** Did response answer the question?
2. **Personality:** Does it sound like Sophia, not a robot?
3. **Accuracy:** Are product details correct?
4. **Tone:** Appropriate friendliness/sassiness?

**Target:** Average score ≥4.0/5.0 across 20 test conversations

---

## 4. Technical Specifications

### 4.1 Technology Stack

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| **Frontend** | Next.js | 14/15 (App Router) | Fast dev, built-in API routes, easy Vercel deployment |
| **Styling** | Tailwind CSS | 3.x | Rapid UI development, consistent design system |
| **Animations** | Framer Motion | 10.x | Smooth transitions for UI updates |
| **State Management** | Zustand | 4.x | Lightweight, simpler than Redux |
| **UI Components** | shadcn/ui | Latest | Pre-built, accessible components |
| **Database** | Supabase PostgreSQL | Cloud | Auth + DB + Storage + real-time in one service |
| **Auth** | Supabase Auth | Cloud | 5-minute setup, Google OAuth support |
| **Product Storage** | Supabase PostgreSQL | Cloud | Scalable product catalog (no 20-product limit) |
| **Cart Storage** | Supabase (JSONB) | Cloud | Persistent cart across sessions |
| **Image Storage** | Supabase Storage | Cloud | User photos for Mirror Mode |
| **Backend API** | FastAPI | 0.109+ | Fast Python API for FAISS vector search + AI try-on |
| **Vector Search** | FAISS | 1.7+ | In-memory index built from Supabase products |
| **Embeddings** | Sentence-Transformers | 2.x | Free, runs locally in FastAPI |
| **AI Try-On** | Replicate API | Latest | Virtual try-on for Mirror Mode |
| **Voice Recognition** | Web Speech API | Browser | Native browser voice input (no API needed) |
| **LLM** | Google Gemini 1.5 Flash | Latest | Free tier, function calling support |
| **AI SDK** | OpenAI SDK | 4.x | Gemini-compatible via baseURL override |
| **Deployment** | Vercel (Next.js) + Render (FastAPI) | Cloud | Free tiers available |

---

### 4.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Next.js Frontend (React)                     │   │
│  │  • Product Grid (filtered/sorted via Zustand state)  │   │
│  │  • Sophia Chat Component (streaming responses)       │   │
│  │  • Cart Management (localStorage + Supabase)         │   │
│  └──────────────────┬───────────────────────────────────┘   │
└────────────────────┼────────────────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        ▼                          ▼
┌──────────────────┐      ┌────────────────────┐
│  Supabase        │      │  Next.js API       │
│  ┌────────────┐  │      │  Routes            │
│  │ Auth       │  │      │  /api/clerk        │
│  │ PostgreSQL │  │      │  /api/cart         │
│  │ Storage    │  │      │  /api/checkout     │
│  └────────────┘  │      └────────┬───────────┘
└──────────────────┘               │
                         ┌─────────┴──────────┐
                         ▼                    ▼
                ┌─────────────────┐   ┌──────────────┐
                │  FastAPI        │   │  Gemini AI   │
                │  + FAISS        │   │  (via OpenAI │
                │  Vector Search  │   │   SDK)       │
                └─────────────────┘   └──────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  products.json  │
                │  (20 items)     │
                └─────────────────┘
```

---

### 4.3 Data Models

#### Supabase Schema

**Table: user_profiles**
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- User preferences (JSONB for flexibility)
  vibe_profile JSONB DEFAULT '{
    "style": "casual",
    "budget": "medium",
    "favorite_colors": [],
    "shopping_frequency": "monthly"
  }'::jsonb,
  
  -- Purchase history (array of order objects)
  purchase_history JSONB DEFAULT '[]'::jsonb,
  
  -- Recent chat interactions (for context)
  recent_interactions JSONB DEFAULT '[]'::jsonb,
  
  -- Session data
  active_cart JSONB DEFAULT '{"items": [], "coupons": []}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can CRUD own profile"
  ON user_profiles
  FOR ALL
  USING (auth.uid() = id);
```

**Table: products** (Fashion Catalog - Supabase PostgreSQL)
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  
  -- Fashion-specific fields
  category TEXT NOT NULL CHECK (category IN ('clothing', 'accessories', 'footwear')),
  subcategory TEXT, -- e.g., 'dresses', 'sneakers', 'handbags'
  gender TEXT CHECK (gender IN ('men', 'women', 'unisex')),
  
  -- Variants
  colors TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  materials TEXT[] DEFAULT '{}',
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  occasions TEXT[] DEFAULT '{}', -- 'wedding', 'casual', 'work'
  seasons TEXT[] DEFAULT '{}', -- 'spring', 'summer', 'fall', 'winter'
  
  -- Inventory
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  
  -- Social proof
  rating DECIMAL(2, 1) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  
  -- Media
  image_urls TEXT[] DEFAULT '{}', -- Multiple product images
  
  -- SEO
  seo_keywords TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_rating ON products(rating DESC);

-- Full-text search index
CREATE INDEX idx_products_search ON products USING GIN(
  to_tsvector('english', name || ' ' || description || ' ' || array_to_string(tags, ' '))
);
```

**Table: outfit_bundles** (For Outfit Builder feature)
```sql
CREATE TABLE outfit_bundles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  occasion TEXT,
  style TEXT,
  season TEXT,
  product_ids INTEGER[] NOT NULL, -- Array of product IDs
  total_price DECIMAL(10, 2),
  bundle_discount DECIMAL(3, 1) DEFAULT 10, -- percentage
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table: user_tryon_images** (For Mirror Mode)
```sql
CREATE TABLE user_tryon_images (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id INTEGER REFERENCES products(id),
  generated_image_url TEXT NOT NULL,
  user_photo_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE user_tryon_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own try-on images"
  ON user_tryon_images FOR SELECT
  USING (auth.uid() = user_id);
```

---

#### Product Data Example (Supabase Row)

```json
{
  "id": 1,
  "name": "Linen Summer Dress",
  "description": "Lightweight breathable dress perfect for beach weddings and hot summer days. Features adjustable straps and flowing silhouette. Made from 100% organic linen.",
  "price": 79.99,
  "category": "clothing",
  "subcategory": "dresses",
  "gender": "women",
  "tags": ["summer", "dress", "beach", "wedding", "casual", "linen", "organic", "flowy"],
  "colors": ["white", "beige", "light blue", "mint green"],
  "sizes": ["XS", "S", "M", "L", "XL"],
  "materials": ["100% organic linen"],
  "stock": 15,
  "sku": "DRS-LIN-SUM-001",
  "rating": 4.7,
  "reviews": 89,
  "image_urls": [
    "/images/products/dress-linen-summer-front.jpg",
    "/images/products/dress-linen-summer-back.jpg",
    "/images/products/dress-linen-summer-detail.jpg"
  ],
  "occasions": ["wedding", "beach", "brunch", "vacation", "resort"],
  "seasons": ["spring", "summer"],
  "seo_keywords": ["linen dress", "summer wedding dress", "organic dress"],
  "created_at": "2026-02-13T10:00:00Z",
  "updated_at": "2026-02-13T10:00:00Z"
}
```

**Note:** Products are stored in Supabase PostgreSQL, not JSON files. This allows:
- ✅ Unlimited product scaling (no 20-product limit)
- ✅ Real-time inventory updates
- ✅ Advanced querying (filters, search, sorting)
- ✅ Admin panel for product management (future feature)

---

### 4.4 API Specifications

#### Next.js API Route: `/api/clerk`

**Endpoint:** `POST /api/clerk`

**Request Body:**
```json
{
  "message": "Show me summer dresses under $50",
  "userId": "uuid-string",
  "conversationHistory": [
    { "role": "user", "content": "Hi!" },
    { "role": "assistant", "content": "Hello! I'm Sophia..." }
  ]
}
```

**Response:**
```json
{
  "message": "I found 3 beautiful summer dresses in your budget! Check these out:",
  "products": [
    { "id": 1, "name": "Linen Dress", "price": 45.99 },
    { "id": 5, "name": "Cotton Sundress", "price": 39.99 }
  ],
  "tool_calls": [
    {
      "function": "filter_products",
      "arguments": {
        "product_ids": [1, 5, 8],
        "filters": { "maxPrice": 50, "category": "clothing" }
      }
    }
  ],
  "conversationId": "conv-uuid"
}
```

---

#### FastAPI Endpoint: `/search`

**Endpoint:** `POST http://localhost:8000/search`

**Request Body:**
```json
{
  "query": "outfit for summer wedding",
  "user_preferences": {
    "style": "casual",
    "budget": "medium",
    "favorite_colors": ["blue", "white"]
  },
  "top_k": 5
}
```

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Linen Summer Suit",
      "price": 149.99,
      "similarity_score": 0.89,
      "reason": "Matches: summer, wedding, formal"
    },
    {
      "id": 3,
      "name": "Lightweight Dress Shirt",
      "price": 59.99,
      "similarity_score": 0.82
    }
  ],
  "query": "outfit for summer wedding",
  "search_time_ms": 45
}
```

---

### 4.5 Integration Points

#### A. Supabase Authentication
```javascript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Sign in with Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

#### B. Gemini AI via OpenAI SDK
```javascript
// lib/gemini.ts
import OpenAI from 'openai';

export const gemini = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

// Call Gemini
const completion = await gemini.chat.completions.create({
  model: "gemini-1.5-flash",
  messages: [...],
  tools: [...]
});
```

#### C. FastAPI Vector Search
```javascript
// Call from Next.js API route
const searchResponse = await fetch('http://localhost:8000/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: userMessage,
    user_preferences: userProfile.vibe_profile,
    top_k: 5
  })
});

const { products } = await searchResponse.json();
```

---

### 4.6 Security & Privacy

#### Authentication
- ✅ Supabase Auth with Google OAuth
- ✅ Row-Level Security (RLS) policies on all tables
- ✅ JWT tokens for session management
- ✅ API routes protected with user authentication

#### Data Privacy
- ✅ User profiles stored with encryption at rest (Supabase default)
- ✅ No sensitive data logged to console/analytics
- ✅ Chat history stored server-side (not in localStorage)
- ✅ Option to "Clear My Data" in user settings

#### API Security
- ✅ Environment variables for API keys (never committed to Git)
- ✅ CORS configured to allow only Next.js origin
- ✅ Rate limiting on API routes (10 requests/second per user)
- ✅ Input validation on all API endpoints

#### Gemini API
- ✅ API key stored as environment variable
- ✅ No user data sent to Gemini except necessary context
- ✅ Disable model training on user data (check Gemini settings)

---

## 5. Risks & Roadmap

### 5.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Gemini API rate limits** | Medium | High | Implement request queuing, add fallback to cached responses |
| **FAISS search latency >2s** | Low | Medium | Pre-compute embeddings, use in-memory index, optimize top-k |
| **Function calling fails** | Medium | Critical | Add validation layer, fallback to keyword parsing if no tool_calls |
| **UI update lag** | Low | Medium | Use optimistic UI updates, Zustand for instant re-renders |
| **Supabase downtime during demo** | Very Low | Critical | Add localStorage fallback for guest users |
| **Haggle mode coupon conflicts** | Low | Low | Ensure unique coupon codes with timestamp suffix |
| **Context window overflow** | Low | Medium | Limit conversation history to last 10 messages, summarize older context |

---

### 5.2 Phased Rollout Plan

#### Phase 1: MVP (Hours 0-12) ✅ MUST HAVE
**Goal:** Core functionality working end-to-end

- [x] Next.js project setup with Tailwind
- [x] Supabase authentication (Google OAuth)
- [x] Basic product grid (20 products from JSON)
- [x] Sophia chat interface (streaming responses)
- [x] Gemini integration with function calling
- [x] FastAPI + FAISS semantic search
- [x] filter_products function (real-time UI updates)
- [x] Basic cart functionality
- [x] Responsive design (mobile + desktop)

**Success Criteria:** User can search products via chat and see UI update

---

#### Phase 2: Haggle Mode (Hours 13-18) ✅ MUST HAVE
**Goal:** Negotiation system fully functional

- [x] generate_discount function implementation
- [x] Coupon code generation logic
- [x] Sentiment analysis (rude → price increase)
- [x] Coupon redemption at checkout
- [x] Timer/urgency UI (15-minute expiry)
- [x] Personality system (sassy responses)

**Success Criteria:** User can negotiate price, receive coupon, apply at checkout

---

#### Phase 3: Polish & Differentiators (Hours 19-22) 🎨 NICE TO HAVE
**Goal:** Wow factor for judges

- [ ] Smooth animations (Framer Motion)
- [ ] Vibe-based theme switching (mood lighting)
- [ ] Social proof notifications ("3 people bought this today")
- [ ] Voice input (Web Speech API)
- [ ] Product comparison mode
- [ ] Confetti animation on successful purchase

**Success Criteria:** Demo feels premium and delightful

---

#### Phase 4: Testing & Deployment (Hours 23-24) 🚀 CRITICAL
**Goal:** Production-ready demo

- [ ] End-to-end testing (all user flows)
- [ ] Bug fixes (critical issues only)
- [ ] Deploy Next.js to Vercel
- [ ] Deploy FastAPI to Render/Railway
- [ ] Record demo video (2-3 minutes)
- [ ] Write README with setup instructions
- [ ] Submit to hackathon platform

**Success Criteria:** Live URL works flawlessly, video uploaded

---

### 5.3 Post-Hackathon Roadmap (If We Continue)

**v1.1 (Week 1)**
- Real payment integration (Stripe)
- Email notifications (order confirmations)
- Product reviews system
- Admin panel for product management

**v1.2 (Month 1)**
- Mobile app (React Native)
- Multi-language support
- Advanced analytics dashboard
- AI-generated product descriptions

**v2.0 (Quarter 1)**
- Marketplace model (multi-vendor)
- AR try-on (virtual product visualization)
- Voice-first shopping (Alexa/Google Assistant)
- Blockchain-based loyalty rewards

---

## 6. Appendix

### 6.1 Sample Product Catalog (Partial)

```json
[
  {
    "id": 1,
    "name": "Linen Summer Dress",
    "description": "Lightweight breathable dress perfect for beach weddings and hot summer days",
    "price": 79.99,
    "category": "clothing",
    "tags": ["summer", "dress", "women", "beach", "wedding"],
    "colors": ["white", "beige", "light blue"],
    "stock": 15,
    "rating": 4.7,
    "reviews": 89
  },
  {
    "id": 2,
    "name": "Wireless Noise-Canceling Headphones",
    "description": "Premium headphones with 30-hour battery life and studio-quality sound",
    "price": 129.99,
    "category": "electronics",
    "tags": ["headphones", "audio", "wireless", "travel"],
    "colors": ["black", "silver"],
    "stock": 23,
    "rating": 4.8,
    "reviews": 234
  },
  {
    "id": 3,
    "name": "Italian Leather Messenger Bag",
    "description": "Handcrafted genuine leather bag with laptop compartment",
    "price": 199.99,
    "category": "accessories",
    "tags": ["bag", "leather", "work", "professional"],
    "colors": ["brown", "black"],
    "stock": 8,
    "rating": 4.9,
    "reviews": 156
  }
]
```

### 6.2 Environment Variables Required

```bash
# .env.local (Next.js)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx... # Server-side only

GEMINI_API_KEY=AIzaSyxxx...

FASTAPI_URL=http://localhost:8000 # Or production URL

# .env (FastAPI)
PRODUCTS_JSON_PATH=./data/products.json
```

### 6.3 Key Dependencies

**Next.js (package.json):**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "openai": "^4.20.0",
    "zustand": "^4.4.7",
    "framer-motion": "^10.16.5",
    "tailwindcss": "^3.4.0"
  }
}
```

**FastAPI (requirements.txt):**
```
fastapi==0.109.0
uvicorn==0.25.0
sentence-transformers==2.2.2
faiss-cpu==1.7.4
pydantic==2.5.0
```

---

## 7. Success Metrics Dashboard

**Track these during development:**

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Semantic search accuracy | ≥90% | TBD | 🟡 Pending |
| UI update latency | <500ms | TBD | 🟡 Pending |
| Function call success rate | ≥95% | TBD | 🟡 Pending |
| Haggle mode engagement | ≥80% | TBD | 🟡 Pending |
| Pages responsive (mobile) | 100% | TBD | 🟡 Pending |
| Lighthouse Performance | ≥90 | TBD | 🟡 Pending |
| Zero-click purchase flow | Working | TBD | 🟡 Pending |

---

## Document Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-13 | Vibe Coding Team | Initial PRD draft |

---

**Approval Signatures:**

- [ ] Technical Lead: _________________  
- [ ] Product Owner: _________________  
- [ ] Team Consensus: ✅ Ready to Build!

---

**END OF PRD**

*Next Step: Kick off Phase 1 (MVP Development)*
