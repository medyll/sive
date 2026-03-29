/**
 * Skills Engine - Core Implementation
 * 
 * Executes skills defined in YAML format.
 * Manages execution context, MCP tool calls, AI prompts, and Command Bus emissions.
 */

import { executeMCPTool, MCP_TOOLS } from '$lib/server/mcp/tools';
import { commandBus } from '$lib/shared/commandBus';
import type { YamlEntity } from '$lib/types/yaml-types';

/**
 * Skill step types
 */
export type StepType = 'tool' | 'prompt' | 'command';

/**
 * Error handling behavior for steps
 */
export type OnErrorBehavior = 'ignore' | 'abort' | 'notify';

/**
 * Skill step definition
 */
export interface SkillStep {
	tool?: string;
	command?: string;
	prompt?: string;
	params?: Record<string, unknown>;
	on_error?: OnErrorBehavior;
}

/**
 * Skill definition (from YAML)
 */
export interface SkillDefinition {
	id: string;
	description: string;
	trigger: string | string[];
	steps: SkillStep[];
}

/**
 * Execution context - accumulates data between steps
 */
export interface ExecutionContext {
	skill_id: string;
	trigger: string;
	input: Record<string, unknown>;
	results: Record<string, unknown>;
	meta: {
		started_at: string;
		current_step: number;
		total_steps: number;
		errors: string[];
	};
}

/**
 * Skill execution result
 */
export interface SkillResult {
	success: boolean;
	skill_id: string;
	duration_ms: number;
	results: Record<string, unknown>;
	errors: string[];
}

/**
 * AI Model configuration
 */
export interface ModelConfig {
	provider: 'ollama' | 'anthropic' | 'openai' | 'gemini';
	model: string;
	apiKey?: string;
	endpoint?: string;
}

/**
 * Skill Engine class
 */
export class SkillEngine {
	private static instance: SkillEngine;
	private modelConfig: ModelConfig;
	private executionLog: Array<{
		skill_id: string;
		timestamp: string;
		duration_ms: number;
		success: boolean;
	}> = [];

	private constructor() {
		// Default model config - can be overridden
		this.modelConfig = {
			provider: 'ollama',
			model: 'mistral',
			endpoint: 'http://localhost:11434'
		};
	}

	/**
	 * Get singleton instance
	 */
	static getInstance(): SkillEngine {
		if (!SkillEngine.instance) {
			SkillEngine.instance = new SkillEngine();
		}
		return SkillEngine.instance;
	}

	/**
	 * Set model configuration
	 */
	setModelConfig(config: ModelConfig): void {
		this.modelConfig = config;
	}

	/**
	 * Execute a skill
	 */
	async execute(skill: SkillDefinition, input: Record<string, unknown>): Promise<SkillResult> {
		const startTime = Date.now();
		const context: ExecutionContext = {
			skill_id: skill.id,
			trigger: Array.isArray(skill.trigger) ? skill.trigger[0] : skill.trigger,
			input,
			results: {},
			meta: {
				started_at: new Date().toISOString(),
				current_step: 0,
				total_steps: skill.steps.length,
				errors: []
			}
		};

		console.log(`[SkillEngine] Executing: ${skill.id}`);

		try {
			for (let i = 0; i < skill.steps.length; i++) {
				const step = skill.steps[i];
				context.meta.current_step = i + 1;

				const onError = step.on_error || 'notify';

				try {
					if (step.tool) {
						await this.executeToolStep(step.tool, step.params, context);
					} else if (step.prompt) {
						await this.executePromptStep(step.prompt, context);
					} else if (step.command) {
						await this.executeCommandStep(step.command, step.params, context, onError);
					}
				} catch (err) {
					const errorMessage = err instanceof Error ? err.message : 'Unknown error';
					context.meta.errors.push(`Step ${i + 1}: ${errorMessage}`);

					if (onError === 'abort') {
						throw err;
					} else if (onError === 'notify') {
						console.error(`[SkillEngine] Step ${i + 1} failed: ${errorMessage}`);
						// Continue execution
					}
					// 'ignore' continues silently
				}
			}

			const duration = Date.now() - startTime;
			const result: SkillResult = {
				success: context.meta.errors.length === 0,
				skill_id: skill.id,
				duration_ms: duration,
				results: context.results,
				errors: context.meta.errors
			};

			this.logExecution(skill.id, duration, result.success);
			return result;
		} catch (err) {
			const duration = Date.now() - startTime;
			const errorMessage = err instanceof Error ? err.message : 'Unknown error';

			this.logExecution(skill.id, duration, false);

			return {
				success: false,
				skill_id: skill.id,
				duration_ms: duration,
				results: context.results,
				errors: [...context.meta.errors, errorMessage]
			};
		}
	}

