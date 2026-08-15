import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SkillEngine } from '$lib/server/skills/engine';
import { CommandBus } from '$lib/server/commands/bus';
import { AIService } from '$lib/server/ai/service';
import { registerAllHandlers } from '$lib/server/commands/handlers';
import type { SkillInput } from '$lib/server/skills/types';

// Singleton instances to avoid re-initialization on each request
let _skillEngine: SkillEngine | null = null;

function getSkillEngineInstance(): SkillEngine {
	if (!_skillEngine) {
		const commandBus = new CommandBus();
		const aiService = new AIService();
		// Register all command handlers
		registerAllHandlers(commandBus);
		_skillEngine = new SkillEngine(commandBus, aiService);
	}
	return _skillEngine;
}

/**
 * Mapping from legacy action names to skill IDs
 * This allows the existing UI to work with the new Skill Engine
 */
const ACTION_TO_SKILL: Record<string, string> = {
	suggestions: 'skill_suggestions',
	coherence: 'skill_coherence',
	style: 'skill_style',
	chat: 'chat'
};

/**
 * Execute a skill via the Skill Engine.
 *
 * Failures throw rather than returning placeholder content: this endpoint feeds
 * writing suggestions, coherence alerts and style signals straight into the
 * editor, and an author acting on fabricated advice is worse than an author
 * seeing that the analysis failed.
 */
async function executeSkill(
	action: string,
	content: string,
	messages?: Array<{ role: string; text: string }>
): Promise<Record<string, unknown>> {
	const skillEngine = getSkillEngineInstance();
	const skillId = ACTION_TO_SKILL[action];

	if (!skillId || !skillEngine.getSkill(skillId)) {
		throw new Error(`No skill registered for action "${action}"`);
	}

	try {
		// Prepare input for the skill
		const input: SkillInput = {
			content,
			messages
		};

		// Execute the skill
		const result = await skillEngine.execute(skillId, input);

		// Map skill result to expected response format
		if (action === 'suggestions' && result.result?.suggestions) {
			return { suggestions: result.result.suggestions };
		}
		if (action === 'coherence' && result.result?.alerts) {
			return { alerts: result.result.alerts };
		}
		if (action === 'style' && result.result?.signals) {
			return { signals: result.result.signals };
		}
		if (action === 'chat' && result.result?.reply) {
			return { reply: result.result.reply };
		}

		throw new Error(`Skill "${skillId}" returned an unexpected result shape`);
	} catch (err) {
		console.error(`[/api/ai] Skill ${skillId} execution failed:`, err);
		throw err;
	}
}

/**
 * Legacy endpoint for backward compatibility.
 * Delegates to the Skill Engine; failures surface as 503.
 * 
 * Follows the architecture described in BMAD:
 * bmad/references/project/5-ai-architecture-mcp-skills.md
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { action, content = '', messages = [] } = body as {
		action: 'suggestions' | 'coherence' | 'style' | 'chat';
		content?: string;
		messages?: Array<{ role: string; text: string }>;
	};

	// Validate action
	if (!action || !['suggestions', 'coherence', 'style', 'chat'].includes(action)) {
		return error(400, { message: 'Invalid or missing action' });
	}

	try {
		// Try to execute via Skill Engine
		const response = await executeSkill(action, content, messages);
		
		if (response.error) {
			return error(400, { message: response.error as string });
		}
		
		return json(response);
	} catch (err) {
		console.error('[/api/ai] Error:', err);
		const message = err instanceof Error ? err.message : 'AI request failed';
		return json({ error: message }, { status: 503 });
	}
};
