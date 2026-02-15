/**
 * ARS ANGEL - Service Registry
 * v1.0.0 Production Release
 * 15/02/2026 - Token Launch
 *
 * Ryzome marketplace integration with $ANGEL pricing
 */

import { ServiceDefinition } from './types';
import { MCPClient } from './mcp-client';

export class ServiceRegistry {
  private services: Map<string, ServiceDefinition> = new Map();
  private mcpClient: MCPClient;
  private lastRefresh = 0;
  private refreshInterval = 60000;

  constructor(mcpClient: MCPClient) {
    this.mcpClient = mcpClient;
  }

  async initialize(): Promise<void> {
    await this.refreshServices();
  }

  async discover(capabilities: string[]): Promise<ServiceDefinition[]> {
    if (this.shouldRefresh()) {
      await this.refreshServices();
    }

    const matches: ServiceDefinition[] = [];
    for (const service of this.services.values()) {
      if (capabilities.some((c) => service.capabilities.includes(c))) {
        matches.push(service);
      }
    }

    return matches.sort((a, b) => b.trustScore - a.trustScore);
  }

  async invoke<T = unknown>(
    serviceId: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<{ result: T; cost: number }> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new ServiceNotFoundError(serviceId);
    }

    const result = await this.mcpClient.invoke<T>(`${service.endpoint}/${action}`, params);

    return { result, cost: service.pricing.perCall };
  }

  getService(id: string): ServiceDefinition | undefined {
    return this.services.get(id);
  }

  listServices(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }

  private async refreshServices(): Promise<void> {
    const services = await this.fetchFromRyzome();
    this.services.clear();
    for (const service of services) {
      this.services.set(service.id, service);
    }
    this.lastRefresh = Date.now();
  }

  private async fetchFromRyzome(): Promise<ServiceDefinition[]> {
    // Production: this.mcpClient.invoke('ryzome.registry.list', {})
    return [
      {
        id: 'soul-graph',
        name: 'Soul Graph',
        endpoint: 'mcp://soul-graph.arc.fun',
        capabilities: ['memory', 'personality', 'context'],
        trustScore: 0.95,
        pricing: { perCall: 0.001, currency: '$ANGEL' },
      },
      {
        id: 'listen-defi',
        name: 'Listen DeFi',
        endpoint: 'mcp://listen.arc.fun',
        capabilities: ['swap', 'stake', 'portfolio', 'analytics'],
        trustScore: 0.92,
        pricing: { perCall: 0.005, currency: '$ANGEL' },
      },
    ];
  }

  private shouldRefresh(): boolean {
    return Date.now() - this.lastRefresh > this.refreshInterval;
  }
}

export class ServiceNotFoundError extends Error {
  constructor(serviceId: string) {
    super(`Service not found: ${serviceId}`);
    this.name = 'ServiceNotFoundError';
  }
}
