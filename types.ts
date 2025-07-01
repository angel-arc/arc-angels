/**
 * ARS ANGEL - Types
 * Commit 2: Expanded type definitions
 */

export interface AgentConfig {
  name: string;
  version: string;
  description?: string;
  debug?: boolean;
}

export type AgentState = 'idle' | 'thinking' | 'executing' | 'error';

export interface Task {
  id: string;
  type: string;
  payload: unknown;
  status: TaskStatus;
  createdAt: Date;
}

export type TaskStatus = 'pending' | 'running' | 'done' | 'failed';

// Logging config for debug mode
export interface LogConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  prefix: string;
  timestamps: boolean;
}

// Placeholder for MCP - will implement next
export interface MCPEndpoint {
  url: string;
  // TODO: auth, protocols, etc
}
