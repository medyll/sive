/**
 * Skills API - Execute Endpoint
 * 
 * Executes a skill by ID with optional input parameters.
 * Supports both non-streaming and streaming execution.
 * 
 * POST /api/skills/execute
 * 
 * Request body:
 * {
 *   "skill_id": string,
 *   "input"?: Record<string, unknown>,
 *   "stream"?: boolean
 * }
 * 
 * Follows the architecture described in BMAD:
 * bmad/references/project/5-ai-architecture-mcp-skills.md
 * bmad/references/project/11-technical-implementation.md
 */

import { json, error, type RequestHandler } from '@sveltejs/kit';
import { getSkillEngine } from '$lib/server/ai';
import type { SkillInput, SkillResult } from '$lib/server/skills/types';

// Non-streaming handler
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { skill_id, input = {}, stream = false } = await request.json();

    if (!skill_id) {
      return error(400, { message: 'skill_id is required' });
    }

    if (stream) {
      return error(400, { message: 'Streaming not supported via this endpoint. Use /api/skills/execute/stream' });
    }

    const skillEngine = getSkillEngine();
    const skill = skillEngine.getSkill(skill_id);

    if (!skill) {
      return error(404, { message: `Skill not found: ${skill_id}` });
    }

    const result: SkillResult = await skillEngine.execute(skill_id, input as SkillInput);

    return json({
      success: true,
      result: result.result,
      skill_id: result.skill_id,
      duration_ms: result.duration_ms,
      steps_executed: result.steps_executed,
      errors: result.errors.map((e) => e.message),
      warnings: result.warnings
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Skills API] Execute error:', err);
    return error(500, { message: errorMessage });
  }
};

// Streaming handler for Server-Sent Events
export const GET: RequestHandler = async ({ request, url }) => {
  const skill_id = url.searchParams.get('skill_id');
  const streamParam = url.searchParams.get('stream');

  if (!skill_id) {
    return error(400, { message: 'skill_id query parameter is required' });
  }

  // Parse input from query params (limited to small values)
  const input: SkillInput = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (key !== 'skill_id' && key !== 'stream') {
      input[key] = value;
    }
  }

  try {
    const skillEngine = getSkillEngine();
    const skill = skillEngine.getSkill(skill_id);

    if (!skill) {
      return error(404, { message: `Skill not found: ${skill_id}` });
    }

    // Create a transform stream for SSE
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          const generator = skillEngine.executeStream(skill_id, input);
          
          for await (const chunk of generator) {
            // For streaming execution, we get chunks from prompt steps
            if (typeof chunk === 'string') {
              controller.enqueue(`data: ${JSON.stringify({ type: 'data', data: chunk })}\n\n`);
            }
          }
          
          controller.enqueue('data: [DONE]\n\n');
          controller.close();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          controller.enqueue(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`);
          controller.close();
        }
      }
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Skills API] Stream error:', err);
    return error(500, { message: errorMessage });
  }
};
