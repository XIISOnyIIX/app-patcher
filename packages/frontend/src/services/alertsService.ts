import type { Alert, ApiResponse } from '../types';
import { api } from './api';

export const alertsService = {
  async getAlerts(): Promise<Alert[]> {
    const response = await api.get<ApiResponse<Alert[]>>('/api/alerts');
    return response.data;
  },

  async markAsRead(alertId: string): Promise<void> {
    await api.put<ApiResponse<void>>(`/api/alerts/${alertId}/read`, {});
  },

  async markAllAsRead(): Promise<void> {
    await api.put<ApiResponse<void>>('/api/alerts/read-all', {});
  },

  async deleteAlert(alertId: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/api/alerts/${alertId}`);
  },
};
