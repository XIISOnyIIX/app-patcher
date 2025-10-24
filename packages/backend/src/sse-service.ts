import { Response } from 'express';

import { Deal, NotificationEvent, AlertHistory } from './types';

interface ClientConnection {
  response: Response;
  userId?: string;
}

export class SSEService {
  private clients: Map<Response, ClientConnection> = new Map();

  addClient(res: Response, userId?: string): void {
    this.clients.set(res, { response: res, userId });
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  removeClient(res: Response): void {
    this.clients.delete(res);
  }

  broadcastNewDeal(deal: Deal, targetUserId?: string): void {
    const event: NotificationEvent = { type: 'new-deal', deal };
    this.broadcast(event, targetUserId);
  }

  broadcastDealExpiring(deal: Deal, targetUserId?: string): void {
    const event: NotificationEvent = { type: 'deal-expiring', deal };
    this.broadcast(event, targetUserId);
  }

  broadcastAlertHistory(alert: AlertHistory): void {
    const event: NotificationEvent = { type: 'alert-history', alert };
    this.broadcast(event, alert.userId);
  }

  broadcastMessage(message: string, targetUserId?: string): void {
    const event: NotificationEvent = { type: 'new-deal', message };
    this.broadcast(event, targetUserId);
  }

  private broadcast(event: NotificationEvent, targetUserId?: string): void {
    const data = JSON.stringify(event);
    this.clients.forEach((connection, client) => {
      if (!targetUserId || connection.userId === targetUserId) {
        try {
          client.write(`data: ${data}\n\n`);
        } catch (error) {
          console.error('Error broadcasting to client:', error);
          this.clients.delete(client);
        }
      }
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getConnectedUsers(): string[] {
    const users = new Set<string>();
    this.clients.forEach((connection) => {
      if (connection.userId) {
        users.add(connection.userId);
      }
    });
    return Array.from(users);
  }
}

export const sseService = new SSEService();
