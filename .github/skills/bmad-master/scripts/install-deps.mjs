#!/usr/bin/env node
import { spawnSync } from 'child_process';
import path from 'path';

const cwd = process.cwd();
console.log('[bmad] install-deps starting');
// Install js-yaml at repo root so the generator can import it
const pkgs = ['js-yaml'];
for (const p of pkgs) {
  console.log(`[bmad] installing ${p}...`);
  const res = spawnSync('npm', ['install', p, '--no-audit', '--no-fund'], { stdio: 'inherit', cwd });
  if (res.status !== 0) {
    console.error('[bmad] failed to install', p);
    process.exit(res.status || 1);
  }
}
console.log('[bmad] dependencies installed');
