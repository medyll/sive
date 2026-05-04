/**
 * Skills Module Index
 * 
 * Entry point for loading and accessing skill definitions.
 * Follows the architecture described in BMAD:
 * bmad/references/project/5-ai-architecture-mcp-skills.md
 * bmad/references/project/11-technical-implementation.md
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SkillDefinition } from '../server/skills/types';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Default skills directory
const DEFAULT_SKILLS_DIR = join(__dirname, '..', 'lib', 'skills');

/**
 * Load all skill definitions from a directory
 * Skills are in JSON format
 */
export function loadSkills(skillsDir: string = DEFAULT_SKILLS_DIR): Map<string, SkillDefinition> {
  const skills = new Map<string, SkillDefinition>();

  try {
    if (!existsSync(skillsDir)) {
      console.warn(`[Skills] Directory not found: ${skillsDir}`);
      return skills;
    }

    const files = readdirSync(skillsDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const path = join(skillsDir, file);
        try {
          const content = readFileSync(path, 'utf-8');
          const skill = JSON.parse(content) as SkillDefinition;
          skills.set(skill.id, skill);
        } catch (err) {
          console.error(`[Skills] Failed to load ${file}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('[Skills] Failed to load skills:', err);
  }

  return skills;
}

/**
 * Load a specific skill by ID
 */
export function loadSkill(skillId: string, skillsDir: string = DEFAULT_SKILLS_DIR): SkillDefinition | null {
  const skills = loadSkills(skillsDir);
  return skills.get(skillId) || null;
}

/**
 * Get list of all available skill IDs
 */
export function listSkillIds(skillsDir: string = DEFAULT_SKILLS_DIR): string[] {
  return Array.from(loadSkills(skillsDir).keys());
}

/**
 * Get list of all skill definitions
 */
export function listSkills(skillsDir: string = DEFAULT_SKILLS_DIR): SkillDefinition[] {
  return Array.from(loadSkills(skillsDir).values());
}

/**
 * Check if a skill exists
 */
export function hasSkill(skillId: string, skillsDir: string = DEFAULT_SKILLS_DIR): boolean {
  return loadSkills(skillsDir).has(skillId);
}
