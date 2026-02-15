/**
 * ARS ANGEL - Types
 * v1.0.0 Production Release
 * 15/02/2026 - Token Launch
 */

// Token constants
export const ANGEL_TOKEN = {
  symbol: '$ANGEL',
  contract: 'xxxxxxxxxxxxxxxx',
  network: 'solana',
  decimals: 9,
} as const;

// Agent configuration
export interface AgentConfig {
  name: string;
  version: string;
  description?: string;
  mcpEndpoint: string;
  wallet: string;
  tokenContract: string;
  approvalMode: ApprovalMode;
  approvalThreshold?: ApprovalThreshold;
  maxConcurrentTasks?: number;
}

export type ApprovalMode = 'auto' | 'manual' | 'threshold';

export interface ApprovalThreshold {
  maxTokenValue: number;
  trustedServices: string[];
}

// Agent state
export type AgentState =
  | 'initializing'
  | 'idle'
  | 'planning'
  | 'executing'
  | 'awaiting_approval'
  | 'settling'
  | 'error';

// Task types
export interface Task {
  id: string;
  type: TaskType;
  payload: TaskPayload;
  status: TaskStatus;
  result?: TaskResult;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export type TaskType = 'query' | 'execute' | 'compose';
export type TaskStatus = 'pending' | 'planning' | 'awaiting_approval' | 'running' | 'settling' | 'completed' | 'failed';

export interface TaskPayload {
  action: string;
  data: Record<string, unknown>;
  services?: string[];
  maxCost?: number;
}

export interface TaskResult {
  success: boolean;
  data: unknown;
  servicesUsed: string[];
  settlement: TokenSettlement;
}

// MCP types
export interface MCPRequest {
  id: string;
  method: string;
  params: Record<string, unknown>;
  timestamp: number;
  signature?: string;
}

export interface MCPResponse {
  id: string;
  result?: unknown;
  error?: MCPError;
  timestamp: number;
}

export interface MCPError {
  code: number;
  message: string;
  data?: unknown;
}

export interface MCPConnection {
  endpoint: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
}

// Service types
export interface ServiceDefinition {
  id: string;
  name: string;
  endpoint: string;
  capabilities: string[];
  trustScore: number;
  pricing: ServicePricing;
}

export interface ServicePricing {
  perCall: number;
  currency: '$ANGEL';
}

// Approval types
export interface ApprovalRequest {
  taskId: string;
  action: string;
  estimatedCost: number;
  services: string[];
  expiresAt: number;
}

// Token settlement types
export interface TokenSettlement {
  total: number;
  serviceProvider: number;  // 85%
  arcTreasury: number;      // 10%
  operational: number;      // 5%
  txHash: string;
  token: '$ANGEL';
}

// Agent identity
export interface AgentIdentity {
  agentId: string;
  publicKey: string;
  wallet: string;
  tokenContract: string;
  registeredAt: number;
}

// Event types
export type AgentEvent =
  | { type: 'initialized'; identity: AgentIdentity }
  | { type: 'task_submitted'; taskId: string }
  | { type: 'task_completed'; taskId: string; result: TaskResult }
  | { type: 'task_failed'; taskId: string; error: string }
  | { type: 'approval_required'; request: ApprovalRequest }
  | { type: 'settlement_complete'; settlement: TokenSettlement }
  | { type: 'shutdown' };

export type AgentEventHandler = (event: AgentEvent) => void;
