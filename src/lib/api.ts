import { Product } from '@/shared/types';

// API configuration
export const API_BASE_URL = 'http://localhost:3001/api';

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
};
