import { SEOPost } from '../../src/shared/types';

// API configuration
export const API_BASE_URL = '/api';

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
