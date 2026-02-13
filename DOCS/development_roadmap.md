# Development Roadmap — The Shopkeeper (AI Shopping Platform)

**Team:** AgentX | **Hackathon:** Softronix 4.0 | **Timeline:** 24 Hours  
**Stack:** Next.js 14 + Tailwind + Zustand | Supabase (Auth + DB + Storage) | FastAPI + FAISS | Gemini 1.5 Flash

---

## How to Use This Roadmap

- **Frontend Team** and **Backend Team** work on the **same feature simultaneously**
- After each feature block, there is an **Integration Checkpoint** → both teams merge & test together
- **Do NOT move to the next feature until the checkpoint passes**
- Status legend: `⬜ Not Started` | `🔵 In Progress` | `✅ Done` | `🔴 Blocked`

---

## PHASE 1: Project Setup & Auth (Hours 0–3)

| # | Feature Name | Page / Module | Frontend Tasks | Backend Tasks (Supabase) | Database Tables Involved | Auth Required | API / Supabase Function | Integration Checkpoint | Status |
|---|---|---|---|---|---|---|---|---|---|
| 1.1 | Project Init | Repo / Config | Init Next.js 14 (App Router), install Tailwind, Zustand, Framer Motion, shadcn/ui, `@supabase/supabase-js`, `openai` SDK | Create Supabase project, enable Google OAuth provider, set redirect URIs, configure RLS | — | No | — | Both teams confirm `.env.local` loads Supabase URL + anon key; `supabase.auth.getSession()` returns null (no crash) | ⬜ |
| 1.2 | Supabase Client | `lib/supabase.ts` | Create `createClient()` helper with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Verify anon key permissions, ensure project is active | — | No | `createClient()` | Import helper in a test page, log session — no errors | ⬜ |
| 1.3 | Login Page UI | `/login` | Build Login page: Google OAuth button, brand logo, "Sign in with Google" CTA, loading state | Configure Google OAuth in Supabase dashboard (client ID, secret, redirect URL) | `auth.users` | No | `supabase.auth.signInWithOAuth({ provider: 'google' })` | Click "Sign in" → redirected to Google → back to `/auth/callback` → session exists | ⬜ |
| 1.4 | Auth Callback | `/auth/callback` | Build callback route: exchange code for session, redirect to `/` on success | Supabase handles token exchange automatically | `auth.users` | No | `supabase.auth.exchangeCodeForSession()` | Full round-trip: Login → Google → Callback → Homepage (logged in) | ⬜ |
| 1.5 | Auth Context | `components/AuthProvider` | Create auth context/provider: track `user`, `session`, `loading` state; wrap app layout | — | `auth.users` | Yes | `supabase.auth.onAuthStateChange()` | Refresh page → still logged in; log out → session cleared | ⬜ |
| 1.6 | Signup (Auto) | `/login` | Same as Login (Google OAuth auto-creates account) | Supabase auto-creates `auth.users` row on first OAuth login | `auth.users` | No | `signInWithOAuth()` | New Google account → first login → user created in `auth.users` | ⬜ |
| 1.7 | Logout | Header / Nav | Add logout button in header; call `signOut()`, redirect to `/login` | — | `auth.users` | Yes | `supabase.auth.signOut()` | Click logout → session cleared → redirect to login | ⬜ |

**🔗 INTEGRATION CHECKPOINT 1:** Full auth flow works end-to-end. Login → Google OAuth → Callback → Authenticated Home → Logout. Both teams verify together.

---

## PHASE 2: User Profile & Vibe Setup (Hours 3–5)

