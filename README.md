# ARS ANGEL

> Arc ecosystem AI agent

**Last Updated:** 03/02/2026

## Status

🚧 **Under Development** 🚧

## TODO

- [x] Define core types
- [x] Basic agent class
- [ ] MCP integration
- [ ] Service discovery
- [ ] Approval workflow
- [ ] Token integration

## Installation

```bash
# Coming soon
npm install ars-angel
```

## Quick Start

```typescript
import { ArsAngel } from 'ars-angel';

const agent = new ArsAngel({
  name: 'my-agent',
  version: '0.1.0',
  debug: true,
});

await agent.start();
```

## Architecture

```
┌─────────────────┐
│    ArsAngel     │
│  ┌───────────┐  │
│  │   Tasks   │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │   State   │  │
│  └───────────┘  │
└─────────────────┘
        │
        ▼
   (MCP - TODO)
```

## Development

```bash
# Run in dev mode
npx ts-node index.ts
```

### Debug Mode

Set `debug: true` in config to enable verbose logging.

```typescript
const agent = new ArsAngel({
  name: 'test',
  version: '0.1.0',
  debug: true, // Enables debug output
});

agent.debug_dumpState(); // Print internal state
```

---
*03/02/2026*
