/**
 * ARS ANGEL
 * Commit 2: Basic exports
 */

export { ArsAngel } from './agent';
export * from './types';

// Dev test
if (process.env.NODE_ENV === 'development') {
  const { ArsAngel } = require('./agent');
  const agent = new ArsAngel({
    name: 'dev-test',
    version: '0.1.0',
    debug: true,
  });
  agent.start();
  agent.debug_dumpState();
}
