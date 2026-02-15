/**
 * ARS ANGEL
 * Autonomous AI Agent for Arc Ecosystem
 *
 * Token: $ANGEL
 * Contract: xxxxxxxxxxxxxxxx
 *
 * @version 1.0.0
 * @release 15/02/2026
 * @license MIT
 */

export { ArsAngel } from './agent';
export { MCPClient, MCPInvocationError, type MCPClientConfig } from './mcp-client';
export { ServiceRegistry, ServiceNotFoundError } from './service-registry';
export { ApprovalManager } from './approval';
export { SettlementManager } from './settlement';
export * from './types';

/**
 * Create default agent configuration
 */
export function createDefaultConfig(options: {
  wallet: string;
  tokenContract?: string;
}) {
  return {
    name: 'ars-angel',
    version: '1.0.0',
    description: 'Arc ecosystem autonomous agent',
    mcpEndpoint: 'wss://mcp.arc.fun/v1',
    wallet: options.wallet,
    tokenContract: options.tokenContract ?? 'xxxxxxxxxxxxxxxx',
    approvalMode: 'threshold' as const,
    approvalThreshold: {
      maxTokenValue: 100,
      trustedServices: ['soul-graph'],
    },
    maxConcurrentTasks: 5,
  };
}

// Token info export
export { ANGEL_TOKEN } from './types';
