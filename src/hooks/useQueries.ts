import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, ordersApi, dashboardApi, ProductFilters, Product } from '@/lib/api';

// Query Keys - centralized for cache invalidation
export const queryKeys = {
    products: (filters: ProductFilters) => ['products', filters] as const,
    maxPrice: ['maxPrice'] as const,
    orders: ['orders'] as const,
    dashboardStats: ['dashboardStats'] as const,
};

// ============ PRODUCTS HOOKS ============

/**
 * Hook to fetch products with caching
 * Data stays fresh for 5 minutes, then refetches in background
 */
export function useProducts(filters: ProductFilters) {
    return useQuery({
        queryKey: queryKeys.products(filters),
        queryFn: () => productApi.getProducts(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    });
}

/**
 * Hook to fetch max price - cached for longer since it rarely changes
 */
export function useMaxPrice() {
    return useQuery({
        queryKey: queryKeys.maxPrice,
        queryFn: productApi.getMaxPrice,
        staleTime: 30 * 60 * 1000, // 30 minutes - max price doesn't change often
        gcTime: 60 * 60 * 1000, // 1 hour cache
    });
}

/**
 * Hook to create a new product
 */
export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productApi.createProduct,
        onSuccess: () => {
            // Invalidate all product queries to refetch
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.maxPrice });
        },
    });
}

/**
 * Hook to update a product
 */
export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, product }: { id: string; product: Partial<Product> }) =>
            productApi.updateProduct(id, product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.maxPrice });
        },
    });
}

/**
 * Hook to delete a product
 */
export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productApi.deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.maxPrice });
        },
    });
}

// ============ ORDERS HOOKS ============

export function useOrders() {
    return useQuery({
        queryKey: queryKeys.orders,
        queryFn: ordersApi.getOrders,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

// ============ DASHBOARD HOOKS ============

export function useDashboardStats() {
    return useQuery({
        queryKey: queryKeys.dashboardStats,
        queryFn: dashboardApi.getStats,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
