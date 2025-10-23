import { Response } from 'express';

import { Deal } from './types';

export class SSEService {
  private clients: Set<Response> = new Set();

  addClient(res: Response): void {
    this.clients.add(res);
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  broadcastNewDeal(deal: Deal): void {
    const data = JSON.stringify({ type: 'new-deal', deal });
    this.clients.forEach((client) => {
      client.write(`data: ${data}\n\n`);
    });
  }

  broadcastDealExpiring(deal: Deal): void {
    const data = JSON.stringify({ type: 'deal-expiring', deal });
    this.clients.forEach((client) => {
      client.write(`data: ${data}\n\n`);
    });
  }

  broadcastMessage(message: string): void {
    const data = JSON.stringify({ type: 'message', message });
    this.clients.forEach((client) => {
      client.write(`data: ${data}\n\n`);
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

export const sseService = new SSEService();
