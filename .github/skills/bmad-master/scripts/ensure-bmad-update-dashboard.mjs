#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

async function ensure() {
  const repoRoot = process.cwd();
  const pkgPath = path.join(repoRoot, 'package.json');
  console.log('[bmad] ensure-bmad-update-dashboard starting');
  try {
    const txt = await fs.readFile(pkgPath, 'utf8');
    const pkg = JSON.parse(txt);
    pkg.scripts = pkg.scripts || {};
    const target = 'node .github/skills/bmad-master/scripts/generate-master-dashboard.mjs';
    if (pkg.scripts['bmad:update-dashboard'] === target) {
      console.log('[bmad] package.json already contains bmad:update-dashboard ->', target);
      return;
    }
    console.log('[bmad] setting scripts.bmad:update-dashboard ->', target);
    pkg.scripts['bmad:update-dashboard'] = target;
    const newTxt = JSON.stringify(pkg, null, 2) + '\n';
    await fs.writeFile(pkgPath, newTxt, 'utf8');
    console.log('[bmad] package.json updated');
  } catch (e) {
    console.error('[bmad] failed to update package.json', e.message);
    process.exit(1);
  }
}

ensure();
