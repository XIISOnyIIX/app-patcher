import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response } from 'express';

import { dataStore } from './data-store';
import { dealService } from './deal-service';
import { sseService } from './sse-service';
import { SearchFilters, SortOptions, UserPreferences, SavedSearch, Deal } from './types';

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

  sseService.addClient(res);

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
    dataStore.addDeal(randomDeal);
    sseService.broadcastNewDeal(randomDeal);
  }
}, 30000);

app.listen(port, () => {
  console.log(`✅ FoodDealSniper API listening on http://localhost:${port}`);
});
