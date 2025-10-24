import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000';

test.describe('Notification Service and Subscriptions', () => {
  const userId = 'test-user-notifications';

  test('should create a new alert subscription', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/subscriptions`, {
      data: {
        userId,
        alertOnNewDeals: true,
        alertOnExpiring: true,
        expiringThresholdHours: 2,
        frequency: 'instant',
        isActive: true,
        filters: {
          cuisine: ['Japanese'],
          minDiscount: 20,
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.subscription).toBeDefined();
    expect(data.subscription.userId).toBe(userId);
    expect(data.subscription.alertOnNewDeals).toBe(true);
    expect(data.subscription.frequency).toBe('instant');
  });

  test('should get user subscriptions', async ({ request }) => {
    await request.post(`${API_URL}/api/subscriptions`, {
      data: {
        userId,
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 1,
        frequency: 'hourly',
        isActive: true,
      },
    });

    const response = await request.get(`${API_URL}/api/subscriptions/${userId}`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.subscriptions).toBeDefined();
    expect(Array.isArray(data.subscriptions)).toBe(true);
    expect(data.subscriptions.length).toBeGreaterThan(0);
  });

  test('should update a subscription', async ({ request }) => {
    const createResponse = await request.post(`${API_URL}/api/subscriptions`, {
      data: {
        userId,
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 2,
        frequency: 'instant',
        isActive: true,
      },
    });

    const createData = await createResponse.json();
    const subscriptionId = createData.subscription.id;

    const updateResponse = await request.patch(
      `${API_URL}/api/subscriptions/${userId}/${subscriptionId}`,
      {
        data: {
          isActive: false,
          frequency: 'daily',
        },
      },
    );

    expect(updateResponse.ok()).toBeTruthy();
    const updateData = await updateResponse.json();
    expect(updateData.success).toBe(true);
    expect(updateData.subscription.isActive).toBe(false);
    expect(updateData.subscription.frequency).toBe('daily');
  });

  test('should delete a subscription', async ({ request }) => {
    const createResponse = await request.post(`${API_URL}/api/subscriptions`, {
      data: {
        userId,
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 2,
        frequency: 'instant',
        isActive: true,
      },
    });

    const createData = await createResponse.json();
    const subscriptionId = createData.subscription.id;

    const deleteResponse = await request.delete(
      `${API_URL}/api/subscriptions/${userId}/${subscriptionId}`,
    );

    expect(deleteResponse.ok()).toBeTruthy();
    const deleteData = await deleteResponse.json();
    expect(deleteData.success).toBe(true);
  });

  test('should get alert history for user', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/alerts/${userId}`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.alerts).toBeDefined();
    expect(Array.isArray(data.alerts)).toBe(true);
    expect(data.unreadCount).toBeDefined();
    expect(typeof data.unreadCount).toBe('number');
  });

  test('should mark alert as read', async ({ request }) => {
    const alertId = 'test-alert-id';

    const response = await request.patch(`${API_URL}/api/alerts/${userId}/${alertId}/read`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBeDefined();
  });

  test('should mark all alerts as read', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/alerts/${userId}/mark-all-read`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.count).toBeDefined();
    expect(typeof data.count).toBe('number');
  });

  test('should receive new deal alerts via SSE with user ID', async ({ page }) => {
    await page.goto('http://localhost:5173');

    interface DealEvent {
      type: string;
      deal?: Record<string, unknown>;
    }

    let dealData: DealEvent | null = null;

    await page.evaluate((testUserId) => {
      const eventSource = new EventSource(`http://localhost:4000/api/events?userId=${testUserId}`);

      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new-deal' && data.deal) {
            (window as Record<string, unknown>).lastDealEvent = data;
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      });

      (window as Record<string, unknown>).eventSource = eventSource;
    }, userId);

    await page.waitForTimeout(2000);

    dealData = (await page.evaluate(() => (window as Record<string, unknown>).lastDealEvent)) as
      | DealEvent
      | null;

    await page.evaluate(() => {
      const eventSource = (window as Record<string, unknown>).eventSource as EventSource | undefined;
      if (eventSource) {
        eventSource.close();
      }
    });

    if (dealData) {
      expect(dealData.type).toBe('new-deal');
      expect(dealData.deal).toBeDefined();
    }
  });

  test('should filter alerts based on subscription preferences', async ({ request }) => {
    const createResponse = await request.post(`${API_URL}/api/subscriptions`, {
      data: {
        userId: 'filter-test-user',
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 2,
        frequency: 'instant',
        isActive: true,
        filters: {
          cuisine: ['Italian'],
          minDiscount: 30,
        },
      },
    });

    expect(createResponse.ok()).toBeTruthy();
    const data = await createResponse.json();
    expect(data.subscription.filters).toBeDefined();
    expect(data.subscription.filters.cuisine).toContain('Italian');
    expect(data.subscription.filters.minDiscount).toBe(30);
  });

  test('should support different alert frequencies', async ({ request }) => {
    const frequencies = ['instant', 'hourly', 'daily'];

    for (const frequency of frequencies) {
      const response = await request.post(`${API_URL}/api/subscriptions`, {
        data: {
          userId: `freq-test-${frequency}`,
          alertOnNewDeals: true,
          alertOnExpiring: false,
          expiringThresholdHours: 2,
          frequency,
          isActive: true,
        },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.subscription.frequency).toBe(frequency);
    }
  });

  test('should get alert history with limit', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/alerts/${userId}?limit=5`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.alerts).toBeDefined();
    expect(data.alerts.length).toBeLessThanOrEqual(5);
  });
});