| # | Feature Name | Page / Module | Frontend Tasks | Backend Tasks (Supabase) | Database Tables Involved | Auth Required | API / Supabase Function | Integration Checkpoint | Status |
|---|---|---|---|---|---|---|---|---|---|
| 2.1 | User Profiles Table | DB Schema | — | Create `user_profiles` table: `id (UUID FK → auth.users)`, `email`, `name`, `vibe_profile (JSONB)`, `purchase_history (JSONB)`, `recent_interactions (JSONB)`, `active_cart (JSONB)`, `created_at`, `updated_at` | `user_profiles` | — | SQL migration | Table exists, RLS enabled, test insert works | ⬜ |
| 2.2 | RLS Policies | DB Security | — | Enable RLS on `user_profiles`; create SELECT/UPDATE policies: `auth.uid() = id` | `user_profiles` | — | RLS policies | Anon user cannot read; logged-in user reads only own row | ⬜ |
| 2.3 | Auto Profile Creation | `/api/user/profile` | After login callback, call `POST /api/user/profile` to upsert profile | Create API route: check if profile exists → INSERT if new, SELECT if returning | `user_profiles`, `auth.users` | Yes | `POST /api/user/profile` | New user logs in → profile row auto-created with defaults | ⬜ |
| 2.4 | Profile Page UI | `/profile` | Build profile page: display name, email, avatar (from Google), vibe preferences, edit button | — | `user_profiles` | Yes | `supabase.from('user_profiles').select()` | Profile page loads user data correctly | ⬜ |
| 2.5 | Vibe Quiz | `/profile` or Modal | Build 5-question style quiz UI (style, budget, colors, occasion, frequency); save to `vibe_profile` JSONB | — | `user_profiles` | Yes | `supabase.from('user_profiles').update({ vibe_profile })` | Complete quiz → JSONB updated → data persists on refresh | ⬜ |
| 2.6 | Edit Profile | `/profile` | Add edit form: update name, vibe preferences; submit updates to Supabase | — | `user_profiles` | Yes | `.update()` on `user_profiles` | Edit name/vibe → saved → page reflects changes | ⬜ |

**🔗 INTEGRATION CHECKPOINT 2:** Login creates profile automatically. Profile page loads real data. Vibe quiz saves and persists. Both teams verify.

---

## PHASE 3: Product Catalog & Display (Hours 5–8)

| # | Feature Name | Page / Module | Frontend Tasks | Backend Tasks (Supabase) | Database Tables Involved | Auth Required | API / Supabase Function | Integration Checkpoint | Status |
|---|---|---|---|---|---|---|---|---|---|
| 3.1 | Products Table | DB Schema | — | Create `products` table: `id (SERIAL)`, `name`, `description`, `price`, `category` (clothing/accessories/footwear), `subcategory`, `gender`, `colors[]`, `sizes[]`, `materials[]`, `tags[]`, `occasions[]`, `seasons[]`, `stock`, `sku`, `rating`, `reviews`, `image_urls[]`, `created_at` | `products` | — | SQL migration | Table created with indexes on `category`, `price`, `tags (GIN)`, `rating` | ⬜ |
| 3.2 | Seed Products | DB Data | — | Insert 20 fashion products (clothing, accessories, footwear) with complete metadata: tags, colors, sizes, occasions, seasons | `products` | — | SQL INSERT / seed script | 20 products queryable; `SELECT * FROM products` returns all | ⬜ |
| 3.3 | Product Grid UI | `/` (Homepage) | Build responsive product grid: ProductCard component (image, name, price, rating, quick-add button, category badge) | — | `products` | No | `supabase.from('products').select()` | Homepage shows all 20 products in a responsive grid | ⬜ |
| 3.4 | Product Detail Page | `/product/[id]` | Build PDP: large image, name, price, description, color/size selectors, stock status, "Add to Cart" button, "Try On" button | — | `products` | No | `supabase.from('products').select().eq('id', id)` | Click product card → PDP loads with all product data | ⬜ |
| 3.5 | Client-Side Filters | Homepage | Build filter sidebar/bar: category, price range, color, rating, sort dropdown. Use Zustand store for filter state | — | `products` | No | Zustand `useStore()` for filter state | Select "clothing" + "under $100" → grid updates instantly (client-side) | ⬜ |
| 3.6 | Zustand Store | `store/useStore.ts` | Create Zustand store: `products[]`, `filters`, `sortBy`, `highlightedProducts[]`, `cart`, computed `sortedProducts` | — | — | No | Zustand store | Filters, sort, highlight all work via Zustand state | ⬜ |

