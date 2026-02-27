import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatImageUrl(url: string | undefined, width = 400) {
    if (!url) return '/placeholder-product.svg';

    // Cloudinary
    if (url.includes('cloudinary.com')) {
        return url.replace('/upload/', `/upload/q_auto,f_auto,w_${width},c_scale/`);
    }

    // External URL
    if (url.startsWith('http')) {
        return url;
    }

    // Local URL (starts with / or just filename)
    const baseUrl = 'http://localhost:3001';

    if (url.startsWith('/')) {
        // If it already has /uploads prefix or similar
        return `${baseUrl}${url}`;
    }

    // Just filename, assume in uploads
    return `${baseUrl}/uploads/${url}`;
}
