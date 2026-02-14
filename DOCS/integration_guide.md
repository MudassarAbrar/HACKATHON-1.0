# Complete Integration Guide
## Merging Replit-App Frontend with Production Backend

**Last Updated:** 2026-02-14 @ 01:05 PKT  
**Purpose:** Step-by-step guide to segregate replit-app and integrate with production backend  
**Status:** Planning Phase

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Analysis Summary](#analysis-summary)
3. [Phase 1: Environment Setup](#phase-1-environment-setup)
4. [Phase 2: Frontend Segregation](#phase-2-frontend-segregation)
5. [Phase 3: API Route Alignment](#phase-3-api-route-alignment)
6. [Phase 4: Component Migration](#phase-4-component-migration)
7. [Phase 5: Integration Testing](#phase-5-integration-testing)
8. [Phase 6: Final Verification](#phase-6-final-verification)

---

## Architectural Overview

### Current State

**Replit-App Stack:**
- **Frontend:** React 18 + Vite + TypeScript
- **Routing:** Wouter (lightweight `react-router` alternative)
- **UI:** shadcn/ui + Tailwind CSS + Framer Motion
- **State:** Zustand (cart management)
- **Backend:** Express + Drizzle ORM + PostgreSQL
- **Current Status:** Mock implementation, hardcoded data

**Production Backend Stack:**
- **Runtime:** Node.js (API routes) + FastAPI (semantic search)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** Gemini 1.5 Flash w/ function calling
- **Features:** 29 API endpoints, 4 tables, 5 AI tools
- **Status:** 100% complete, 96% test coverage

### Target Architecture

```
┌─────────────────────────────────────────────┐
│         FRONTEND (NEW)                       │
│  /frontend/                                  │
│  ├── src/                                    │
│  │   ├── pages/ (from replit-app)          │
│  │   ├── components/ (from replit-app)     │
│  │   ├── lib/ (hybrid: replit + new)       │
│  │   └── App.tsx                            │
│  └── package.json                           │
└─────────────────────────────────────────────┘
              ↓ HTTP Requests
┌─────────────────────────────────────────────┐
│      BACKEND APIS (EXISTING)                │
│  /backend/routes/*.js                       │
│  ├── clerk.js (AI chat)                     │
│  ├── cart.js                                │
│  ├── checkout.js                            │
│  ├── dashboard.js                           │
│  ├── outfits.js                             │
│  ├── tryon.js                               │
│  └── user-profile.js                        │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│      FASTAPI (SEMANTIC SEARCH)              │
│  /fastapi/main.py                           │
│  └── POST /search (FAISS vector search)    │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│         SUPABASE                            │
│  - Auth (Google OAuth)                      │
│  - Database (4 tables + RLS)                │
│  - Storage (try-on images)                  │
└─────────────────────────────────────────────┘
```

---

## Analysis Summary

### Replit-App Structure

```
replit-app/
├── client/               # FRONTEND (KEEP & MIGRATE)
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat-panel.tsx      ✅ Keep (replace AI logic)
│   │   │   ├── cart-drawer.tsx     ✅ Keep (connect to API)
│   │   │   ├── product-card.tsx    ✅ Keep (minor updates)
│   │   │   ├── header.tsx          ✅ Keep (add auth)
│   │   │   └── ui/                 ✅ Keep all (shadcn/ui)
│   │   ├── pages/
│   │   │   ├── home.tsx            ✅ Keep (connect API)
│   │   │   ├── shop.tsx            ✅ Keep (connect API)
│   │   │   ├── product-detail.tsx  ✅ Keep (add try-on)
│   │   │   └── not-found.tsx       ✅ Keep
│   │   ├── lib/
│   │   │   ├── products.ts         ❌ Delete (use API)
│   │   │   ├── cart-store.ts       ⚠️  Modify (API sync)
│   │   │   ├── queryClient.ts      ✅ Keep
│   │   │   └── theme-provider.tsx  ✅ Keep
│   │   └── App.tsx                 ⚠️  Modify (add auth)
│   └── index.html                  ✅ Keep
│
├── server/              # BACKEND (DELETE)
│   ├── index.ts         ❌ Delete (replaced by our backend)
│   ├── routes.ts        ❌ Delete (only has health check)
│   └── *.ts             ❌ Delete all
│
├── shared/              # SCHEMA (DELETE)
│   └── schema.ts        ❌ Delete (using Supabase schema)
│
└── package.json         ⚠️  Merge dependencies
```

### Key Findings

**✅ GOOD:**
- Beautiful UI components (shadcn/ui)
- Smooth animations (Framer Motion)
- Clean component structure
- Proper TypeScript types

**⚠️  NEEDS WORK:**
- Hardcoded product data in `lib/products.ts`
- Mock AI chat (hardcoded responses)
- No authentication
- No real API integration
- Cart is client-side only (no persistence)

**❌ REMOVE:**
- Entire `server/` folder (we have production backend)
- `shared/schema.ts` (using Supabase schema)
- Drizzle ORM deps (using Supabase client)

---

## Phase 1: Environment Setup

### Step 1.1: Create Frontend Directory

```bash
cd /home/own/Study/Core/Web/HACKATHON-1.0
mkdir frontend
```

### Step 1.2: Copy Client Files

```bash
cp -r replit-app/client/* frontend/
cp replit-app/package.json frontend/package.json.backup
cp replit-app/tailwind.config.ts frontend/
cp replit-app/tsconfig.json frontend/
cp replit-app/vite.config.ts frontend/
cp replit-app/postcss.config.js frontend/
cp replit-app/components.json frontend/
```

### Step 1.3: Clean Up Frontend

```bash
cd frontend
# Remove backend references
rm -rf ../replit-app/server
rm -rf ../replit-app/shared
```

### Step 1.4: Update package.json

Create `frontend/package.json` by merging:

**KEEP from replit-app:**
- All `@radix-ui/*` packages (shadcn/ui)
- `framer-motion`
- `wouter`
- `@tanstack/react-query`
- `tailwindcss`, `autoprefixer`, `postcss`
- `lucide-react`
- UI deps: `class-variance-authority`, `clsx`, `tailwind-merge`

**ADD new:**
- `@supabase/supabase-js` (for auth + database)
- `zustand` (if not already present)

**REMOVE:**
- `drizzle-orm`, `drizzle-zod`, `drizzle-kit`
- `express`, `express-session`
- `passport`, `passport-local`
- `pg`, `connect-pg-simple`
- `ws` (websockets)

**New `frontend/package.json`:**

```json
{
  "name": "the-shopkeeper-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slider": "^1.2.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.60.5",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^11.13.1",
    "lucide-react": "^0.453.0",
    "next-themes": "^0.4.6",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "wouter": "^3.3.5",
    "zod": "^3.24.2",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.15",
    "@types/node": "20.19.27",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.7.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.17",
    "typescript": "5.6.3",
    "vite": "^7.3.0"
  }
}
```

### Step 1.5: Install Dependencies

```bash
cd frontend
npm install
```

### Step 1.6: Create Environment File

Create `frontend/.env.local`:

```bash
# Supabase
VITE_SUPABASE_URL=https://vyclswkearzgvwxbgnha.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Zjwke1d_efu_vBmNNbby1w_ca6ZqNvw

# Backend APIs
VITE_API_URL=http://localhost:3000
VITE_FASTAPI_URL=http://localhost:8000
```

**Note:** Vite uses `VITE_` prefix instead of `NEXT_PUBLIC_`

---

## Phase 2: Frontend Segregation

### Step 2.1: Update Vite Config

Edit `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### Step 2.2: Create Supabase Client

Create `frontend/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Step 2.3: Create Auth Context

Create `frontend/src/context/AuthContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Step 2.4: Create API Client

Create `frontend/src/lib/api-client.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL;
const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL;

export async function fetchProducts() {
  const res = await fetch(`${API_URL}/api/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProduct(id: number) {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function sendChatMessage(userId: string, message: string, history: any[]) {
  const res = await fetch(`${API_URL}/api/clerk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, message, conversationHistory: history }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function semanticSearch(query: string) {
  const res = await fetch(`${FASTAPI_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: 5 }),
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function addToCart(userId: string, productId: number, quantity: number) {
  const res = await fetch(`${API_URL}/api/cart/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, productId, quantity }),
  });
  if (!res.ok) throw new Error('Failed to add to cart');
  return res.json();
}

export async function getCart(userId: string) {
  const res = await fetch(`${API_URL}/api/cart/${userId}`);
  if (!res.ok) throw new Error('Failed to get cart');
  return res.json();
}

export async function checkout(userId: string, couponCode?: string) {
  const res = await fetch(`${API_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, couponCode }),
  });
  if (!res.ok) throw new Error('Checkout failed');
  return res.json();
}
```

---

## Phase 3: API Route Alignment

### Step 3.1: Product Data Migration

**Current:** `frontend/src/lib/products.ts` has hardcoded array

**Action:** Delete `products.ts` and use API

**In components:**

```typescript
// BEFORE (replit-app)
import { products } from '@/lib/products';

// AFTER (integrated)
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/api-client';

const { data: products } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
});
```

### Step 3.2: Chat Panel Integration

**Current:** `chat-panel.tsx` has mock `generateResponse()` function

**Action:** Replace with real API calls

**Modified `chat-panel.tsx`:**

```typescript
// Replace generateResponse with API call
const handleSend = async () => {
  if (!input.trim() || !user) return;

  const userMsg = {
    id: Date.now().toString(),
    role: 'user',
    content: input.trim(),
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, userMsg]);
  setInput('');
  setIsTyping(true);

  try {
    const response = await sendChatMessage(user.id, userMsg.content, messages);

    const assistantMsg = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.message,
      products: response.products || undefined,
      coupon: response.generatedCoupon || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMsg]);

    // Handle tool results
    if (response.cartUpdated) {
      // Refresh cart
      queryClient.invalidateQueries(['cart']);
    }
  } catch (error) {
    console.error('Chat error:', error);
  } finally {
    setIsTyping(false);
  }
};
```

### Step 3.3: Cart Store Migration

**Current:** `cart-store.ts` is client-side only (Zustand)

**Action:** Sync with backend API

**Modified `cart-store.ts`:**

```typescript
import { create } from 'zustand';
import { addToCart as apiAddToCart, getCart } from './api-client';

interface CartStore {
  items: CartItem[];
  loading: boolean;
  addToCart: (product: Product, userId: string) => Promise<void>;
  fetchCart: (userId: string) => Promise<void>;
  // ... other methods
}

export const useCart = create<CartStore>((set) => ({
  items: [],
  loading: false,

  addToCart: async (product, userId) => {
    try {
      const { cart } = await apiAddToCart(userId, product.id, 1);
      set({ items: cart });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  },

  fetchCart: async (userId) => {
    set({ loading: true });
    try {
      const { cart } = await getCart(userId);
      set({ items: cart, loading: false });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      set({ loading: false });
    }
  },
}));
```

---

## Phase 4: Component Migration

### Step 4.1: Update App.tsx

```typescript
import { AuthProvider } from '@/context/AuthContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ThemeProvider>
            {/* existing content */}
          </ThemeProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Step 4.2: Create Auth Pages

**Create `frontend/src/pages/login.tsx`:**

```typescript
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useEffect } from 'wouter';

export default function Login() {
  const { signIn, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) setLocation('/');
  }, [user]);

  return (
    <div className=\"min-h-screen flex items-center justify-center\">
      <Button onClick={signIn}>Sign in with Google</Button>
    </div>
  );
}
```

**Create `frontend/src/pages/auth-callback.tsx`:**

```typescript
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Auto-create profile
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata.full_name,
          }),
        });

        setLocation('/');
      }
    });
  }, []);

  return <div>Logging you in...</div>;
}
```

### Step 4.3: Update Router

```typescript
// In App.tsx
<Switch>
  <Route path=\"/login\" component={Login} />
  <Route path=\"/auth/callback\" component={AuthCallback} />
  <Route path=\"/\" component={() => <Home onChatOpen={onChatOpen} />} />
  {/* other routes */}
