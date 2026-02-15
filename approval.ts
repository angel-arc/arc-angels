/**
 * ARS ANGEL - Approval Manager
 * v1.0.0 Production Release
 *
 * Human-in-the-loop approval workflow
 */

import {
  ApprovalMode,
  ApprovalThreshold,
  ApprovalRequest,
  Task,
  AgentEvent,
  AgentEventHandler,
} from './types';

export class ApprovalManager {
  private mode: ApprovalMode;
  private threshold?: ApprovalThreshold;
  private pending: Map<string, ApprovalRequest> = new Map();
  private eventHandler?: AgentEventHandler;

  constructor(mode: ApprovalMode, threshold?: ApprovalThreshold) {
    this.mode = mode;
    this.threshold = threshold;
  }

  setEventHandler(handler: AgentEventHandler): void {
    this.eventHandler = handler;
  }

  async requestApproval(
    task: Task,
    estimatedCost: number,
    services: string[]
  ): Promise<boolean> {
    if (this.mode === 'auto') return true;

    if (this.mode === 'threshold' && this.threshold) {
      if (this.meetsThreshold(estimatedCost, services)) {
        return true;
      }
    }

    const request = this.createRequest(task, estimatedCost, services);
    this.pending.set(task.id, request);
    this.emit({ type: 'approval_required', request });

    return this.waitForApproval(task.id);
  }

  approve(taskId: string): void {
    this.pending.delete(taskId);
  }

  reject(taskId: string): void {
    this.pending.delete(taskId);
  }

  getPendingApprovals(): ApprovalRequest[] {
    return Array.from(this.pending.values());
  }

  private meetsThreshold(cost: number, services: string[]): boolean {
    if (!this.threshold) return false;
    const withinCost = cost <= this.threshold.maxTokenValue;
    const trusted = services.every((s) => this.threshold!.trustedServices.includes(s));
    return withinCost && trusted;
  }

  private createRequest(task: Task, cost: number, services: string[]): ApprovalRequest {
    return {
      taskId: task.id,
      action: task.payload.action,
      estimatedCost: cost,
      services,
      expiresAt: Date.now() + 300000,
    };
  }

  private async waitForApproval(taskId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (!this.pending.has(taskId)) {
          clearInterval(check);
          resolve(true);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(check);
        this.pending.delete(taskId);
        resolve(false);
      }, 300000);
    });
  }

  private emit(event: AgentEvent): void {
    this.eventHandler?.(event);
  }
}