**🔗 INTEGRATION CHECKPOINT 3:** Products load from Supabase. Grid renders correctly. Filters/sort work client-side. PDP shows full product details. Both teams verify.

---

## PHASE 4: AI Chat — Sophia + Semantic Search (Hours 8–13)

| # | Feature Name | Page / Module | Frontend Tasks | Backend Tasks (Supabase / FastAPI) | Database Tables Involved | Auth Required | API / Supabase Function | Integration Checkpoint | Status |
|---|---|---|---|---|---|---|---|---|---|
| 4.1 | FastAPI Server | `fastapi/` (separate repo/dir) | — | Set up FastAPI project: install `sentence-transformers`, `faiss-cpu`, `uvicorn`. Create `/health` endpoint | — | No | `GET /health` | `curl /health` returns `{ status: "healthy" }` | ⬜ |
| 4.2 | Product Embeddings | FastAPI startup | — | On server startup: load products from Supabase (or JSON), generate embeddings with `all-MiniLM-L6-v2`, build FAISS index | `products` | No | FAISS index built in memory | Server starts, logs "✅ Indexed 20 products" | ⬜ |
| 4.3 | Semantic Search API | FastAPI `/search` | — | Build `POST /search`: accept `query` + `user_preferences` + `top_k`, return ranked products with similarity scores | `products` | No | `POST /search` | `curl -X POST /search -d '{"query":"summer wedding"}'` returns relevant products | ⬜ |
| 4.4 | Chat UI Component | `components/SophiaChat` | Build floating chat bubble (bottom-right), expandable chat window, message list, input field, typing indicator, streaming text display | — | — | No | — | Chat UI opens/closes; can type messages; shows placeholder responses | ⬜ |
| 4.5 | Gemini Integration | `lib/gemini.ts` | — | Create Gemini client using OpenAI SDK with `baseURL: generativelanguage.googleapis.com/v1beta/openai/`; define Sophia's system prompt | — | No | `gemini.chat.completions.create()` | Send test message → Gemini responds with Sophia's personality | ⬜ |
| 4.6 | Clerk API Route | `/api/clerk` | Wire chat UI to send messages to `/api/clerk`, display streamed responses | Build `POST /api/clerk`: (1) get user profile, (2) call FastAPI `/search`, (3) inject products into Gemini context, (4) return AI response + tool_calls | `user_profiles`, `products` | Yes | `POST /api/clerk` | Type "summer dresses" in chat → AI responds with product suggestions | ⬜ |
| 4.7 | Function Calling: filter_products | Chat + Product Grid | Parse `tool_calls` from API response; execute `filter_products` → update Zustand store → grid re-renders with highlighted products | Define `filter_products` tool schema in Gemini call; pass `product_ids`, `sortBy`, `filters` | `products` | Yes | `filter_products()` via Gemini tool_calls | Say "show cheaper options" → grid sorts by price (↑) with animation | ⬜ |
| 4.8 | Conversation History | Chat component | Maintain conversation history array in state; send last 10 messages with each API call | Accept `conversationHistory` in `/api/clerk`, pass to Gemini | — | Yes | Conversation context in API call | Multi-turn works: "show dresses" → "cheaper ones" → AI remembers context | ⬜ |

**🔗 INTEGRATION CHECKPOINT 4:** Full AI pipeline: User types → `/api/clerk` → FastAPI semantic search → Gemini responds → UI updates (filters, highlights). Both teams verify end-to-end.

---

## PHASE 5: Cart & Checkout (Hours 13–15)

