import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response } from 'express';

import { dataStore } from './data-store';
import { dealService } from './deal-service';
import { notificationService } from './notification-service';
import { sseService } from './sse-service';
import {
  SearchFilters,
  SortOptions,
  UserPreferences,
  SavedSearch,
  Deal,
  AlertSubscription,
} from './types';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({ message: 'FoodDealSniper API is online' });
});

app.get('/api/deals', (req: Request, res: Response) => {
  const filters: SearchFilters = {};

  if (req.query.text) filters.text = req.query.text as string;
  if (req.query.tags) {
    filters.tags = Array.isArray(req.query.tags)
      ? (req.query.tags as string[])
      : [req.query.tags as string];
  }
  if (req.query.cuisine) {
    filters.cuisine = Array.isArray(req.query.cuisine)
      ? (req.query.cuisine as string[])
      : [req.query.cuisine as string];
  }
  if (req.query.vendor) {
    filters.vendor = Array.isArray(req.query.vendor)
      ? (req.query.vendor as string[])
      : [req.query.vendor as string];
  }
  if (req.query.minDiscount) filters.minDiscount = Number(req.query.minDiscount);
  if (req.query.maxDiscount) filters.maxDiscount = Number(req.query.maxDiscount);
  if (req.query.expiresAfter) filters.expiresAfter = new Date(req.query.expiresAfter as string);
  if (req.query.expiresBefore) filters.expiresBefore = new Date(req.query.expiresBefore as string);

  let sort: SortOptions | undefined;
  if (req.query.sortField && req.query.sortOrder) {
    sort = {
      field: req.query.sortField as SortOptions['field'],
      order: req.query.sortOrder as SortOptions['order'],
    };
  }

  const deals = dealService.searchAndFilter(filters, sort);
  res.json({ deals, total: deals.length });
});

app.get('/api/filters/cuisines', (_req, res) => {
  res.json({ cuisines: dealService.getAvailableCuisines() });
});

app.get('/api/filters/vendors', (_req, res) => {
  res.json({ vendors: dealService.getAvailableVendors() });
});

app.get('/api/filters/tags', (_req, res) => {
  res.json({ tags: dealService.getAvailableTags() });
});

app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const userId = req.query.userId as string | undefined;
  sseService.addClient(res, userId);

  res.write(
    `data: ${JSON.stringify({ type: 'connected', message: 'Connected to deal alerts' })}\n\n`,
  );
});

app.get('/api/preferences/:userId', (req: Request, res: Response) => {
  const prefs = dataStore.getUserPreferences(req.params.userId);
  if (!prefs) {
    const defaultPrefs: UserPreferences = {
      userId: req.params.userId,
      notificationsEnabled: true,
      preferredCuisines: [],
      minDiscountThreshold: 10,
      alertChannels: {
        email: false,
        push: false,
        inApp: true,
      },
    };
    return res.json(defaultPrefs);
  }
  res.json(prefs);
});

app.post('/api/preferences', (req: Request, res: Response) => {
  const prefs: UserPreferences = req.body;
  dataStore.setUserPreferences(prefs);
  res.json({ success: true, preferences: prefs });
});

app.get('/api/saved-searches/:userId', (req: Request, res: Response) => {
  const searches = dataStore.getSavedSearches(req.params.userId);
  res.json({ searches });
});

app.post('/api/saved-searches', (req: Request, res: Response) => {
  const search: SavedSearch = {
    ...req.body,
    id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  };
  const saved = dataStore.addSavedSearch(search);
  res.json({ success: true, search: saved });
});

app.delete('/api/saved-searches/:userId/:searchId', (req: Request, res: Response) => {
  const deleted = dataStore.deleteSavedSearch(req.params.userId, req.params.searchId);
  res.json({ success: deleted });
});

app.get('/api/subscriptions/:userId', (req: Request, res: Response) => {
  const subscriptions = dataStore.getSubscriptions(req.params.userId);
  res.json({ subscriptions });
});

app.post('/api/subscriptions', (req: Request, res: Response) => {
  const subscription: AlertSubscription = {
    ...req.body,
    id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  };
  const saved = dataStore.addSubscription(subscription);
  res.json({ success: true, subscription: saved });
});

