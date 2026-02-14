import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import route helper functions
import { getProducts, getProductById } from './routes/products.js';
import { addToCart, getCart, removeFromCart, updateCartQuantity, clearCart } from './routes/cart.js';
import { checkout } from './routes/checkout.js';
import { handleClerkMessage } from './routes/clerk.js';
import { getProfile, updateProfile, upsertProfile } from './routes/user-profile.js';
import { generateTryonImage } from './routes/tryon.js';
import { buildOutfit, getOutfits, deleteOutfit } from './routes/outfits.js';
import { getDashboardStats } from './routes/dashboard.js';
import { handleAuthCallback } from './routes/auth-callback.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== PRODUCTS ROUTES ====================
app.get('/api/products', async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            gender: req.query.gender,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        };

        const result = await getProducts(filters);

        if (result.error) {
            return res.status(400).json({ success: false, error: result.error });
        }

        res.json({ success: true, data: result.products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const result = await getProductById(parseInt(req.params.id));

        if (result.error) {
            return res.status(400).json({ success: false, error: result.error });
        }

        if (!result.product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({ success: true, data: result.product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== CART ROUTES ====================
app.get('/api/cart/:userId', async (req, res) => {
    try {
        const cart = await getCart(req.params.userId);
        res.json({ success: true, data: cart });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/cart/add', async (req, res) => {
    try {
        const { userId, productId, quantity, size, color } = req.body;
        const cart = await addToCart(userId, productId, quantity, size, color);
        res.json({ success: true, data: cart });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/cart/update', async (req, res) => {
    try {
        const { userId, productId, quantity, size, color } = req.body;
        const cart = await updateCartQuantity(userId, productId, quantity, size, color);
        res.json({ success: true, data: cart });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/cart/remove', async (req, res) => {
    try {
        const { userId, productId, size, color } = req.body;
        const cart = await removeFromCart(userId, productId, size, color);
        res.json({ success: true, data: cart });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/cart/clear', async (req, res) => {
    try {
        const { userId } = req.body;
        const cart = await clearCart(userId);
        res.json({ success: true, data: cart });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== CHECKOUT ROUTES ====================
app.post('/api/checkout', async (req, res) => {
    try {
        const { userId, couponCode } = req.body;
        const result = await checkout(userId, couponCode);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== AI CHAT ROUTES ====================
app.post('/api/clerk', async (req, res) => {
    try {
        const { userId, message, conversationHistory } = req.body;
        const result = await handleClerkMessage({ userId, message, conversationHistory });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== USER PROFILE ROUTES ====================
app.get('/api/user/profile/:userId', async (req, res) => {
    try {
        const result = await getProfile(req.params.userId);
        if (result.error) {
            return res.status(400).json({ success: false, error: result.error });
        }
        res.json({ success: true, data: result.profile });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/user/profile', async (req, res) => {
    try {
        const { userId, email, name } = req.body;

        // Validate required fields
        if (!userId || !email) {
            return res.status(400).json({
                success: false,
                error: 'userId and email are required'
            });
        }

        // Use upsertProfile to create or return existing profile
        const result = await upsertProfile({
            id: userId,
            email,
            user_metadata: name ? { name } : {}
        });

        if (result.error) {
            console.error('Profile upsert error:', result.error);
            return res.status(400).json({ success: false, error: result.error });
        }

        console.log(`Profile ${result.isNew ? 'created' : 'retrieved'} for:`, email);
        res.json({ success: true, data: result.profile });
    } catch (error) {
        console.error('Profile endpoint error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== TRY-ON ROUTES ====================
app.post('/api/tryon', async (req, res) => {
    try {
        const { userId, productId, userImageUrl } = req.body;
        const result = await generateTryOnImage(userId, productId, userImageUrl);
        if (result.error) {
            return res.status(400).json({ success: false, error: result.error });
        }
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== OUTFITS ROUTES ====================
app.get('/api/outfits/:userId', async (req, res) => {
    try {
        const result = await getOutfits(req.params.userId);
        if (result.error) {
            return res.status(400).json({ success: false, error: result.error });
        }
        res.json({ success: true, data: result.outfits });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/outfits', async (req, res) => {
    try {
        const { userId, occasion, budget, style, season } = req.body;
        const result = await buildOutfit(userId, occasion, budget, style, season);
        if (result.error) {
            return res.status(400).json({ success: false, error: result.error });
        }
        res.json({ success: true, data: result.outfit });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== DASHBOARD ROUTES ====================
app.get('/api/dashboard/:userId', async (req, res) => {
    try {
        const result = await getDashboardStats(req.params.userId);
        if (result.error) {
            return res.status(400).json({ success: false, error: result.error });
        }
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== AUTH ROUTES ====================
app.get('/api/auth/callback', async (req, res) => {
    try {
        const { code } = req.query;
        const result = await handleAuthCallback(code);
        if (result.error) {
            return res.status(400).json({ success: false, error: result.error });
        }
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
    console.log(`🛍️  Products API: http://localhost:${PORT}/api/products`);
});
