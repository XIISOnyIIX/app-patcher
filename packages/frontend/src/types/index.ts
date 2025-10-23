export interface Deal {
  id: string;
  title: string;
  description: string;
  vendor: Vendor;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  imageUrl?: string;
  expiresAt: string;
  isFeatured: boolean;
  tags: string[];
  minOrder?: number;
  deliveryFee?: number;
  availableAt: string[];
}

export interface Vendor {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  deliveryTime: string;
  cuisine: string[];
}

export interface UserPreferences {
  favoriteVendors: string[];
  favoriteCategories: string[];
  maxDeliveryFee?: number;
  minDiscount?: number;
  notificationsEnabled: boolean;
}

export interface Alert {
  id: string;
  dealId: string;
  type: 'expiring_soon' | 'new_deal' | 'price_drop';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface FilterOptions {
  vendors: string[];
  categories: string[];
  minDiscount?: number;
  maxPrice?: number;
  searchQuery?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
