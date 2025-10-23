import { Deal, AlertSubscription, AlertHistory, SearchFilters } from './types';

export class NotificationService {
  private subscriptions: Map<string, AlertSubscription[]> = new Map();
  private alertHistory: AlertHistory[] = [];

  addSubscription(subscription: AlertSubscription): AlertSubscription {
    const userSubs = this.subscriptions.get(subscription.userId) || [];
    userSubs.push(subscription);
    this.subscriptions.set(subscription.userId, userSubs);
    return subscription;
  }

  getSubscriptions(userId: string): AlertSubscription[] {
    return this.subscriptions.get(userId) || [];
  }

  getActiveSubscriptions(userId: string): AlertSubscription[] {
    const subs = this.subscriptions.get(userId) || [];
    return subs.filter((s) => s.isActive);
  }

  getAllActiveSubscriptions(): AlertSubscription[] {
    const allSubs: AlertSubscription[] = [];
    this.subscriptions.forEach((subs) => {
      allSubs.push(...subs.filter((s) => s.isActive));
    });
    return allSubs;
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

  shouldAlertUser(
    subscription: AlertSubscription,
    deal: Deal,
    alertType: 'new-deal' | 'expiring-deal',
  ): boolean {
    if (!subscription.isActive) return false;

    if (alertType === 'new-deal' && !subscription.alertOnNewDeals) return false;
    if (alertType === 'expiring-deal' && !subscription.alertOnExpiring) return false;

    if (subscription.frequency !== 'instant') {
      const now = new Date();
      if (subscription.lastAlertAt) {
        const timeSinceLastAlert = now.getTime() - subscription.lastAlertAt.getTime();
        const hoursSinceLastAlert = timeSinceLastAlert / (1000 * 60 * 60);

        if (subscription.frequency === 'hourly' && hoursSinceLastAlert < 1) {
          return false;
        }
        if (subscription.frequency === 'daily' && hoursSinceLastAlert < 24) {
          return false;
        }
      }
    }

    if (!subscription.filters) return true;

    return this.dealMatchesFilters(deal, subscription.filters);
  }

  private dealMatchesFilters(deal: Deal, filters: SearchFilters): boolean {
    if (filters.text) {
      const searchText = filters.text.toLowerCase();
      const matchesText =
        deal.title.toLowerCase().includes(searchText) ||
        deal.description.toLowerCase().includes(searchText) ||
        deal.vendor.toLowerCase().includes(searchText);
      if (!matchesText) return false;
    }

    if (filters.tags && filters.tags.length > 0) {
      const matchesTags = filters.tags.some((tag) => deal.tags.includes(tag.toLowerCase()));
      if (!matchesTags) return false;
    }

    if (filters.cuisine && filters.cuisine.length > 0) {
      if (!filters.cuisine.includes(deal.cuisine)) return false;
    }

    if (filters.vendor && filters.vendor.length > 0) {
      if (!filters.vendor.includes(deal.vendor)) return false;
    }

    if (filters.minDiscount !== undefined && deal.discount < filters.minDiscount) {
      return false;
    }

    if (filters.maxDiscount !== undefined && deal.discount > filters.maxDiscount) {
      return false;
    }

    if (filters.expiresAfter && deal.expiresAt < filters.expiresAfter) {
      return false;
    }

    if (filters.expiresBefore && deal.expiresAt > filters.expiresBefore) {
      return false;
    }

    return true;
  }

  checkExpiringDeals(deals: Deal[], thresholdHours: number = 2): Deal[] {
    const now = new Date();
    const threshold = new Date(now.getTime() + thresholdHours * 60 * 60 * 1000);

    return deals.filter((deal) => {
      const isExpiring = deal.expiresAt <= threshold && deal.expiresAt > now;
      return isExpiring;
    });
  }

  updateLastAlertTime(userId: string, subscriptionId: string): void {
    const userSubs = this.subscriptions.get(userId);
    if (!userSubs) return;

    const sub = userSubs.find((s) => s.id === subscriptionId);
    if (sub) {
      sub.lastAlertAt = new Date();
    }
  }
}

export const notificationService = new NotificationService();
