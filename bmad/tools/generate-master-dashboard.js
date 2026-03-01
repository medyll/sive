#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

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

function parsePhase(content) {
  // find occurrences of - name: <name>\n    status: <status>
  const phaseRegex = /-\s*name:\s*(.+)\r?\n\s*status:\s*(\w+)/g;
  let m;
  const phases = [];
  while ((m = phaseRegex.exec(content)) !== null) {
    phases.push({ name: m[1].trim(), status: m[2].trim() });
  }
  // prefer in_progress, then first not upcoming, else first
  let cur = phases.find(p => p.status === 'in_progress') || phases.find(p => p.status !== 'upcoming') || phases[0];
  return cur ? cur.name : 'Unknown';
}

function parseProgress(content) {
  const prog = content.match(/progress:\s*(\d{1,3})/);
  if (prog) return Number(prog[1]);
  return null;
}

function parseQaBugs(content) {
  // look for qa: then bugs: list
  const qaIndex = content.indexOf('\nqa:');
  if (qaIndex === -1) return [];
  const sub = content.slice(qaIndex);
  const bugsMatch = sub.match(/bugs:\s*\[([^\]]*)\]/);
  if (bugsMatch) {
    const inner = bugsMatch[1].trim();
    if (!inner) return [];
    return inner.split(',').map(s => s.replace(/['"\s]/g, '').trim()).filter(Boolean);
  }
  // fallback: parse dash list under qa\n  const lines = sub.split(/\r?\n/);
  const bugs = [];
  let inBugs = false;
  for (const line of lines) {
    if (/^\s*bugs:/i.test(line)) { inBugs = true; continue; }
    if (inBugs) {
      const m = line.match(/^\s*-\s*(.+)/);
      if (m) bugs.push(m[1].trim());
      else if (/^\s*[^-\s]/.test(line)) break; // next block
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
  const rootMode = args.includes('--root');
  const outPath = path.join(cwd, 'master-dashboard.md');

  // discover bmad/status.yaml files
  const statusFiles = await walk(cwd, []);
  if (statusFiles.length === 0) {
    console.log('No bmad/status.yaml files found.');
    return;
  }

  const instances = [];
  for (const f of statusFiles) {
    try {
      const content = await fs.readFile(f, 'utf8');
      const pkgDir = path.dirname(path.dirname(f)); // parent of bmad
      const pkgName = path.basename(pkgDir) || path.basename(cwd);
      const phase = parsePhase(content);
      const progress = parseProgress(content);
      const bugs = parseQaBugs(content);
      const relDash = path.relative(cwd, path.join(pkgDir, 'bmad', 'artifacts', 'dashboard.md'));
      instances.push({ package: pkgName, phase, progress, bugs, dashboardPath: relDash });
    } catch (e) {
      console.error('Failed to read', f, e.message);
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

  // critical issues
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

  const actions = `## 🛠️ Global Actions\n- [🔄 Full Rescan](command:bmad.run?%5B%22/update-dashboard%20--root%22%5D)\n- [➕ New Package](command:bmad.run?%5B%22/workflow-init%22%5D)\n`;

  const out = [header, table, '\n---\n\n', critical, '\n---\n\n', actions].join('\n');
  await fs.writeFile(outPath, out, 'utf8');
  console.log('master-dashboard.md written at', outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