| # | Feature Name | Page / Module | Frontend Tasks | Backend Tasks (Supabase) | Database Tables Involved | Auth Required | API / Supabase Function | Integration Checkpoint | Status |
|---|---|---|---|---|---|---|---|---|---|
| 5.1 | Cart State | Zustand + localStorage | Add cart slice to Zustand: `items[]`, `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`. Persist to localStorage for guests | — | — | No | Zustand + localStorage | Add/remove items → cart state updates; refresh → cart persists | ⬜ |
| 5.2 | Cart Sync (Logged In) | `/api/cart` | On login, merge localStorage cart with Supabase `active_cart`; sync on every cart change | Build `POST /api/cart/add` and `GET /api/cart`: read/write `user_profiles.active_cart` JSONB | `user_profiles` | Yes | `POST /api/cart/add`, `GET /api/cart` | Login → localStorage cart merges with Supabase cart | ⬜ |
| 5.3 | Cart Page UI | `/cart` | Build cart page: item list (image, name, price, qty selector, remove), subtotal, coupon input field, "Proceed to Checkout" button | — | `user_profiles` | No | Read from Zustand/localStorage | Cart page shows all items with correct totals | ⬜ |
| 5.4 | Add to Cart (AI) | Chat + Cart | Parse `add_to_cart` tool_call from Gemini; execute: add product to Zustand cart + show confirmation in chat | Define `add_to_cart` tool schema in Gemini function definitions | `products`, `user_profiles` | Yes | `add_to_cart()` via Gemini tool_calls | Say "add that blue dress to cart" → cart updates, Sophia confirms | ⬜ |
| 5.5 | Checkout Page | `/checkout` | Build checkout page: order summary, coupon applied, mock payment form (no real payment), "Place Order" button, confetti animation on success | Build `POST /api/checkout`: validate items, apply coupon, save order to `purchase_history` JSONB, clear cart | `user_profiles` | Yes | `POST /api/checkout` | Complete checkout → order saved to `purchase_history` → cart cleared → confetti | ⬜ |
| 5.6 | Order Confirmation | `/checkout` (success state) | Show order ID, items purchased, total, savings from coupon, "Continue Shopping" button | Generate unique order ID (`ORD-YYYYMMDD-XXXX`), return in checkout response | `user_profiles` | Yes | Checkout response | After purchase, order confirmation displays correct info | ⬜ |

**🔗 INTEGRATION CHECKPOINT 5:** Full shopping flow: Browse → Add to Cart (via UI or AI) → Cart Page → Checkout → Order Confirmation. Both teams verify.

---

## PHASE 6: Haggle Mode — Discounts & Coupons (Hours 15–18)

| # | Feature Name | Page / Module | Frontend Tasks | Backend Tasks (Supabase) | Database Tables Involved | Auth Required | API / Supabase Function | Integration Checkpoint | Status |
|---|---|---|---|---|---|---|---|---|---|
| 6.1 | Discount Logic | `/api/clerk` | — | Implement discount tiers in `/api/clerk`: polite (10%), birthday (20%), student (15%), bulk 3+ (25%), exceptional (30%), rude (−5% price increase) | — | Yes | Discount tier logic in API | Different reasons → different discount percentages | ⬜ |
| 6.2 | Coupon Generation | `/api/clerk` | — | Build `generateCouponCode()`: format `REASON-XX-SUFFIX`, 15-min expiry, session-locked, single-use. Store in session/memory | — | Yes | `generate_discount()` via Gemini tool_calls | Ask for discount → unique coupon code generated with timer | ⬜ |
| 6.3 | Coupon UI in Chat | `SophiaChat` | Display coupon code in chat with copy-to-clipboard, countdown timer (15 min), visual badge styling | — | — | Yes | — | Coupon appears in chat → copy button works → timer counts down | ⬜ |
| 6.4 | Coupon Redemption | `/cart` or `/checkout` | Add coupon input field in cart; validate code, show savings, update total instantly (no reload) | Coupon validation logic: check code, expiry, user match, single-use | `user_profiles` | Yes | Coupon validation in `/api/checkout` | Enter coupon → total updates → "You saved $X!" displays | ⬜ |
| 6.5 | Sassy Price Increase | Chat + Product Grid | Show strike-through old price + new higher price when user is rude; revert after 2 nice messages | Sentiment detection: keywords "ripoff", "scam", "stupid" → trigger −5% (price increase) | — | Yes | Sentiment logic in `/api/clerk` | Rude message → Sophia sasses back, price +5%; say please → reverts | ⬜ |
| 6.6 | Auto-Apply Coupon | Cart / Checkout | If coupon generated in session, auto-apply to cart (no manual entry needed) | Store active coupon in session state | `user_profiles` | Yes | Session-based coupon storage | Generate coupon → go to cart → coupon already applied | ⬜ |