app.patch('/api/subscriptions/:userId/:subscriptionId', (req: Request, res: Response) => {
  const updated = dataStore.updateSubscription(
    req.params.userId,
    req.params.subscriptionId,
    req.body,
  );
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Subscription not found' });
  }
  res.json({ success: true, subscription: updated });
});

app.delete('/api/subscriptions/:userId/:subscriptionId', (req: Request, res: Response) => {
  const deleted = dataStore.deleteSubscription(req.params.userId, req.params.subscriptionId);
  res.json({ success: deleted });
});

app.get('/api/alerts/:userId', (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const alerts = dataStore.getAlertHistory(req.params.userId, limit);
  const unreadCount = dataStore.getUnreadAlertCount(req.params.userId);
  res.json({ alerts, unreadCount });
});

app.patch('/api/alerts/:userId/:alertId/read', (req: Request, res: Response) => {
  const marked = dataStore.markAlertAsRead(req.params.userId, req.params.alertId);
  res.json({ success: marked });
});

app.post('/api/alerts/:userId/mark-all-read', (req: Request, res: Response) => {
  const count = dataStore.markAllAlertsAsRead(req.params.userId);
  res.json({ success: true, count });
});

function processNewDeal(deal: Deal): void {
  dataStore.addDeal(deal);

  const allSubscriptions = dataStore.getAllSubscriptions();
  allSubscriptions.forEach((subscription) => {
    if (notificationService.shouldAlertUser(subscription, deal, 'new-deal')) {
      const alert = dataStore.addAlertHistory({
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: subscription.userId,
        dealId: deal.id,
        alertType: 'new-deal',
        message: `New deal: ${deal.title} - ${deal.discount}% off`,
        createdAt: new Date(),
        read: false,
        deliveredVia: subscription.isActive ? ['in-app'] : [],
      });

      sseService.broadcastNewDeal(deal, subscription.userId);
      sseService.broadcastAlertHistory(alert);

      if (subscription.frequency === 'instant') {
        dataStore.updateSubscription(subscription.userId, subscription.id, {
          lastAlertAt: new Date(),
        });
      }
    }
  });
}

function checkExpiringDeals(): void {
  const deals = dataStore.getDeals();
  const allSubscriptions = dataStore.getAllSubscriptions();

  allSubscriptions.forEach((subscription) => {
    if (!subscription.alertOnExpiring || !subscription.isActive) return;

    const expiringDeals = notificationService.checkExpiringDeals(
      deals,
      subscription.expiringThresholdHours,
    );

    expiringDeals.forEach((deal) => {
      if (notificationService.shouldAlertUser(subscription, deal, 'expiring-deal')) {
        const existingAlert = dataStore
          .getAlertHistory(subscription.userId)
          .find((a) => a.dealId === deal.id && a.alertType === 'expiring-deal');

        if (!existingAlert) {
          const alert = dataStore.addAlertHistory({
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: subscription.userId,
            dealId: deal.id,
            alertType: 'expiring-deal',
            message: `Deal expiring soon: ${deal.title} - expires at ${deal.expiresAt.toLocaleString()}`,
            createdAt: new Date(),
            read: false,
            deliveredVia: ['in-app'],
          });

          sseService.broadcastDealExpiring(deal, subscription.userId);
          sseService.broadcastAlertHistory(alert);

          if (subscription.frequency === 'instant') {
            dataStore.updateSubscription(subscription.userId, subscription.id, {
              lastAlertAt: new Date(),
            });
          }
        }
      }
    });
  });
}

setInterval(() => {
  if (Math.random() > 0.7) {
    const now = new Date();
    const randomDeal: Deal = {
      id: `deal-${Date.now()}`,
      title: 'Flash Deal Alert!',
      description: 'Limited time offer just added',
      cuisine: ['Japanese', 'Italian', 'Mexican', 'Chinese'][Math.floor(Math.random() * 4)],
      vendor: 'Quick Bites',
      discount: Math.floor(Math.random() * 50) + 20,
      expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      tags: ['flash', 'limited'],
      createdAt: now,
    };
    processNewDeal(randomDeal);
  }
}, 30000);

setInterval(() => {
  checkExpiringDeals();
}, 5 * 60 * 1000);

app.listen(port, () => {
  console.log(`✅ FoodDealSniper API listening on http://localhost:${port}`);
});
