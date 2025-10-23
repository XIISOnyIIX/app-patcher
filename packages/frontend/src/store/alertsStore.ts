import { create } from 'zustand';

import { alertsService } from '../services/alertsService';
import type { Alert } from '../types';

interface AlertsState {
  alerts: Alert[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchAlerts: () => Promise<void>;
  markAsRead: (alertId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
}

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await alertsService.getAlerts();
      const unreadCount = alerts.filter((alert) => !alert.read).length;
      set({ alerts, unreadCount, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch alerts',
        isLoading: false,
      });
    }
  },

  markAsRead: async (alertId) => {
    try {
      await alertsService.markAsRead(alertId);
      set((state) => ({
        alerts: state.alerts.map((alert) =>
          alert.id === alertId ? { ...alert, read: true } : alert,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark alert as read',
      });
    }
  },

  markAllAsRead: async () => {
    try {
      await alertsService.markAllAsRead();
      set((state) => ({
        alerts: state.alerts.map((alert) => ({ ...alert, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to mark all alerts as read',
      });
    }
  },

  deleteAlert: async (alertId) => {
    try {
      await alertsService.deleteAlert(alertId);
      set((state) => {
        const alertToDelete = state.alerts.find((alert) => alert.id === alertId);
        const wasUnread = alertToDelete && !alertToDelete.read;
        return {
          alerts: state.alerts.filter((alert) => alert.id !== alertId),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete alert',
      });
    }
  },
}));