**🔗 INTEGRATION CHECKPOINT 6:** Full haggle flow: Ask for discount → Sophia evaluates → Coupon generated → Applied at checkout → Savings shown. Rude path also works. Both teams verify.

---

## PHASE 7: Voice Shopping & Mirror Mode (Hours 18–20)

| # | Feature Name | Page / Module | Frontend Tasks | Backend Tasks (Supabase / FastAPI) | Database Tables Involved | Auth Required | API / Supabase Function | Integration Checkpoint | Status |
|---|---|---|---|---|---|---|---|---|---|
| 7.1 | Voice Input | Header + Chat | Add mic toggle button; implement Web Speech API (`webkitSpeechRecognition`): continuous listening, real-time transcription, send to chat | — | — | No | Web Speech API (browser-native) | Click mic → speak → text appears in chat → AI responds | ⬜ |
| 7.2 | Voice Output (TTS) | Chat | Sophia responds with `SpeechSynthesisUtterance` (TTS); select female voice, rate 1.1x | — | — | No | Web Speech Synthesis API | Sophia's response is read aloud automatically | ⬜ |
| 7.3 | Mirror Mode Table | DB Schema | — | Create `user_tryon_images` table: `id`, `user_id (FK)`, `product_id (FK)`, `generated_image_url`, `user_photo_url`, `created_at`. RLS: users see own images only | `user_tryon_images` | — | SQL migration + RLS | Table exists with correct RLS policies | ⬜ |
| 7.4 | Photo Upload | `/profile` or Modal | Add "Upload Your Photo" for Mirror Mode; upload to Supabase Storage (encrypted bucket) | Create Supabase Storage bucket `user-photos` with RLS | `user_tryon_images`, Supabase Storage | Yes | `supabase.storage.from('user-photos').upload()` | Upload photo → stored in Supabase Storage → URL saved | ⬜ |
| 7.5 | Try-On Generation | PDP / Chat | Add "Try On" button on PDP; show loading state (10-15s); display generated image; save to "My Looks" gallery | Build `POST /api/tryon`: call Replicate API (or Stable Diffusion) with user photo + product image; save result to `user_tryon_images` | `user_tryon_images`, `products` | Yes | `generate_tryon()` via Gemini tool_calls + `POST /api/tryon` | Click "Try On" → AI generates image → displayed in modal → saved to gallery | ⬜ |
| 7.6 | My Looks Gallery | `/profile` or `/looks` | Build gallery page: grid of saved try-on images with product links | — | `user_tryon_images` | Yes | `supabase.from('user_tryon_images').select()` | Gallery shows all saved try-on images for logged-in user | ⬜ |

**🔗 INTEGRATION CHECKPOINT 7:** Voice shopping works end-to-end (speak → AI responds with voice + UI). Mirror Mode: upload photo → try on product → saved to gallery. Both teams verify.

---

## PHASE 8: Outfit Builder & Comparison Mode (Hours 20–22)

