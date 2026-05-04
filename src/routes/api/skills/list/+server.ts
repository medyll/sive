/**
 * Skills API - List Endpoint
 * 
 * Returns a list of all available skills with their metadata.
 * 
 * GET /api/skills/list
 * 
 * Follows the architecture described in BMAD:
 * bmad/references/project/5-ai-architecture-mcp-skills.md
 * bmad/references/project/11-technical-implementation.md
 */

import { json, type RequestHandler } from '@sveltejs/kit';
import { getSkillEngine } from '$lib/server/ai';
import type { SkillDefinition } from '$lib/server/skills/types';

export const GET: RequestHandler = async () => {
  try {
    const skillEngine = getSkillEngine();
    const skills: SkillDefinition[] = skillEngine.listSkills();

    // Return simplified skill info for the list
    const skillList = skills.map((skill) => ({
      id: skill.id,
      description: skill.description,
      task_type: skill.task_type,
      trigger: skill.trigger,
      metadata: skill.metadata
    }));

    return json({
      success: true,
      skills: skillList,
      count: skillList.length
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Skills API] List error:', err);
    return json({
      success: false,
      error: errorMessage,
      skills: []
    }, { status: 500 });
  }
};
