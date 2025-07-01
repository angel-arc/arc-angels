/**
 * ARS ANGEL - Agent Class
 * Commit 2: Basic implementation
 */

import { AgentConfig, AgentState, Task, TaskStatus, LogConfig } from './types';

export class ArsAngel {
  private config: AgentConfig;
  private state: AgentState = 'idle';
  private tasks: Task[] = [];
  private logConfig: LogConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.logConfig = {
      level: config.debug ? 'debug' : 'info',
      prefix: `[${config.name}]`,
      timestamps: true,
    };
    this.log('Agent created');
  }

  async start(): Promise<void> {
    this.log('Starting agent...');
    this.state = 'idle';
    // TODO: connect to MCP
    this.log('Agent started');
  }

  async stop(): Promise<void> {
    this.log('Stopping agent...');
    this.state = 'idle';
    this.tasks = [];
    this.log('Agent stopped');
  }

  submitTask(type: string, payload: unknown): string {
    const task: Task = {
      id: this.generateId(),
      type,
      payload,
      status: 'pending',
      createdAt: new Date(),
    };
    this.tasks.push(task);
    this.log(`Task submitted: ${task.id}`);
    return task.id;
  }

  getState(): AgentState {
    return this.state;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  // Debug utilities
  debug_dumpState(): void {
    if (!this.config.debug) return;
    console.log('\n=== DEBUG STATE ===');
    console.log('Config:', this.config);
    console.log('State:', this.state);
    console.log('Tasks:', this.tasks.length);
    console.log('===================\n');
  }

  debug_listTasks(): void {
    if (!this.config.debug) return;
    console.log('Tasks:', this.tasks);
  }

  private log(message: string): void {
    if (this.logConfig.level === 'debug' || this.config.debug) {
      const ts = this.logConfig.timestamps ? `[${new Date().toISOString()}]` : '';
      console.log(`${ts} ${this.logConfig.prefix} ${message}`);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}
