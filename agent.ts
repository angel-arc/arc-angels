/**
 * ARS ANGEL - Core Agent
 * v1.0.0 Production Release
 * 15/02/2026 - Token Launch
 *
 * Autonomous AI agent for the Arc ecosystem with $ANGEL token integration
 */

import {
  AgentConfig,
  AgentState,
  Task,
  TaskPayload,
  TaskType,
  TaskStatus,
  TaskResult,
  AgentIdentity,
  ServiceDefinition,
  AgentEvent,
  AgentEventHandler,
  ANGEL_TOKEN,
} from './types';
import { MCPClient } from './mcp-client';
import { ServiceRegistry } from './service-registry';
import { ApprovalManager } from './approval';
import { SettlementManager } from './settlement';

export class ArsAngel {
  private config: AgentConfig;
  private state: AgentState = 'initializing';
  private identity: AgentIdentity | null = null;
  private tasks: Map<string, Task> = new Map();
  private handlers: AgentEventHandler[] = [];

  private mcpClient: MCPClient;
  private serviceRegistry: ServiceRegistry;
  private approvalManager: ApprovalManager;
  private settlementManager: SettlementManager;

  constructor(config: AgentConfig) {
    this.config = config;
    this.mcpClient = new MCPClient({ endpoint: config.mcpEndpoint });
    this.serviceRegistry = new ServiceRegistry(this.mcpClient);
    this.approvalManager = new ApprovalManager(config.approvalMode, config.approvalThreshold);
    this.settlementManager = new SettlementManager(config.wallet, config.tokenContract);

    this.approvalManager.setEventHandler((e) => this.emit(e));
  }

  async initialize(): Promise<void> {
    // Verify token contract
    const validContract = await this.settlementManager.verifyContract();
    if (!validContract) {
      throw new Error(`Invalid token contract. Expected: ${ANGEL_TOKEN.contract}`);
    }

    await this.mcpClient.connect();
    await this.serviceRegistry.initialize();
    this.identity = this.createIdentity();
    this.state = 'idle';
    this.emit({ type: 'initialized', identity: this.identity });
  }

  async shutdown(): Promise<void> {
    await this.mcpClient.disconnect();
    this.tasks.clear();
    this.state = 'initializing';
    this.emit({ type: 'shutdown' });
  }

  async submitTask(type: TaskType, payload: TaskPayload): Promise<string> {
    const task = this.createTask(type, payload);
    this.tasks.set(task.id, task);
    this.emit({ type: 'task_submitted', taskId: task.id });
    this.processTask(task.id);
    return task.id;
  }

  onEvent(handler: AgentEventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      const i = this.handlers.indexOf(handler);
      if (i > -1) this.handlers.splice(i, 1);
    };
  }

  approveTask(taskId: string): void {
    this.approvalManager.approve(taskId);
  }

  rejectTask(taskId: string): void {
    this.approvalManager.reject(taskId);
    this.updateTask(taskId, 'failed', 'Rejected by user');
  }

  async discoverServices(capabilities: string[]): Promise<ServiceDefinition[]> {
    return this.serviceRegistry.discover(capabilities);
  }

  async getTokenBalance(): Promise<number> {
    return this.settlementManager.getBalance();
  }

  getState(): AgentState {
    return this.state;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getIdentity(): AgentIdentity | null {
    return this.identity;
  }

  private async processTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    try {
      // Planning
      this.updateTask(taskId, 'planning');
      this.state = 'planning';

      const services = await this.serviceRegistry.discover(task.payload.services || []);
      if (services.length === 0) {
        throw new Error('No services available for requested capabilities');
      }

      const estimatedCost = services.reduce((sum, s) => sum + s.pricing.perCall, 0);

      // Check balance
      const balance = await this.settlementManager.getBalance();
      if (balance < estimatedCost) {
        throw new Error(`Insufficient $ANGEL balance. Need: ${estimatedCost}, Have: ${balance}`);
      }

      // Approval (for execute tasks)
      if (task.type === 'execute') {
        this.updateTask(taskId, 'awaiting_approval');
        this.state = 'awaiting_approval';

        const approved = await this.approvalManager.requestApproval(
          task,
          estimatedCost,
          services.map((s) => s.id)
        );

        if (!approved) {
          throw new Error('Approval timeout or rejected');
        }
      }

      // Execution
      this.updateTask(taskId, 'running');
      this.state = 'executing';

      const { result, cost } = await this.serviceRegistry.invoke(
        services[0].id,
        task.payload.action,
        task.payload.data
      );

      // Settlement
      this.updateTask(taskId, 'settling');
      this.state = 'settling';

      const settlement = await this.settlementManager.settle(cost);
      this.emit({ type: 'settlement_complete', settlement });

      const taskResult: TaskResult = {
        success: true,
        data: result,
        servicesUsed: [services[0].id],
        settlement,
      };

      this.completeTask(taskId, taskResult);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.failTask(taskId, message);
    } finally {
      this.state = 'idle';
    }
  }

  private createTask(type: TaskType, payload: TaskPayload): Task {
    return {
      id: `task_${crypto.randomUUID().slice(0, 12)}`,
      type,
      payload,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  private createIdentity(): AgentIdentity {
    return {
      agentId: `ars-angel-${crypto.randomUUID().slice(0, 8)}`,
      publicKey: `arc_pub_${crypto.randomUUID().replace(/-/g, '')}`,
      wallet: this.config.wallet,
      tokenContract: this.config.tokenContract,
      registeredAt: Date.now(),
    };
  }

  private updateTask(id: string, status: TaskStatus, error?: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.status = status;
      task.updatedAt = Date.now();
      if (error) task.error = error;
    }
  }

  private completeTask(id: string, result: TaskResult): void {
    const task = this.tasks.get(id);
    if (task) {
      task.status = 'completed';
      task.result = result;
      task.updatedAt = Date.now();
      this.emit({ type: 'task_completed', taskId: id, result });
    }
  }

  private failTask(id: string, error: string): void {
    this.updateTask(id, 'failed', error);
    this.emit({ type: 'task_failed', taskId: id, error });
  }

  private emit(event: AgentEvent): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }
}