</Switch>
```

### Step 4.4: Protect Routes

```typescript
// Create ProtectedRoute wrapper
function ProtectedRoute({ component: Component, ...props }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!user) {
    setLocation('/login');
    return null;
  }

  return <Component {...props} />;
}
```

---

## Phase 5: Integration Testing

### Step 5.1: Test Checklist

**Authentication:**
- [ ] Google OAuth login works
- [ ] Profile auto-created on first login
- [ ] Session persists on page reload
- [ ] Logout clears session

**Product Catalog:**
- [ ] Products load from API
- [ ] Product detail page works
- [ ] Images display correctly

**Chat:**
- [ ] Sophia responds (real AI)
- [ ] Products display in chat
- [ ] Add to cart from chat works
- [ ] Coupons generate correctly

**Cart:**
- [ ] Add to cart persists to backend
- [ ] Cart syncs across tabs
- [ ] Quantity updates work
- [ ] Remove from cart works

**Checkout:**
- [ ] Checkout creates order
- [ ] Coupon codes apply correctly
- [ ] Cart clears after checkout

### Step 5.2: Start Services

```bash
# Terminal 1: Backend (Node.js)
cd backend
npm run dev

# Terminal 2: FastAPI
cd fastapi
source venv/bin/activate
uvicorn main:app --reload

