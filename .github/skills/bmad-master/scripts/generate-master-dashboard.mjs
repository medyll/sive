#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import YAML from 'js-yaml';

async function walk(dir, results = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' || e.name === 'build') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full, results);
    } else if (e.isFile() && e.name === 'status.yaml' && path.basename(path.dirname(full)) === 'bmad') {
      results.push(full);
    }
  }
  return results;
}

function parsePhase(content, fallbackName = 'Unknown') {
  try {
    const data = YAML.load(content);
    if (data) {
      const phases = Array.isArray(data.phases) ? data.phases : data.phase ? [data.phase] : null;
      if (phases && phases.length) {
        const cur = phases.find(p => p.status === 'in_progress') || phases.find(p => p.status !== 'upcoming') || phases[0];
        return cur && (cur.name || cur['name']) ? String(cur.name || cur['name']) : fallbackName;
      }
      if (data.phase && typeof data.phase === 'string') return data.phase;
      if (data.phase && data.phase.name) return data.phase.name;
    }
  } catch (e) {
    // ignore and fallback to regex below
  }
  const phaseRegex = /-\s*name:\s*(.+)\r?\n\s*status:\s*(\w+)/g;
  let m;
  const phases = [];
  while ((m = phaseRegex.exec(content)) !== null) {
    phases.push({ name: m[1].trim(), status: m[2].trim() });
  }
  let cur = phases.find(p => p.status === 'in_progress') || phases.find(p => p.status !== 'upcoming') || phases[0];
  return cur ? cur.name : fallbackName;
}

function parseProgress(content) {
  try {
    const data = YAML.load(content);
    if (data && (data.progress !== undefined && data.progress !== null)) {
      const p = data.progress;
      if (typeof p === 'number') return p;
      if (typeof p === 'string') return Number(String(p).replace(/[^0-9]/g, '')) || null;
    }
  } catch (e) {
    // fall through to regex
  }
  const prog = content.match(/progress:\s*(\d{1,3})/);
  if (prog) return Number(prog[1]);
  return null;
}

function parseQaBugs(content) {
  try {
    const data = YAML.load(content);
    if (data && data.qa) {
      const qa = data.qa;
      if (Array.isArray(qa.bugs)) return qa.bugs.map(String);
      if (typeof qa.bugs === 'string') return qa.bugs.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
    }
  } catch (e) {
    // fallback
  }
  const qaIndex = content.indexOf('\nqa:');
  if (qaIndex === -1) return [];
  const sub = content.slice(qaIndex);
  const bugsMatch = sub.match(/bugs:\s*\[([^\]]*)\]/);
  if (bugsMatch) {
    const inner = bugsMatch[1].trim();
    if (!inner) return [];
    return inner.split(',').map(s => s.replace(/['"\s]/g, '').trim()).filter(Boolean);
  }
  const lines = sub.split(/\r?\n/);
  const bugs = [];
  let inBugs = false;
  for (const line of lines) {
    if (/^\s*bugs:/i.test(line)) { inBugs = true; continue; }
    if (inBugs) {
      const m = line.match(/^\s*-\s*(.+)/);
      if (m) bugs.push(m[1].trim());
      else if (/^\s*[^-\s]/.test(line)) break;
    }
  }
  return bugs;
}

function emojiForProgress(p) {
  if (p == null) return '⚪';
  if (p >= 50) return '🟢';
  if (p >= 20) return '🟡';
  return '🔴';
}

async function main() {
  const cwd = process.cwd();
  const args = process.argv.slice(2);
  const outPath = path.join(cwd, 'MASTER_DASHBOARD.md');

  const startTime = Date.now();
  console.log('[bmad] generate-master-dashboard starting');
  console.log('[bmad] args=', args.join(' '));
  console.log('[bmad] cwd=', cwd);

  const statusFiles = await walk(cwd, []);
  console.log(`[bmad] found ${statusFiles.length} bmad/status.yaml file(s)`);
  if (statusFiles.length === 0) {
    console.log('[bmad] No bmad/status.yaml files found. Exiting.');
    return;
  }

  const instances = [];
  for (const f of statusFiles) {
    try {
      const content = await fs.readFile(f, 'utf8');
      const pkgDir = path.dirname(path.dirname(f));
      // derive package name as repo-relative path (e.g., apps/api or packages/ui)
      let rel = path.relative(cwd, pkgDir).replace(/\\/g, '/');
      const pkgName = rel && rel !== '' ? rel : path.basename(pkgDir) || path.basename(cwd);
      const phase = parsePhase(content);
      const progress = parseProgress(content);
      const bugs = parseQaBugs(content);
      const relDash = path.relative(cwd, path.join(pkgDir, 'bmad', 'artifacts', 'dashboard.md'));
      instances.push({ package: pkgName, phase, progress, bugs, dashboardPath: relDash });
      console.log(`[bmad] processed: ${f} -> package=${pkgName}, phase=${phase}, progress=${progress ?? 'N/A'}, bugs=${bugs.length}`);
    } catch (e) {
      console.error('[bmad] Failed to read', f, e.message);
    }
  }

  const syncDate = new Date().toISOString().slice(0,10);
  const header = `# 👑 BMAD Master Dashboard\n> **Scope:** Monorepo Root | **Total Instances:** ${instances.length} | **Sync:** ${syncDate}\n\n---\n\n`;

  let table = '## 🏗️ Project Overview\n\n| Package | Phase | Progress | Status | Action |\n| :--- | :--- | :---: | :---: | :--- |\n';
  for (const inst of instances) {
    const prog = inst.progress != null ? `${inst.progress}%` : 'N/A';
    const emoji = emojiForProgress(inst.progress);
    const action = inst.dashboardPath ? `[Open Dash](${inst.dashboardPath.replace(/\\/g, '/')})` : '—';
    table += `| **${inst.package}** | ${inst.phase} | ${prog} | ${emoji} | ${action} |\n`;
  }

  let critical = '## ⚠️ Critical Issues (QA/Bugs)\n';
  let any = false;
  for (const inst of instances) {
    if (inst.bugs && inst.bugs.length) {
      any = true;
      for (const b of inst.bugs) {
        critical += `- [ ] **${inst.package}**: ${b}\n`;
      }
    }
  }
  if (!any) critical += '- None recorded\n';

  const actions = `## 🛠️ Global Actions\n- [🔄 Full Rescan](command:bmad.run?%5B%22/update-dashboard%22%5D)\n- [➕ New Package](command:bmad.run?%5B%22/workflow-init%22%5D)\n`;

  const out = [header, table, '\n---\n\n', critical, '\n---\n\n', actions].join('\n');
  console.log('[bmad] writing MASTER_DASHBOARD.md to', outPath);
  await fs.writeFile(outPath, out, 'utf8');
  const duration = Date.now() - startTime;
  console.log(`[bmad] MASTER_DASHBOARD.md written at ${outPath} (${duration}ms)`);

  // Also write a machine-readable JSON summary (hidden file)
  try {
    const jsonPath = path.join(cwd, '.master-dashboard.json');
    const json = {
      sync: syncDate,
      generatedAt: new Date().toISOString(),
      instances
    };
    await fs.writeFile(jsonPath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    console.log('[bmad] .master-dashboard.json written at', jsonPath);
  } catch (e) {
    console.error('[bmad] failed to write .master-dashboard.json', e.message);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
