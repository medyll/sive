import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSkillEngine } from '$lib/server/ai';
import { STUB_SUGGESTIONS } from '$lib/suggestionsStore.svelte.js';
import { STUB_ALERTS } from '$lib/coherenceStore.svelte.js';
import type { SkillInput } from '$lib/server/skills/types';

// Stub style signals (mirrors AIPanel.svelte STUB_SIGNALS)
const STUB_SIGNALS = [
	{ location: 'Para. 1', signal: 'Repetition', suggestion: 'The word "shadow" appears 4 times. Consider varying with "silhouette" or "shade".' },
	{ location: 'Para. 3', signal: 'Sentence length', suggestion: 'Three consecutive short sentences disrupt the prose rhythm. Try merging the last two.' },
	{ location: 'Para. 5', signal: 'Lexical density', suggestion: 'High nominal density slows reading pace. Break into two sentences with a transitional verb.' }
];

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
 * Get stub response for an action
 */
function getStubResponse(action: string): Record<string, unknown> {
	if (action === 'suggestions') return { suggestions: STUB_SUGGESTIONS };
	if (action === 'coherence') return { alerts: STUB_ALERTS };
	if (action === 'style') return { signals: STUB_SIGNALS };
	if (action === 'chat') return { reply: '[stub] AI response' };
	return { error: 'Unknown action' };
}

/**
 * Execute a skill via the Skill Engine
 * Falls back to STUBS if skill execution fails
 */
async function executeSkill(
	action: string,
	content: string,
	messages?: Array<{ role: string; text: string }>
): Promise<Record<string, unknown>> {
	const skillEngine = getSkillEngine();
	const skillId = ACTION_TO_SKILL[action];

	// If no skill mapping or skill not found, return stubs
	if (!skillId || !skillEngine.getSkill(skillId)) {
		console.log(`[/api/ai] No skill for action: ${action}, using fallback`);
		return getStubResponse(action);
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

		// If result doesn't have expected format, use stubs
		console.log(`[/api/ai] Unexpected result format for ${action}:`, result.result);
		return getStubResponse(action);
	} catch (err) {
		console.error(`[/api/ai] Skill ${skillId} execution failed:`, err);
		// Fallback to stubs on error
		return getStubResponse(action);
	}
}

/**
 * Legacy endpoint for backward compatibility
 * This endpoint now delegates to the Skill Engine when possible,
 * falling back to STUBS when skills are not available.
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
		// Fallback to stubs on any error
		return json(getStubResponse(action));
	}
};
