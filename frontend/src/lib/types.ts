// Database types
export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    vibe_profile?: VibeProfile;
    preferences?: UserPreferences;
    created_at: string;
    updated_at: string;
}

export interface VibeProfile {
    style?: string[];
    colors?: string[];
    occasions?: string[];
    budget_range?: {
        min: number;
        max: number;
    };
    sizes?: {
        clothing?: string;
        shoes?: string;
    };
}

export interface UserPreferences {
    dark_mode?: boolean;
    notifications?: boolean;
    newsletter?: boolean;
}

// Product types
export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: 'clothing' | 'footwear' | 'accessories';
    subcategory: string;
    colors: string[];
    sizes: string[];
    image_urls: string[];
    stock: number;
    rating?: number;
    reviews_count?: number;
    tags?: string[];
    is_new?: boolean;
    is_featured?: boolean;
    created_at?: string;
    updated_at?: string;
}


// Cart types
export interface CartItem {
    cart_item_id: string;
    user_id: string;
    product_id: string;
    product: Product;
    quantity: number;
    color?: string;
    size?: string;
    added_at: string;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
}

// Checkout types
export interface CheckoutSession {
    session_id: string;
    user_id: string;
    items: CartItem[];
    total: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
}

// AI Sophia types
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    metadata?: {
        products?: Product[];
        coupon?: CouponCode;
        outfit?: OutfitBundle;
    };
}

export interface CouponCode {
    code: string;
    discount_percent: number;
    reason: string;
    expires_at: string;
    status: 'active' | 'expired' | 'used';
}

// Virtual Try-On types
export interface TryOnImage {
    id: string;
    user_id: string;
    original_image: string;
    product_id: string;
    result_image: string;
    created_at: string;
}

// Outfit Builder types
export interface OutfitBundle {
    id: string;
    name: string;
    items: {
        top?: Product;
        bottom?: Product;
        shoes?: Product;
        accessories?: Product[];
    };
    total_price: number;
    discount_percent: number;
    final_price: number;
    color_harmony?: string;
    created_at: string;
}

// Dashboard types
export interface DashboardMetrics {
    total_spent: number;
    items_purchased: number;
    avg_rating: number;
    loyalty_points: number;
    active_coupons: number;
    wishlist_count: number;
    cart_count: number;
    vibe_match_score: number;
}

export interface ActivityItem {
    id: string;
    type: 'purchase' | 'wishlist' | 'review' | 'tryon' | 'chat';
    title: string;
    description: string;
    timestamp: string;
    metadata?: any;
}

export interface Recommendation {
    product: Product;
    reason: string;
    confidence: number;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
    has_more: boolean;
}