	/**
	 * Execute a tool step
	 */
	private async executeToolStep(
		toolName: string,
		params: Record<string, unknown> = {},
		context: ExecutionContext
	): Promise<void> {
		console.log(`[SkillEngine] Tool: ${toolName}`);

		// Resolve parameters from context
		const resolvedParams = this.resolveParams(params, context);

		// Check if tool exists
		if (!(toolName in MCP_TOOLS)) {
			throw new Error(`Unknown MCP tool: ${toolName}`);
		}

		// Execute tool
		// @ts-expect-error - Dynamic tool execution
		const result = executeMCPTool(toolName, ...Object.values(resolvedParams));

		// Store result in context
		context.results[`result_${toolName}`] = result;
	}

	/**
	 * Execute a prompt step
	 */
	private async executePromptStep(
		promptTemplate: string,
		context: ExecutionContext
	): Promise<void> {
		console.log('[SkillEngine] AI Prompt');

		// Build final prompt with context
		const finalPrompt = this.buildPrompt(promptTemplate, context);

		// Call AI model
		const reply = await this.callAIModel(finalPrompt);

		// Store result
		context.results['prompt_result'] = reply;
	}

	/**
	 * Execute a command step
	 */
	private async executeCommandStep(
		command: string,
		params: Record<string, unknown> = {},
		context: ExecutionContext,
		onError: OnErrorBehavior
	): Promise<void> {
		console.log(`[SkillEngine] Command: ${command}`);

		// Resolve parameters from context
		const resolvedParams = this.resolveParams(params, context);

		// Execute command via Command Bus
		await commandBus.execute(command, resolvedParams, onError);
	}

