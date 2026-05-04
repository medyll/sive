import { json, error, type RequestHandler } from '@sveltejs/kit';
import { SkillEngine } from '$lib/server/skills/engine';
import { CommandBus } from '$lib/server/commands/bus';
import { AIService } from '$lib/server/ai/service';
import { registerAllHandlers } from '$lib/server/commands/handlers';
import type { SkillInput, SkillResult } from '$lib/server/skills/types';

// Singleton instances
let _skillEngine: SkillEngine | null = null;

function getSkillEngineInstance(): SkillEngine {
	if (!_skillEngine) {
		const commandBus = new CommandBus();
		const aiService = new AIService();
		registerAllHandlers(commandBus);
		_skillEngine = new SkillEngine(commandBus, aiService);
	}
	return _skillEngine;
}

// Non-streaming handler
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { skill_id, input = {}, stream = false } = await request.json();

		if (!skill_id) {
			return error(400, { message: 'skill_id is required' });
		}

		if (stream) {
			return error(400, { message: 'Streaming not supported via this endpoint. Use GET with stream=true' });
		}

		const skillEngine = getSkillEngineInstance();
		const skill = skillEngine.getSkill(skill_id);

		if (!skill) {
			return error(404, { message: `Skill not found: ${skill_id}` });
		}

		const result: SkillResult = await skillEngine.execute(skill_id, input as SkillInput);

		return json({
			success: result.success,
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
		const skillEngine = getSkillEngineInstance();
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