# Terminal 3: Frontend
cd frontend
npm run dev
```

### Step 5.3: Verify API Connections

```bash
# Test backend
curl http://localhost:3000/api/products

# Test FastAPI
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "summer dress", "top_k": 3}'

# Test frontend
open http://localhost:5173
```

---

## Phase 6: Final Verification

### Step 6.1: Feature Completeness

| Feature | Backend Ready | Frontend Updated | Status |
|---------|---------------|------------------|--------|
| Product Catalog | ✅ | ⏳ | In Progress |
| Semantic Search | ✅ | ⏳ | In Progress |
| AI Chat (Sophia) | ✅ | ⏳ | In Progress |
| Cart Management | ✅ | ⏳ | In Progress |
| Checkout | ✅ | ⏳ | In Progress |
| Coupon System | ✅ | ⏳ | In Progress |
| Mirror Mode | ✅ | ❌ | Not Started |
| Outfit Builder | ✅ | ❌ | Not Started |
| Dashboard | ✅ | ❌ | Not Started |

### Step 6.2: Missing Components

**Need to create:**
1. Mirror Mode gallery page
2. Try-on button on PDP
3. Outfit builder UI
4. Dashboard page
5. Voice input/output integration

### Step 6.3: Deployment Prep

```bash
# Build frontend
cd frontend
npm run build

