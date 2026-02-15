# ARS ANGEL

> Autonomous AI agent for the Arc ecosystem

[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![Arc](https://img.shields.io/badge/Arc-ecosystem-purple)]()
[![Token](https://img.shields.io/badge/$ANGEL-LIVE-green)]()

**Release Date:** 15/02/2026

---

## Token Launch

**$ANGEL is now live!**

| Property | Value |
|----------|-------|
| Token | $ANGEL |
| Contract | `3p1uWgYa2DKAqZ7efuM3nJmAL7nofzfRGGhggX7Apump` |
| Network | Solana |
| Launch Date | 15/02/2026 |

### Token Economics

All service invocations settle in $ANGEL tokens:

| Recipient | Share |
|-----------|-------|
| Service Provider | 85% |
| Arc Treasury | 10% |
| Operational | 5% |

---

## Overview

ARS ANGEL is an autonomous agent that operates within the Arc ecosystem. It leverages:

- **Rig Framework** - High-performance Rust-based AI agent foundation
- **Model Context Protocol (MCP)** - Standardized agent-to-service communication
- **Ryzome Marketplace** - Service discovery and invocation
- **$ANGEL Token** - Native token for service settlements

## Installation

```bash
npm install ars-angel
```

## Quick Start

```typescript
import { ArsAngel, createDefaultConfig } from 'ars-angel';

const agent = new ArsAngel(createDefaultConfig({
  wallet: '0x...your-wallet',
  tokenContract: 'xxxxxxxxxxxxxxxx',
}));

await agent.initialize();

agent.onEvent((event) => {
  if (event.type === 'settlement_complete') {
    console.log('Paid:', event.settlement.total, '$ANGEL');
  }
});

await agent.submitTask('execute', {
  action: 'defi.swap',
  data: { from: 'SOL', to: 'ANGEL', amount: 10 },
  services: ['swap'],
});
```

## Configuration

```typescript
interface AgentConfig {
  name: string;
  version: string;
  mcpEndpoint: string;
  wallet: string;
  tokenContract: string;
  approvalMode: ApprovalMode;
  approvalThreshold?: {
    maxTokenValue: number;
    trustedServices: string[];
  };
}
```

## Architecture

```
┌──────────────────────────────────────────┐
│               ARS ANGEL                  │
│                                          │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  │
│  │  Tasks  │  │ Approval │  │ Events  │  │
│  └────┬────┘  └────┬─────┘  └────┬────┘  │
│       └────────────┼─────────────┘       │
│                    │                     │
│       ┌────────────▼────────────┐        │
│       │    Service Registry     │        │
│       │   (Ryzome Discovery)    │        │
│       └────────────┬────────────┘        │
│                    │                     │
│       ┌────────────▼────────────┐        │
│       │       MCP Client        │        │
│       │   (Protocol Layer)      │        │
│       └────────────┬────────────┘        │
│                    │                     │
│       ┌────────────▼────────────┐        │
│       │   Settlement Manager    │        │
│       │      ($ANGEL Token)     │        │
│       └─────────────────────────┘        │
└──────────────────────────────────────────┘
                     │
                     ▼
            Arc MCP Services
```

## API Reference

### Agent Lifecycle

```typescript
await agent.initialize();  // Connect, load services, verify token
await agent.shutdown();    // Disconnect, cleanup
```

### Task Submission

```typescript
const taskId = await agent.submitTask(type, payload);

// Types: 'query' | 'execute' | 'compose'
// Payload: { action, data, services?, maxCost? }
```

### Event Handling

```typescript
const unsubscribe = agent.onEvent((event) => {
  switch (event.type) {
    case 'initialized':
    case 'task_submitted':
    case 'task_completed':
    case 'task_failed':
    case 'approval_required':
    case 'settlement_complete':
    case 'shutdown':
  }
});
```

### Approval Management

```typescript
agent.approveTask(taskId);
agent.rejectTask(taskId);
```

### Service Discovery

```typescript
const services = await agent.discoverServices(['memory', 'swap']);
```

### Token Balance

```typescript
const balance = await agent.getTokenBalance();
console.log(`${balance} $ANGEL available`);
```

## Links

- Token Contract: `xxxxxxxxxxxxxxxx`
- Website: [arc.fun](https://arc.fun)
- Documentation: [docs.arc.fun](https://docs.arc.fun)

## License

MIT

---

*Released 15/02/2026*
