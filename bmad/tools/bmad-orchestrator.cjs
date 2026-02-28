#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: bmad-orchestrator.cjs <command> [--root]');
  process.exit(1);
}

const cmd = args[0];
const cwd = process.cwd();

if (cmd === '/update-dashboard') {
  const root = args.includes('--root');
  const script = path.join(cwd, 'bmad', 'tools', 'generate-master-dashboard.cjs');
  const spawnArgs = [];
  if (root) spawnArgs.push('--root');
  const res = spawnSync('node', [script, ...spawnArgs], { stdio: 'inherit' });
  process.exit(res.status || 0);
}

console.error('Unknown command:', cmd);
process.exit(2);