	/**
	 * Resolve parameters from context variables
	 */
	private resolveParams(
		params: Record<string, unknown>,
		context: ExecutionContext
	): Record<string, unknown> {
		const resolved: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(params)) {
			if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
				// Variable reference
				const varName = value.slice(2, -2);
				resolved[key] = this.resolveVariable(varName, context);
			} else {
				resolved[key] = value;
			}
		}

		return resolved;
	}

	/**
	 * Resolve a variable from context
	 */
	private resolveVariable(varName: string, context: ExecutionContext): unknown {
		// Priority 1: input.*
		if (varName.startsWith('input.')) {
			const key = varName.slice(6);
			return context.input[key];
		}

		// Priority 2: results.*
		if (varName.startsWith('results.')) {
			const key = varName.slice(8);
			return context.results[key];
		}

		// Priority 3: direct result reference
		if (context.results[varName]) {
			return context.results[varName];
		}

		// Priority 4: input direct reference
		if (context.input[varName]) {
			return context.input[varName];
		}

		console.warn(`[SkillEngine] Unresolved variable: ${varName}`);
		return undefined;
	}

	/**
	 * Build final prompt with context injection
	 */
	private buildPrompt(promptTemplate: string, context: ExecutionContext): string {
		// Serialize relevant context
		const contextData: string[] = [];

		// Add tool results to context
		for (const [key, value] of Object.entries(context.results)) {
			if (key.startsWith('result_')) {
				contextData.push(`[${key}]`);
				contextData.push(typeof value === 'string' ? value : JSON.stringify(value, null, 2));
				contextData.push('');
			}
		}

		// Build final prompt
		const finalPrompt = [
			'=== CONTEXT ===',
			...contextData,
			'=== INSTRUCTIONS ===',
			promptTemplate
		].join('\n');

		return finalPrompt;
	}

	/**
	 * Call AI model
	 */
	private async callAIModel(prompt: string): Promise<string> {
		// Stub implementation - in production, call actual AI provider
		console.log(`[SkillEngine] Calling AI: ${this.modelConfig.provider}/${this.modelConfig.model}`);

		// Simulate AI delay
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Return stub response
		return `[AI Response stub for: ${prompt.substring(0, 50)}...]`;
	}

	/**
	 * Log skill execution
	 */
	private logExecution(skill_id: string, duration_ms: number, success: boolean): void {
		this.executionLog.push({
			skill_id,
			timestamp: new Date().toISOString(),
			duration_ms,
			success
		});

		// Keep last 100 executions
		if (this.executionLog.length > 100) {
			this.executionLog.shift();
		}
	}

	/**
	 * Get execution history
	 */
	getExecutionHistory(): typeof this.executionLog {
		return [...this.executionLog];
	}

	/**
	 * Clear execution history
	 */
	clearHistory(): void {
		this.executionLog = [];
	}
}

/**
 * Default skill engine instance
 */
export const skillEngine = SkillEngine.getInstance();

/**
 * Load skill from YAML string
 */
export function loadSkillFromYaml(yamlContent: string): SkillDefinition {
	// Simple YAML parser - in production, use js-yaml
	const lines = yamlContent.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));

	const skill: Partial<SkillDefinition> = {
		id: '',
		description: '',
		trigger: '',
		steps: []
	};

	let currentStep: Partial<SkillStep> = {};
	let inSteps = false;
	let inTrigger = false;

	for (const line of lines) {
		const trimmed = line.trim();

		// Parse top-level fields
		if (trimmed.startsWith('id:')) {
			skill.id = trimmed.split(':')[1].trim();
		} else if (trimmed.startsWith('description:')) {
			skill.description = trimmed.split(':')[1].trim();
		} else if (trimmed.startsWith('trigger:')) {
			const triggerValue = trimmed.split(':')[1].trim();
			if (triggerValue.includes('|')) {
				skill.trigger = triggerValue.split('|').map((t) => t.trim());
			} else {
				skill.trigger = triggerValue;
			}
			inTrigger = true;
		} else if (trimmed === 'steps:') {
			inSteps = true;
			inTrigger = false;
		} else if (inSteps && trimmed.startsWith('- tool:')) {
			if (currentStep.tool) {
				skill.steps!.push(currentStep as SkillStep);
			}
			currentStep = { tool: trimmed.split(':')[1].trim() };
		} else if (inSteps && trimmed.startsWith('- command:')) {
			if (currentStep.tool) {
				skill.steps!.push(currentStep as SkillStep);
			}
			currentStep = { command: trimmed.split(':')[1].trim() };
		} else if (inSteps && trimmed.startsWith('- prompt:')) {
			if (currentStep.tool) {
				skill.steps!.push(currentStep as SkillStep);
			}
			currentStep = { prompt: trimmed.split(':')[1].trim() };
		} else if (inSteps && trimmed.startsWith('params:')) {
			// Parse params (simplified)
			currentStep.params = {};
		} else if (inSteps && trimmed.startsWith('on_error:')) {
			currentStep.on_error = trimmed.split(':')[1].trim() as OnErrorBehavior;
		}
	}

	// Add last step
	if (currentStep.tool || currentStep.command || currentStep.prompt) {
		skill.steps!.push(currentStep as SkillStep);
	}

	return skill as SkillDefinition;
}
