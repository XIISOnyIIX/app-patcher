export interface Deal {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  vendor: string;
  discount: number;
  expiresAt: string;
  tags: string[];
  createdAt: string;
}

export interface SearchFilters {
  text?: string;
  tags?: string[];
  cuisine?: string[];
  vendor?: string[];
  minDiscount?: number;
  maxDiscount?: number;
  expiresAfter?: string;
  expiresBefore?: string;
}

export interface SortOptions {
  field: 'discount' | 'expiresAt' | 'createdAt' | 'title';
  order: 'asc' | 'desc';
}

export interface UserPreferences {
  userId: string;
  notificationsEnabled: boolean;
  preferredCuisines: string[];
  minDiscountThreshold: number;
  alertChannels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: SearchFilters;
  sort?: SortOptions;
  createdAt: string;
  notifyOnNewMatches: boolean;
}