| # | Feature Name | Page / Module | Frontend Tasks | Backend Tasks (Supabase) | Database Tables Involved | Auth Required | API / Supabase Function | Integration Checkpoint | Status |
|---|---|---|---|---|---|---|---|---|---|
| 8.1 | Outfit Bundles Table | DB Schema | — | Create `outfit_bundles` table: `id`, `name`, `occasion`, `style`, `season`, `product_ids[]`, `total_price`, `bundle_discount`, `created_by (FK)`, `is_public`, `created_at` | `outfit_bundles` | — | SQL migration | Table created and queryable | ⬜ |
| 8.2 | Outfit Builder (AI) | Chat + Outfit Card | Build outfit card component: shows all items in bundle layout, total price, bundle discount, "Add Complete Outfit to Cart" button | Define `build_outfit` tool schema: `occasion`, `budget`, `style`, `season`. Logic: allocate budget (40% main, 30% shoes, 30% accessories), match by color harmony | `products`, `outfit_bundles` | Yes | `build_outfit()` via Gemini tool_calls | Say "build me a $300 outfit for a wedding" → outfit card displays with bundle discount | ⬜ |
| 8.3 | Outfit Swap Items | Chat + Outfit Card | Allow swapping individual items: "Change the shoes" → AI suggests alternative, re-renders outfit card | Re-query products matching criteria, update outfit bundle | `products`, `outfit_bundles` | Yes | Updated `build_outfit()` call | Swap item → outfit card updates with new item and recalculated total | ⬜ |
| 8.4 | Comparison Mode | Chat + Comparison Table | Build comparison modal/section: 2-4 products side-by-side (image, price, rating, material, sizes, stock, winner column) | Define `compare_products` tool schema: `product_ids[]` (2-4 items). Gemini analyzes & picks winners per criteria | `products` | No | `compare_products()` via Gemini tool_calls | Say "compare the blue and red dress" → comparison table renders with AI analysis | ⬜ |
| 8.5 | AI Comparison Analysis | Chat | Sophia provides text analysis: price winner, quality winner, stock urgency, personalized recommendation | Gemini generates comparison narrative using product data + user profile | `products`, `user_profiles` | Yes | Analysis in Gemini response | AI explains: "Blue wins on price, Red has more sizes" + recommendation | ⬜ |

**🔗 INTEGRATION CHECKPOINT 8:** Outfit builder creates curated bundles with discounts. Comparison mode shows side-by-side analysis. Both teams verify.

---

## PHASE 9: Personalization & Dashboard (Hours 22–23)

| # | Feature Name | Page / Module | Frontend Tasks | Backend Tasks (Supabase) | Database Tables Involved | Auth Required | API / Supabase Function | Integration Checkpoint | Status |
|---|---|---|---|---|---|---|---|---|---|
| 9.1 | Personalized Homepage | `/` | On load: fetch user's `vibe_profile`, bias product grid toward user preferences (style, colors, budget) | — | `user_profiles`, `products` | Yes | `supabase.from('user_profiles').select('vibe_profile')` | Logged-in user with "casual" vibe sees casual items first | ⬜ |
| 9.2 | Sophia Greets by Name | Chat | On chat open (logged in): Sophia greets with user's name + references past purchases | Pass user's name + `purchase_history` to Gemini system prompt | `user_profiles` | Yes | Included in `/api/clerk` context | Open chat → "Welcome back, Sarah! Loved that blue dress you got?" | ⬜ |
| 9.3 | Purchase History | `/profile` | Display past orders: order ID, items, total, date, coupon used | — | `user_profiles` | Yes | Read `purchase_history` from `user_profiles` JSONB | Profile page shows list of past orders | ⬜ |
| 9.4 | User Dashboard | `/dashboard` (or `/profile` tab) | Build simple dashboard: total orders, total spent, favorite categories, active coupons, saved outfits count | Aggregate data from `purchase_history`, `active_cart`, `user_tryon_images` count | `user_profiles`, `user_tryon_images`, `outfit_bundles` | Yes | Multiple Supabase queries | Dashboard shows stats: "3 orders, $250 spent, Favorite: Dresses" | ⬜ |

**🔗 INTEGRATION CHECKPOINT 9:** Personalized experience works. Dashboard shows real user data. Sophia references past purchases. Both teams verify.

---

## PHASE 10: Polish, Testing & Deployment (Hours 23–24)

