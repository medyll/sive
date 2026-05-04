import { json, type RequestHandler } from '@sveltejs/kit';
import { SkillEngine } from '$lib/server/skills/engine';
import { CommandBus } from '$lib/server/commands/bus';
import { AIService } from '$lib/server/ai/service';
import { registerAllHandlers } from '$lib/server/commands/handlers';
import type { SkillDefinition } from '$lib/server/skills/types';

// Singleton instance
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

export const GET: RequestHandler = async () => {
	try {
		const skillEngine = getSkillEngineInstance();
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
