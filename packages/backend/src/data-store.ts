import { Deal, UserPreferences, SavedSearch, AlertSubscription, AlertHistory } from './types';

export class DataStore {
  private deals: Deal[] = [];
  private preferences: Map<string, UserPreferences> = new Map();
  private savedSearches: Map<string, SavedSearch[]> = new Map();
  private subscriptions: Map<string, AlertSubscription[]> = new Map();
  private alertHistory: AlertHistory[] = [];

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

  getSubscriptions(userId: string): AlertSubscription[] {
    return this.subscriptions.get(userId) || [];
  }

  addSubscription(subscription: AlertSubscription): AlertSubscription {
    const userSubs = this.subscriptions.get(subscription.userId) || [];
    userSubs.push(subscription);
    this.subscriptions.set(subscription.userId, userSubs);
    return subscription;
  }

  updateSubscription(
    userId: string,
    subscriptionId: string,
    updates: Partial<AlertSubscription>,
  ): AlertSubscription | null {
    const userSubs = this.subscriptions.get(userId);
    if (!userSubs) return null;

    const subIndex = userSubs.findIndex((s) => s.id === subscriptionId);
    if (subIndex === -1) return null;

    userSubs[subIndex] = { ...userSubs[subIndex], ...updates };
    return userSubs[subIndex];
  }

  deleteSubscription(userId: string, subscriptionId: string): boolean {
    const userSubs = this.subscriptions.get(userId);
    if (!userSubs) return false;

    const filtered = userSubs.filter((s) => s.id !== subscriptionId);
    this.subscriptions.set(userId, filtered);
    return filtered.length < userSubs.length;
  }

  getAllSubscriptions(): AlertSubscription[] {
    const allSubs: AlertSubscription[] = [];
    this.subscriptions.forEach((subs) => {
      allSubs.push(...subs);
    });
    return allSubs;
  }

  addAlertHistory(alert: AlertHistory): AlertHistory {
    this.alertHistory.push(alert);
    return alert;
  }

  getAlertHistory(userId: string, limit?: number): AlertHistory[] {
    const userAlerts = this.alertHistory
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return limit ? userAlerts.slice(0, limit) : userAlerts;
  }

  markAlertAsRead(userId: string, alertId: string): boolean {
    const alert = this.alertHistory.find((a) => a.id === alertId && a.userId === userId);
    if (!alert) return false;

    alert.read = true;
    return true;
  }

  markAllAlertsAsRead(userId: string): number {
    let count = 0;
    this.alertHistory.forEach((alert) => {
      if (alert.userId === userId && !alert.read) {
        alert.read = true;
        count++;
      }
    });
    return count;
  }

  getUnreadAlertCount(userId: string): number {
    return this.alertHistory.filter((a) => a.userId === userId && !a.read).length;
  }
}

export const dataStore = new DataStore();
