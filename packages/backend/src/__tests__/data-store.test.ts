import { DataStore } from '../data-store';
import { Deal, UserPreferences, SavedSearch, AlertSubscription } from '../types';

describe('DataStore', () => {
  let dataStore: DataStore;

  beforeEach(() => {
    dataStore = new DataStore();
  });

  describe('deals', () => {
    it('should have initial seed deals', () => {
      const deals = dataStore.getDeals();
      expect(deals.length).toBeGreaterThan(0);
    });

    it('should add a new deal', () => {
      const initialCount = dataStore.getDeals().length;
      const newDeal: Deal = {
        id: 'test-deal-1',
        title: 'Test Deal',
        description: 'Test Description',
        cuisine: 'Test Cuisine',
        vendor: 'Test Vendor',
        discount: 25,
        expiresAt: new Date('2025-12-31'),
        tags: ['test'],
        createdAt: new Date(),
      };

      const added = dataStore.addDeal(newDeal);
      expect(added).toEqual(newDeal);
      expect(dataStore.getDeals().length).toBe(initialCount + 1);
    });
  });

  describe('user preferences', () => {
    it('should return undefined for non-existent user', () => {
      const prefs = dataStore.getUserPreferences('non-existent-user');
      expect(prefs).toBeUndefined();
    });

    it('should set and get user preferences', () => {
      const preferences: UserPreferences = {
        userId: 'test-user',
        notificationsEnabled: true,
        preferredCuisines: ['Japanese', 'Italian'],
        minDiscountThreshold: 20,
        alertChannels: {
          email: true,
          push: false,
          inApp: true,
        },
      };

      dataStore.setUserPreferences(preferences);
      const retrieved = dataStore.getUserPreferences('test-user');
      expect(retrieved).toEqual(preferences);
    });

    it('should update existing user preferences', () => {
      const preferences: UserPreferences = {
        userId: 'test-user',
        notificationsEnabled: true,
        preferredCuisines: ['Japanese'],
        minDiscountThreshold: 20,
        alertChannels: {
          email: true,
          push: false,
          inApp: true,
        },
      };

      dataStore.setUserPreferences(preferences);

      const updated: UserPreferences = {
        ...preferences,
        minDiscountThreshold: 30,
      };

      dataStore.setUserPreferences(updated);
      const retrieved = dataStore.getUserPreferences('test-user');
      expect(retrieved?.minDiscountThreshold).toBe(30);
    });
  });

  describe('saved searches', () => {
    it('should return empty array for user with no saved searches', () => {
      const searches = dataStore.getSavedSearches('non-existent-user');
      expect(searches).toEqual([]);
    });

    it('should add and retrieve saved search', () => {
      const search: SavedSearch = {
        id: 'search-1',
        userId: 'test-user',
        name: 'My Search',
        filters: {
          cuisine: ['Japanese'],
          minDiscount: 20,
        },
        notifyOnNewMatches: true,
        createdAt: new Date(),
      };

      const added = dataStore.addSavedSearch(search);
      expect(added).toEqual(search);

      const searches = dataStore.getSavedSearches('test-user');
      expect(searches).toHaveLength(1);
      expect(searches[0]).toEqual(search);
    });

    it('should delete saved search', () => {
      const search: SavedSearch = {
        id: 'search-1',
        userId: 'test-user',
        name: 'My Search',
        filters: {},
        notifyOnNewMatches: false,
        createdAt: new Date(),
      };

      dataStore.addSavedSearch(search);
      expect(dataStore.getSavedSearches('test-user')).toHaveLength(1);

      const deleted = dataStore.deleteSavedSearch('test-user', 'search-1');
      expect(deleted).toBe(true);
      expect(dataStore.getSavedSearches('test-user')).toHaveLength(0);
    });

    it('should return false when deleting non-existent search', () => {
      const deleted = dataStore.deleteSavedSearch('test-user', 'non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('subscriptions', () => {
    it('should add and retrieve subscription', () => {
      const subscription: AlertSubscription = {
        id: 'sub-1',
        userId: 'test-user',
        filters: {
          cuisine: ['Japanese'],
        },
        frequency: 'instant',
        isActive: true,
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 24,
        createdAt: new Date(),
      };

      const added = dataStore.addSubscription(subscription);
      expect(added).toEqual(subscription);

      const subscriptions = dataStore.getSubscriptions('test-user');
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0]).toEqual(subscription);
    });

    it('should update subscription', () => {
      const subscription: AlertSubscription = {
        id: 'sub-1',
        userId: 'test-user',
        filters: {},
        frequency: 'instant',
        isActive: true,
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 24,
        createdAt: new Date(),
      };

      dataStore.addSubscription(subscription);

      const updated = dataStore.updateSubscription('test-user', 'sub-1', {
        isActive: false,
      });

      expect(updated?.isActive).toBe(false);
      expect(updated?.frequency).toBe('instant');
    });

    it('should delete subscription', () => {
      const subscription: AlertSubscription = {
        id: 'sub-1',
        userId: 'test-user',
        filters: {},
        frequency: 'instant',
        isActive: true,
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 24,
        createdAt: new Date(),
      };

      dataStore.addSubscription(subscription);
      expect(dataStore.getSubscriptions('test-user')).toHaveLength(1);

      const deleted = dataStore.deleteSubscription('test-user', 'sub-1');
      expect(deleted).toBe(true);
      expect(dataStore.getSubscriptions('test-user')).toHaveLength(0);
    });

    it('should get all subscriptions across users', () => {
      const sub1: AlertSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        filters: {},
        frequency: 'instant',
        isActive: true,
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 24,
        createdAt: new Date(),
      };

      const sub2: AlertSubscription = {
        id: 'sub-2',
        userId: 'user-2',
        filters: {},
        frequency: 'instant',
        isActive: true,
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 24,
        createdAt: new Date(),
      };

      dataStore.addSubscription(sub1);
      dataStore.addSubscription(sub2);

      const allSubs = dataStore.getAllSubscriptions();
      expect(allSubs).toHaveLength(2);
    });
  });

  describe('alert history', () => {
    it('should add and retrieve alert', () => {
      const alert = {
        id: 'alert-1',
        userId: 'test-user',
        dealId: 'deal-1',
        alertType: 'new-deal' as const,
        message: 'New deal available',
        createdAt: new Date(),
        read: false,
        deliveredVia: ['in-app'],
      };

      const added = dataStore.addAlertHistory(alert);
      expect(added).toEqual(alert);

      const alerts = dataStore.getAlertHistory('test-user');
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toEqual(alert);
    });

    it('should mark alert as read', () => {
      const alert = {
        id: 'alert-1',
        userId: 'test-user',
        dealId: 'deal-1',
        alertType: 'new-deal' as const,
        message: 'New deal available',
        createdAt: new Date(),
        read: false,
        deliveredVia: ['in-app'],
      };

      dataStore.addAlertHistory(alert);

      const marked = dataStore.markAlertAsRead('test-user', 'alert-1');
      expect(marked).toBe(true);

      const alerts = dataStore.getAlertHistory('test-user');
      expect(alerts[0].read).toBe(true);
    });

    it('should mark all alerts as read', () => {
      const alert1 = {
        id: 'alert-1',
        userId: 'test-user',
        dealId: 'deal-1',
        alertType: 'new-deal' as const,
        message: 'New deal 1',
        createdAt: new Date(),
        read: false,
        deliveredVia: ['in-app'],
      };

      const alert2 = {
        id: 'alert-2',
        userId: 'test-user',
        dealId: 'deal-2',
        alertType: 'new-deal' as const,
        message: 'New deal 2',
        createdAt: new Date(),
        read: false,
        deliveredVia: ['in-app'],
      };

      dataStore.addAlertHistory(alert1);
      dataStore.addAlertHistory(alert2);

      const count = dataStore.markAllAlertsAsRead('test-user');
      expect(count).toBe(2);

      const unreadCount = dataStore.getUnreadAlertCount('test-user');
      expect(unreadCount).toBe(0);
    });

    it('should get unread alert count', () => {
      const alert1 = {
        id: 'alert-1',
        userId: 'test-user',
        dealId: 'deal-1',
        alertType: 'new-deal' as const,
        message: 'New deal 1',
        createdAt: new Date(),
        read: false,
        deliveredVia: ['in-app'],
      };

      const alert2 = {
        id: 'alert-2',
        userId: 'test-user',
        dealId: 'deal-2',
        alertType: 'new-deal' as const,
        message: 'New deal 2',
        createdAt: new Date(),
        read: true,
        deliveredVia: ['in-app'],
      };

      dataStore.addAlertHistory(alert1);
      dataStore.addAlertHistory(alert2);

      const unreadCount = dataStore.getUnreadAlertCount('test-user');
      expect(unreadCount).toBe(1);
    });

    it('should limit alert history when limit provided', () => {
      for (let i = 0; i < 10; i++) {
        dataStore.addAlertHistory({
          id: `alert-${i}`,
          userId: 'test-user',
          dealId: 'deal-1',
          alertType: 'new-deal',
          message: `Alert ${i}`,
          createdAt: new Date(),
          read: false,
          deliveredVia: ['in-app'],
        });
      }

      const alerts = dataStore.getAlertHistory('test-user', 5);
      expect(alerts).toHaveLength(5);
    });
  });
});
