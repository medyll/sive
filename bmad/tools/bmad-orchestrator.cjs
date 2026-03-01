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
  // Ensure the repository has the npm script pointing to the ESM generator
  const ensureScript = path.join(cwd, '.github', 'skills', 'bmad-master', 'scripts', 'ensure-bmad-update-dashboard.mjs');
  console.log('Running ensure script to guarantee package.json entry...');
  let res = spawnSync('node', [ensureScript], { stdio: 'inherit' });
  if (res.error) {
    console.error('Failed to run ensure script:', res.error.message);
    process.exit(1);
  }

  // Run the npm script which points to the ESM generator
  const spawnArgs = ['run', 'bmad:update-dashboard'];
  // forward --root if provided (generator ignores it but preserve behavior)
  if (args.includes('--root')) spawnArgs.push('--', '--root');
  console.log('Executing: npm', spawnArgs.join(' '));
  res = spawnSync('npm', spawnArgs, { stdio: 'inherit' });
  process.exit(res.status || 0);
}

console.error('Unknown command:', cmd);
process.exit(2);
