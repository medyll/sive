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
import yaml from 'js-yaml';
import type { SkillDefinition } from '../server/skills/types';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Default skills directory
const DEFAULT_SKILLS_DIR = join(__dirname, '..', '..', '..', 'lib', 'skills');

/**
 * Load all skill definitions from a directory
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
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        const path = join(skillsDir, file);
        try {
          const content = readFileSync(path, 'utf-8');
          const skill = yaml.load(content) as SkillDefinition;
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

// ============================================================================
// Skill Definitions (for direct import without file loading)
// ============================================================================

// These are the built-in skill definitions that are also available as YAML files
// They can be used directly without loading from disk

import skillCoherence from './skill_coherence.yaml?raw';
import skillStyle from './skill_style.yaml?raw';
import skillSuggestions from './skill_suggestions.yaml?raw';
import skillReview from './skill_review.yaml?raw';
import skillVersionDescription from './skill_version_description.yaml?raw';

/**
 * Built-in skills that are bundled with the application
 */
export const BUILT_IN_SKILLS: Map<string, SkillDefinition> = (() => {
  const skills = new Map<string, SkillDefinition>();
  
  try {
    [
      skillCoherence,
      skillStyle,
      skillSuggestions,
      skillReview,
      skillVersionDescription
    ].forEach((yamlContent) => {
      if (yamlContent) {
        const skill = yaml.load(yamlContent) as SkillDefinition;
        skills.set(skill.id, skill);
      }
    });
  } catch (err) {
    console.error('[Skills] Failed to load built-in skills:', err);
  }
  
  return skills;
})();

/**
 * Get built-in skill by ID
 */
export function getBuiltInSkill(skillId: string): SkillDefinition | undefined {
  return BUILT_IN_SKILLS.get(skillId);
}

/**
 * Get all built-in skill definitions
 */
export function getAllBuiltInSkills(): SkillDefinition[] {
  return Array.from(BUILT_IN_SKILLS.values());
}