| # | Feature Name | Page / Module | Frontend Tasks | Backend Tasks (Supabase / FastAPI) | Database Tables Involved | Auth Required | API / Supabase Function | Integration Checkpoint | Status |
|---|---|---|---|---|---|---|---|---|---|
| 10.1 | Animations | Global | Add Framer Motion: product grid layout animations, chat message fade-in, page transitions, confetti on checkout | — | — | No | — | All transitions are smooth, no jank | ⬜ |
| 10.2 | Responsive Design | Global | Test & fix all pages on mobile (375px), tablet (768px), desktop (1440px) | — | — | No | — | All pages look great on all screen sizes | ⬜ |
| 10.3 | Error Handling | Global | Add error boundaries, loading skeletons, "Sophia is taking a break" fallback if Gemini fails, retry buttons | Add FastAPI fallback (keyword search if FAISS fails), Gemini rate-limit handling (429 → retry after 10s) | — | No | Error responses in all APIs | Break API intentionally → graceful error shown to user | ⬜ |
| 10.4 | End-to-End Testing | All pages | Test all user flows: auth, search, chat, cart, checkout, haggle, voice, mirror mode | Verify all API endpoints, RLS policies, CORS settings | All tables | Yes | All endpoints | All 9 integration checkpoints pass in sequence | ⬜ |
| 10.5 | Deploy Next.js | Vercel | Deploy to Vercel: `vercel --prod`, set all env vars | — | — | No | Vercel deployment | Live URL loads, all features work | ⬜ |
| 10.6 | Deploy FastAPI | Render / Railway | — | Deploy FastAPI to Render: `uvicorn main:app --host 0.0.0.0 --port $PORT`, set `CORS_ORIGINS` to Vercel URL | — | No | Render deployment | `/health` returns healthy, `/search` works from Vercel | ⬜ |
| 10.7 | Demo Video | — | Record 2-3 min demo: (1) Semantic search "summer wedding" (2) Haggle for discount (3) Voice command (4) Checkout with coupon | — | — | — | — | Video uploaded to hackathon platform | ⬜ |
| 10.8 | README & Submission | Repo root | Write README: setup instructions, env vars, tech stack, demo link, team info | — | — | — | — | Submitted to hackathon before deadline | ⬜ |

**🔗 FINAL INTEGRATION CHECKPOINT:** Live demo URL works flawlessly. All features tested. Demo video recorded. README complete. **SHIP IT! 🚀**

---

## Summary Statistics

| Metric | Count |
|---|---|
| **Total Features** | 48 |
| **Total Phases** | 10 |
| **Integration Checkpoints** | 10 |
| **Database Tables** | 4 (`user_profiles`, `products`, `outfit_bundles`, `user_tryon_images`) |
| **API Endpoints** | 7+ (`/api/clerk`, `/api/cart/add`, `/api/cart`, `/api/checkout`, `/api/user/profile`, `/api/tryon`, FastAPI `/search`, `/health`) |
| **Gemini Tool Functions** | 5 (`filter_products`, `generate_discount`, `add_to_cart`, `generate_tryon`, `build_outfit`, `compare_products`) |

---

## Team Assignment Quick Reference

| Phase | Frontend Team Focus | Backend Team Focus |
|---|---|---|
| **Phase 1** | Login page UI, auth callback, auth context | Supabase project setup, Google OAuth config |
| **Phase 2** | Profile page, vibe quiz UI, edit form | `user_profiles` table, RLS, auto-create API |
| **Phase 3** | Product grid, PDP, filters, Zustand store | `products` table, seed data, indexes |
| **Phase 4** | Chat UI, function call parsing, UI updates | FastAPI + FAISS, Gemini integration, `/api/clerk` |
| **Phase 5** | Cart page, checkout page, confetti | Cart API, checkout API, order save logic |
| **Phase 6** | Coupon UI in chat, timer, redemption | Discount tiers, coupon generation, sentiment |
| **Phase 7** | Voice input/output, photo upload, gallery | `user_tryon_images` table, Storage bucket, try-on API |
| **Phase 8** | Outfit card, comparison table | `outfit_bundles` table, build_outfit/compare logic |
| **Phase 9** | Personalized homepage, dashboard UI | Data aggregation, context injection |
| **Phase 10** | Animations, responsive, testing | Deploy FastAPI, error handling, CORS |
