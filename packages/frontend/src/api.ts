import { Deal, SearchFilters, SortOptions, UserPreferences, SavedSearch } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = {
  async getDeals(filters?: SearchFilters, sort?: SortOptions): Promise<Deal[]> {
    const params = new URLSearchParams();
    if (filters?.text) params.append('text', filters.text);
    if (filters?.tags) filters.tags.forEach((tag) => params.append('tags', tag));
    if (filters?.cuisine) filters.cuisine.forEach((c) => params.append('cuisine', c));
    if (filters?.vendor) filters.vendor.forEach((v) => params.append('vendor', v));
    if (filters?.minDiscount) params.append('minDiscount', filters.minDiscount.toString());
    if (filters?.maxDiscount) params.append('maxDiscount', filters.maxDiscount.toString());
    if (filters?.expiresAfter) params.append('expiresAfter', filters.expiresAfter);
    if (filters?.expiresBefore) params.append('expiresBefore', filters.expiresBefore);
    if (sort?.field) params.append('sortField', sort.field);
    if (sort?.order) params.append('sortOrder', sort.order);

    const response = await fetch(`${API_BASE}/api/deals?${params}`);
    const data = await response.json();
    return data.deals;
  },

  async getCuisines(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/api/filters/cuisines`);
    const data = await response.json();
    return data.cuisines;
  },

  async getVendors(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/api/filters/vendors`);
    const data = await response.json();
    return data.vendors;
  },

  async getTags(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/api/filters/tags`);
    const data = await response.json();
    return data.tags;
  },

  async getPreferences(userId: string): Promise<UserPreferences> {
    const response = await fetch(`${API_BASE}/api/preferences/${userId}`);
    return response.json();
  },

  async savePreferences(preferences: UserPreferences): Promise<void> {
    await fetch(`${API_BASE}/api/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    });
  },

  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    const response = await fetch(`${API_BASE}/api/saved-searches/${userId}`);
    const data = await response.json();
    return data.searches;
  },

  async saveSearch(search: Omit<SavedSearch, 'id' | 'createdAt'>): Promise<SavedSearch> {
    const response = await fetch(`${API_BASE}/api/saved-searches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(search),
    });
    const data = await response.json();
    return data.search;
  },

  async deleteSavedSearch(userId: string, searchId: string): Promise<void> {
    await fetch(`${API_BASE}/api/saved-searches/${userId}/${searchId}`, {
      method: 'DELETE',
    });
  },

  connectToEvents(
    onMessage: (event: { type: string; deal?: Deal; message?: string }) => void,
  ): EventSource {
    const eventSource = new EventSource(`${API_BASE}/api/events`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    return eventSource;
  },
};
