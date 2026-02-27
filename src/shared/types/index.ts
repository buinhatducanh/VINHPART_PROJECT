export interface Product {
  product_id: string;
  product_name: string;
  category: string;
  sub_category: string;
  vehicle_type: 'Motorbike' | 'Car';
  compatible_brand: string;
  compatible_model: string;
  engine_capacity: string;
  price: number;
  original_price?: number; // Giá gốc trước khi giảm
  discount_percentage?: number; // % giảm giá
  stock: number;  // ✅ FIX: Required field, not optional
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  description: string;
  product_image: string;
  images?: string[]; // ✅ FIX: Support multiple images
  sku?: string;      // ✅ FIX: Support SKU
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  parent_id?: string | null; // ID của danh mục cha, null nếu là danh mục gốc
  description?: string;
  icon?: string;
  order: number; // Thứ tự hiển thị
  created_at: string;
  updated_at: string;
  subCategories?: Category[] | string[];
}

// SEO Post interface
export interface SEOPost {
  id: string;
  title: string;
  slug: string; // URL-friendly version của title
  content: string;
  excerpt?: string; // Mô tả ngắn
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  status: 'DRAFT' | 'PUBLISHED';
  authorId?: string;
  author?: User;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}

// Review interface
export interface Review {
  id: string;
  product_id: string;
  product_name: string; // Để hiển thị dễ hơn
  customer_name: string;
  customer_email: string;
  rating: number; // 1-5 stars
  title: string;
  content: string;
  images?: string[]; // Hình ảnh đính kèm
  status: 'pending' | 'approved' | 'rejected';
  is_verified_purchase: boolean; // Đã mua hàng hay chưa
  priority: number; // Độ ưu tiên (số càng cao càng lên top)
  helpful_count: number; // Số người thấy hữu ích
  created_at: string;
  updated_at: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}