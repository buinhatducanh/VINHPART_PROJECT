import { Product, SEOPost, Review, Vehicle, VehicleDetail } from '@/shared/types';

// API configuration
// Local dev: Vite proxy handles /api → localhost:3001
// Production: VITE_API_URL points to the separate backend server
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Re-export Product type for convenience
export type { Product };

export interface ProductsResponse {
    data: Product[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ProductFilters {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: 'default' | 'price_asc' | 'price_desc';
    stock_status?: string;
    vehicle_type?: string;
}

// API Functions
export const productApi = {
    // Get products with filters
    getProducts: async (filters: ProductFilters): Promise<ProductsResponse> => {
        const params = new URLSearchParams();

        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.category && filters.category !== 'all') params.append('category', filters.category);
        if (filters.brand && filters.brand !== 'all') params.append('brand', filters.brand);
        if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.sortBy && filters.sortBy !== 'default') params.append('sortBy', filters.sortBy);
        if (filters.stock_status) params.append('stock_status', filters.stock_status);
        if (filters.vehicle_type) params.append('vehicle_type', filters.vehicle_type);

        const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        return response.json();
    },

    // Get max price
    getMaxPrice: async (): Promise<number> => {
        const response = await fetch(`${API_BASE_URL}/products/max-price`);

        if (!response.ok) {
            return 5000000; // Default fallback
        }

        const data = await response.json();
        return data.maxPrice || 5000000;
    },

    // Get single product by ID
    getProductById: async (id: string): Promise<Product> => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);

        if (!response.ok) {
            throw new Error('Failed to fetch product');
        }

        return response.json();
    },

    // Create product
    createProduct: async (product: Partial<Product>): Promise<Product> => {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });

        if (!response.ok) {
            throw new Error('Failed to create product');
        }

        return response.json();
    },

    // Update product
    updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });

        if (!response.ok) {
            throw new Error('Failed to update product');
        }

        return response.json();
    },

    // Delete product
    deleteProduct: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
    },
};

// Orders API
export const ordersApi = {
    getOrders: async () => {
        const response = await fetch(`${API_BASE_URL}/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },
};

// Dashboard API
export const dashboardApi = {
    getStats: async () => {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },
    getStatistics: async (range: 'week' | 'month' | 'year' = 'month') => {
        const response = await fetch(`${API_BASE_URL}/dashboard/statistics?range=${range}`);
        if (!response.ok) throw new Error('Failed to fetch statistics');
        return response.json();
    },
};


// Posts (SEO) API
export const postsApi = {
    getPosts: async (status?: string, limit?: number): Promise<SEOPost[]> => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (limit) params.append('limit', limit.toString());

        const response = await fetch(`${API_BASE_URL}/posts?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch posts');
        return response.json();
    },

    getPostBySlug: async (slug: string): Promise<SEOPost> => {
        const response = await fetch(`${API_BASE_URL}/posts/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch post');
        return response.json();
    },

    createPost: async (post: Partial<SEOPost>): Promise<SEOPost> => {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create post');
        }
        return response.json();
    },

    updatePost: async (id: string, post: Partial<SEOPost>): Promise<SEOPost> => {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update post');
        }
        return response.json();
    },

    deletePost: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete post');
    },
};

// Reviews API
export const reviewsApi = {
    // Lấy đánh giá theo sản phẩm (chỉ approved)
    getByProduct: async (productId: string): Promise<Review[]> => {
        const params = new URLSearchParams({
            productId,
            limit: '50',
        });
        const response = await fetch(`${API_BASE_URL}/reviews?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        return response.json();
    },

    // Tạo đánh giá mới
    create: async (review: {
        product_id: string;
        customer_name: string;
        customer_email: string;
        rating: number;
        title: string;
        content: string;
    }): Promise<Review> => {
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review),
        });
        if (!response.ok) throw new Error('Failed to create review');
        return response.json();
    },
};

export interface VehiclesResponse {
    data: Vehicle[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const bodykitApi = {
    getVehicles: async (filters?: { page?: number; limit?: number; brand?: string; search?: string }): Promise<VehiclesResponse> => {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.brand && filters.brand !== 'all') params.append('brand', filters.brand);
        if (filters?.search) params.append('search', filters.search);

        const response = await fetch(`${API_BASE_URL}/bodykit/vehicles?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        return response.json();
    },

    getVehicleDetail: async (id: string): Promise<VehicleDetail> => {
        const response = await fetch(`${API_BASE_URL}/bodykit/vehicles/${id}`);
        if (!response.ok) throw new Error('Failed to fetch vehicle detail');
        return response.json();
    },

    getAdminVehicles: async (): Promise<Vehicle[]> => {
        const response = await fetch(`${API_BASE_URL}/bodykit/vehicles-admin`);
        if (!response.ok) throw new Error('Failed to fetch admin vehicles');
        return response.json();
    },

    createVehicle: async (data: { name: string; brand: string; model: string; year?: number; image?: string; description?: string }): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/bodykit/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create vehicle');
        return response.json();
    },

    updateVehicle: async (id: string, data: Partial<{ name: string; brand: string; model: string; year: number; image: string; description: string; isActive: boolean }>): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/bodykit/vehicles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update vehicle');
        return response.json();
    },

    deleteVehicle: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/bodykit/vehicles/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete vehicle');
    },

    addParts: async (vehicleId: string, productIds: string[], position?: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/bodykit/vehicles/${vehicleId}/parts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds, position }),
        });
        if (!response.ok) throw new Error('Failed to add parts');
        return response.json();
    },

    removePart: async (vehicleId: string, productId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/bodykit/vehicles/${vehicleId}/parts/${productId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to remove part');
    },
};