# Test production build
npm run preview
```

---

## Summary

### What We Have

**✅ From Replit-App:**
- Beautiful UI components
- Smooth animations
- Clean page structure
- Cart drawer UI
- Chat panel UI

**✅ From Production Backend:**
- Complete API layer (29 endpoints)
- AI integration (Gemini + FAISS)
- Authentication (Supabase)
- All business logic

### What We Need To Do

**Phase 1-2:** Setup (2 hours)
- Create frontend folder
- Install deps
- Configure Vite

**Phase 3:** API Integration (4 hours)
- Replace mock data with API calls
- Update chat panel
- Sync cart store

**Phase 4:** Component Updates (3 hours)
- Add auth pages
- Update routing
- Protect routes

**Phase 5-6:** Testing & New Features (6 hours)
- Integration testing
- Build mirror mode UI
- Build outfit builder UI
- Build dashboard

**Total Estimated Time:** 15-20 hours

---

## Next Steps

1. **Run Phase 1:** Create frontend directory and copy files
2. **Run Phase 2:** Set up environment and install dependencies
3. **Run Phase 3:** Replace hardcoded data with API calls
4. **Run Phase 4:** Add authentication flow
5. **Run Phase 5:** Test all integrations
6. **Run Phase 6:** Implement remaining features

**Ready to start? Let's begin with Phase 1! 🚀**
