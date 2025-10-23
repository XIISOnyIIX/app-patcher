import { Deal, UserPreferences, SavedSearch } from './types';

export class DataStore {
  private deals: Deal[] = [];
  private preferences: Map<string, UserPreferences> = new Map();
  private savedSearches: Map<string, SavedSearch[]> = new Map();

  constructor() {
    this.seedDeals();
  }

  private seedDeals() {
    const now = new Date();
    this.deals = [
      {
        id: 'deal-1',
        title: 'Half-price Sushi Platters',
        description: 'Tonight only at Sakura Downtown — online orders get 50% off family packs.',
        cuisine: 'Japanese',
        vendor: 'Sakura Downtown',
        discount: 50,
        expiresAt: new Date(now.getTime() + 5 * 60 * 60 * 1000),
        tags: ['sushi', 'dinner', 'family'],
        createdAt: now,
      },
      {
        id: 'deal-2',
        title: 'Free Delivery On Breakfast Orders',
        description: 'Skip the queue! Early bird delivery is free when you order before 9am.',
        cuisine: 'American',
        vendor: 'Morning Cafe',
        discount: 100,
        expiresAt: new Date(now.getTime() + 22 * 60 * 60 * 1000),
        tags: ['breakfast', 'delivery', 'morning'],
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'deal-3',
        title: '30% Off All Pizzas',
        description: 'Use code PIZZA30 for any large or XL pizza',
        cuisine: 'Italian',
        vendor: 'Pizza Palace',
        discount: 30,
        expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        tags: ['pizza', 'italian', 'lunch', 'dinner'],
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      },
      {
        id: 'deal-4',
        title: 'Buy One Get One Free Tacos',
        description: 'Every Tuesday! BOGO on all taco varieties',
        cuisine: 'Mexican',
        vendor: 'Taco Time',
        discount: 50,
        expiresAt: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        tags: ['tacos', 'mexican', 'bogo'],
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        id: 'deal-5',
        title: '20% Off Chinese Feast',
        description: 'Get 20% off orders over $40 at Golden Dragon',
        cuisine: 'Chinese',
        vendor: 'Golden Dragon',
        discount: 20,
        expiresAt: new Date(now.getTime() + 36 * 60 * 60 * 1000),
        tags: ['chinese', 'family', 'dinner'],
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        id: 'deal-6',
        title: 'Free Appetizer with Entree',
        description: 'Choose any appetizer free when you order an entree',
        cuisine: 'American',
        vendor: 'Grill House',
        discount: 25,
        expiresAt: new Date(now.getTime() + 8 * 60 * 60 * 1000),
        tags: ['appetizer', 'free', 'dinner'],
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
    ];
  }

  getDeals(): Deal[] {
    return this.deals;
  }

  addDeal(deal: Deal): Deal {
    this.deals.push(deal);
    return deal;
  }

  getUserPreferences(userId: string): UserPreferences | undefined {
    return this.preferences.get(userId);
  }

  setUserPreferences(prefs: UserPreferences): void {
    this.preferences.set(prefs.userId, prefs);
  }

  getSavedSearches(userId: string): SavedSearch[] {
    return this.savedSearches.get(userId) || [];
  }

  addSavedSearch(search: SavedSearch): SavedSearch {
    const userSearches = this.savedSearches.get(search.userId) || [];
    userSearches.push(search);
    this.savedSearches.set(search.userId, userSearches);
    return search;
  }

  deleteSavedSearch(userId: string, searchId: string): boolean {
    const userSearches = this.savedSearches.get(userId);
    if (!userSearches) return false;
    const filtered = userSearches.filter((s) => s.id !== searchId);
    this.savedSearches.set(userId, filtered);
    return filtered.length < userSearches.length;
  }
}

export const dataStore = new DataStore();
