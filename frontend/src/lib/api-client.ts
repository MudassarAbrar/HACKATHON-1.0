import {
    Product,
    Cart,
    ChatMessage,
    CouponCode,
    TryOnImage,
    OutfitBundle,
    DashboardMetrics,
    ActivityItem,
    Recommendation,
    ApiResponse,
    PaginatedResponse,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to handle API requests
async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            credentials: 'include', // Include cookies for session
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Request failed',
                message: data.message,
            };
        }

        return {
            success: true,
            data: data.data || data,
            message: data.message,
        };
    } catch (error) {
        console.error('API request error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// ==================== PRODUCTS ====================

export async function getProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    colors?: string[];
    sizes?: string[];
    page?: number;
    perPage?: number;
}): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const queryParams = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                if (Array.isArray(value)) {
                    queryParams.append(key, value.join(','));
                } else {
                    queryParams.append(key, value.toString());
                }
            }
        });
    }

    return apiRequest<PaginatedResponse<Product>>(
        `/api/products?${queryParams.toString()}`
    );
}

export async function getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiRequest<Product>(`/api/products/${id}`);
}

export async function searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    return apiRequest<Product[]>(`/api/products/search?q=${encodeURIComponent(query)}`);
}

// ==================== CART ====================

export async function getCart(): Promise<ApiResponse<Cart>> {
    return apiRequest<Cart>('/api/cart');
}

export async function addToCart(
    userId: string,
    productId: string,
    quantity: number,
    selectedColor?: string,
    selectedSize?: string
): Promise<ApiResponse<Cart>> {
    return apiRequest<Cart>('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({
            userId,
            productId: Number(productId),
            quantity,
            size: selectedSize,
            color: selectedColor
        }),
    });
}

export async function updateCartItem(
    itemId: string,
    quantity: number
): Promise<ApiResponse<Cart>> {
    return apiRequest<Cart>(`/api/cart/update/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
    });
}

export async function removeFromCart(itemId: string): Promise<ApiResponse<Cart>> {
    return apiRequest<Cart>(`/api/cart/remove/${itemId}`, {
        method: 'DELETE',
    });
}

export async function applyCoupon(code: string): Promise<ApiResponse<Cart>> {
    return apiRequest<Cart>('/api/cart/apply-coupon', {
        method: 'POST',
        body: JSON.stringify({ code }),
    });
}

// ==================== CHECKOUT ====================

export async function createCheckoutSession(): Promise<ApiResponse<{ sessionId: string }>> {
    return apiRequest<{ sessionId: string }>('/api/checkout/create', {
        method: 'POST',
    });
}

export async function completeCheckout(sessionId: string): Promise<ApiResponse<{ orderId: string }>> {
    return apiRequest<{ orderId: string }>('/api/checkout/complete', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
    });
}

// ==================== AI SOPHIA ====================

export async function sendChatMessage(
    message: string,
    history: ChatMessage[]
): Promise<ApiResponse<ChatMessage>> {
    return apiRequest<ChatMessage>('/api/clerk/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
    });
}

export async function validateCoupon(code: string): Promise<ApiResponse<CouponCode>> {
    return apiRequest<CouponCode>(`/api/clerk/validate-coupon/${code}`);
}

// ==================== VIRTUAL TRY-ON ====================

export async function uploadTryOnImage(
    imageFile: File,
    productId: string
): Promise<ApiResponse<TryOnImage>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('productId', productId);

    return apiRequest<TryOnImage>('/api/tryon/upload', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
    });
}

export async function getTryOnHistory(): Promise<ApiResponse<TryOnImage[]>> {
    return apiRequest<TryOnImage[]>('/api/tryon/history');
}

export async function deleteTryOnImage(imageId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/api/tryon/${imageId}`, {
        method: 'DELETE',
    });
}

// ==================== OUTFIT BUILDER ====================

export async function createOutfit(
    productIds: string[],
    name: string
): Promise<ApiResponse<OutfitBundle>> {
    return apiRequest<OutfitBundle>('/api/outfits/create', {
        method: 'POST',
        body: JSON.stringify({ productIds, name }),
    });
}

export async function getSavedOutfits(): Promise<ApiResponse<OutfitBundle[]>> {
    return apiRequest<OutfitBundle[]>('/api/outfits');
}

export async function deleteOutfit(outfitId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/api/outfits/${outfitId}`, {
        method: 'DELETE',
    });
}

// ==================== DASHBOARD ====================

export async function getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    return apiRequest<DashboardMetrics>('/api/dashboard/metrics');
}

export async function getRecentActivity(limit = 10): Promise<ApiResponse<ActivityItem[]>> {
    return apiRequest<ActivityItem[]>(`/api/dashboard/activity?limit=${limit}`);
}

export async function getRecommendations(limit = 5): Promise<ApiResponse<Recommendation[]>> {
    return apiRequest<Recommendation[]>(`/api/dashboard/recommendations?limit=${limit}`);
}

// ==================== USER PROFILE ====================

export async function getUserProfile(): Promise<ApiResponse<any>> {
    return apiRequest<any>('/api/user-profile');
}

export async function updateUserProfile(updates: any): Promise<ApiResponse<any>> {
    return apiRequest<any>('/api/user-profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
}

export async function updateVibeProfile(preferences: any): Promise<ApiResponse<any>> {
    return apiRequest<any>('/api/user-profile/vibe', {
        method: 'PUT',
        body: JSON.stringify(preferences),
    });
}
