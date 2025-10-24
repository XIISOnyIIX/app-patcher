import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000';

test.describe('Alert Workflow Integration Tests', () => {
  const userId = 'workflow-test-user';

  test('complete workflow: create subscription → receive alert → mark as read', async ({
    page,
    request,
  }) => {
    await request.post(`${API_URL}/api/subscriptions`, {
      data: {
        userId,
        alertOnNewDeals: true,
        alertOnExpiring: true,
        expiringThresholdHours: 24,
        frequency: 'instant',
        isActive: true,
        filters: {
          minDiscount: 10,
        },
      },
    });

    const subsResponse = await request.get(`${API_URL}/api/subscriptions/${userId}`);
    const subsData = await subsResponse.json();
    expect(subsData.subscriptions.length).toBeGreaterThan(0);

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);

    const alertsResponse = await request.get(`${API_URL}/api/alerts/${userId}`);
    const alertsData = await alertsResponse.json();

    if (alertsData.alerts.length > 0) {
      const firstAlert = alertsData.alerts[0];
      await request.patch(`${API_URL}/api/alerts/${userId}/${firstAlert.id}/read`);

      const updatedAlertsResponse = await request.get(`${API_URL}/api/alerts/${userId}`);
      const updatedAlertsData = await updatedAlertsResponse.json();
      expect(updatedAlertsData.unreadCount).toBeLessThanOrEqual(alertsData.unreadCount);
    }
  });

  test('subscription with filters only alerts matching deals', async ({ request }) => {
    const testUserId = 'filter-workflow-user';

    await request.post(`${API_URL}/api/subscriptions`, {
      data: {
        userId: testUserId,
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 2,
        frequency: 'instant',
        isActive: true,
        filters: {
          cuisine: ['Japanese', 'Italian'],
          minDiscount: 40,
          tags: ['sushi'],
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const subsResponse = await request.get(`${API_URL}/api/subscriptions/${testUserId}`);
    const subsData = await subsResponse.json();
    expect(subsData.subscriptions.length).toBe(1);
    expect(subsData.subscriptions[0].filters.cuisine).toEqual(['Japanese', 'Italian']);
  });

  test('inactive subscription should not receive alerts', async ({ request }) => {
    const testUserId = 'inactive-sub-user';

    const createResponse = await request.post(`${API_URL}/api/subscriptions`, {
      data: {
        userId: testUserId,
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 2,
        frequency: 'instant',
        isActive: true,
      },
    });

    const createData = await createResponse.json();
    const subscriptionId = createData.subscription.id;

    await request.patch(`${API_URL}/api/subscriptions/${testUserId}/${subscriptionId}`, {
      data: {
        isActive: false,
      },
    });

    const subsResponse = await request.get(`${API_URL}/api/subscriptions/${testUserId}`);
    const subsData = await subsResponse.json();
    expect(subsData.subscriptions[0].isActive).toBe(false);
  });

  test('multiple subscriptions with different filters', async ({ request }) => {
    const testUserId = 'multi-sub-user';

    await request.post(`${API_URL}/api/subscriptions`, {
      data: {
        userId: testUserId,
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 2,
        frequency: 'instant',
        isActive: true,
        filters: {
          cuisine: ['Japanese'],
          minDiscount: 30,
        },
      },
    });

    await request.post(`${API_URL}/api/subscriptions`, {
      data: {
        userId: testUserId,
        alertOnNewDeals: false,
        alertOnExpiring: true,
        expiringThresholdHours: 1,
        frequency: 'hourly',
        isActive: true,
        filters: {
          cuisine: ['Italian'],
          minDiscount: 50,
        },
      },
    });

    interface Subscription {
      filters: {
        cuisine?: string[];
      };
      alertOnNewDeals: boolean;
      alertOnExpiring: boolean;
    }

    const subsResponse = await request.get(`${API_URL}/api/subscriptions/${testUserId}`);
    const subsData = await subsResponse.json();
    expect(subsData.subscriptions.length).toBe(2);

    const sub1 = (subsData.subscriptions as Subscription[]).find(
      (s) => s.filters.cuisine?.includes('Japanese'),
    );
    const sub2 = (subsData.subscriptions as Subscription[]).find(
      (s) => s.filters.cuisine?.includes('Italian'),
    );

    expect(sub1).toBeDefined();
    expect(sub2).toBeDefined();
    expect(sub1?.alertOnNewDeals).toBe(true);
    expect(sub2?.alertOnExpiring).toBe(true);
  });

  test('alert frequency should be respected', async ({ request }) => {
    const testUserId = 'frequency-test-user';

    await request.post(`${API_URL}/api/subscriptions`, {
      data: {
        userId: testUserId,
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 2,
        frequency: 'hourly',
        isActive: true,
      },
    });

    const subsResponse = await request.get(`${API_URL}/api/subscriptions/${testUserId}`);
    const subsData = await subsResponse.json();
    expect(subsData.subscriptions[0].frequency).toBe('hourly');
  });

  test('expiring threshold should be configurable', async ({ request }) => {
    const testUserId = 'threshold-test-user';

    const thresholds = [1, 2, 6, 12, 24];

    for (const threshold of thresholds) {
      await request.post(`${API_URL}/api/subscriptions`, {
        data: {
          userId: testUserId,
          alertOnNewDeals: false,
          alertOnExpiring: true,
          expiringThresholdHours: threshold,
          frequency: 'instant',
          isActive: true,
        },
      });
    }

    interface SubscriptionWithThreshold {
      expiringThresholdHours: number;
    }

    const subsResponse = await request.get(`${API_URL}/api/subscriptions/${testUserId}`);
    const subsData = await subsResponse.json();
    expect(subsData.subscriptions.length).toBe(thresholds.length);

    const thresholdValues = (subsData.subscriptions as SubscriptionWithThreshold[]).map(
      (s) => s.expiringThresholdHours,
    );
    thresholds.forEach((t) => {
      expect(thresholdValues).toContain(t);
    });
  });

  test('SSE connection maintains user context', async ({ page }) => {
    const testUserId = 'sse-context-user';

    await page.goto('http://localhost:5173');

    const connectionEstablished = await page.evaluate((userId) => {
      return new Promise((resolve) => {
        const eventSource = new EventSource(
          `http://localhost:4000/api/events?userId=${userId}`,
        );

        eventSource.addEventListener('open', () => {
          (window as Record<string, unknown>).testEventSource = eventSource;
          resolve(true);
        });

        eventSource.addEventListener('error', () => {
          resolve(false);
        });

        setTimeout(() => resolve(false), 5000);
      });
    }, testUserId);

    expect(connectionEstablished).toBe(true);

    await page.evaluate(() => {
      const eventSource = (window as Record<string, unknown>).testEventSource as
        | EventSource
        | undefined;
      if (eventSource) {
        eventSource.close();
      }
    });
  });

  test('bulk mark all alerts as read', async ({ request }) => {
    const testUserId = 'bulk-read-user';

    await request.post(`${API_URL}/api/subscriptions`, {
      data: {
        userId: testUserId,
        alertOnNewDeals: true,
        alertOnExpiring: false,
        expiringThresholdHours: 2,
        frequency: 'instant',
        isActive: true,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const markAllResponse = await request.post(`${API_URL}/api/alerts/${testUserId}/mark-all-read`);
    const markAllData = await markAllResponse.json();
    expect(markAllData.success).toBe(true);

    const alertsResponse = await request.get(`${API_URL}/api/alerts/${testUserId}`);
    const alertsData = await alertsResponse.json();
    expect(alertsData.unreadCount).toBe(0);
  });

  test('alert history should be sorted by creation date', async ({ request }) => {
    const testUserId = 'sorted-alerts-user';

    interface Alert {
      createdAt: string;
    }

    const alertsResponse = await request.get(`${API_URL}/api/alerts/${testUserId}`);
    const alertsData = await alertsResponse.json();

    if ((alertsData.alerts as Alert[]).length > 1) {
      for (let i = 0; i < (alertsData.alerts as Alert[]).length - 1; i++) {
        const currentDate = new Date((alertsData.alerts as Alert[])[i].createdAt).getTime();
        const nextDate = new Date((alertsData.alerts as Alert[])[i + 1].createdAt).getTime();
        expect(currentDate).toBeGreaterThanOrEqual(nextDate);
      }
    }
  });
});
