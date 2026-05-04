/**
 * Skill Engine
 * 
 * The app module that executes skills. Its primary role is to maintain the
 * execution context between steps — MCP keeping no state between tool calls,
 * the Engine accumulates results and makes them available to subsequent steps
 * via {{...}} variables.
 * 
 * Follows the architecture described in BMAD:
 * bmad/references/project/5-ai-architecture-mcp-skills.md
 * bmad/references/project/11-technical-implementation.md
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { AIService, type AIRequest } from '../ai/service';
import { CommandBus, type CommandEvent } from '../commands/bus';
import { executeMCPTool, MCP_TOOLS } from '../mcp/tools';
import type {
  SkillDefinition,
  SkillStep,
  SkillContext,
  SkillInput,
  SkillResult,
  SkillEngineConfig,
  ToolStep,
  PromptStep,
  CommandStep
} from './types';
import type { AIProvider } from '../ai/router';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_CONFIG: SkillEngineConfig = {
  skillDir: join(__dirname, '..', '..', '..', 'lib', 'skills'),
  maxContextSize: 16000,
  defaultProvider: 'ollama',
  enableFallback: true,
  logExecutions: true,
  logDir: './.skills_log'
};

/**
 * Skill Engine - Executes skill YAML files, manages context,
 * calls MCP tools and AI, and emits commands to the Command Bus
 */
export class SkillEngine {
  private config: SkillEngineConfig;
  private commandBus: CommandBus;
  private aiService: AIService;
  private skills: Map<string, SkillDefinition> = new Map();
  private contexts: Map<string, SkillContext> = new Map();

  constructor(
    commandBus: CommandBus,
    aiService: AIService,
    config: Partial<SkillEngineConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.commandBus = commandBus;
    this.aiService = aiService;
    this.loadSkills();
  }

  // ========================================================================
  // Skill Loading
  // ========================================================================

  /**
   * Load all skill definitions from the skill directory
   */
  private loadSkills(): void {
    try {
      if (!existsSync(this.config.skillDir)) {
        if (this.config.logExecutions) {
          console.log(
            `[SkillEngine] Skill directory not found: ${this.config.skillDir}`
          );
        }
        return;
      }

      const files = readdirSync(this.config.skillDir);
      for (const file of files) {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          const path = join(this.config.skillDir, file);
          try {
            const content = readFileSync(path, 'utf-8');
            const skill = yaml.load(content) as SkillDefinition;
            // Normalize steps to have type field
            skill.steps = skill.steps.map((step: SkillStep) => {
              if (!('type' in step)) {
                // Default to 'tool' for backward compatibility
                return { type: 'tool', ...step } as ToolStep;
              }
              return step;
            });
            this.skills.set(skill.id, skill);
            if (this.config.logExecutions) {
              console.log(`[SkillEngine] Loaded skill: ${skill.id}`);
            }
          } catch (err) {
            console.error(`[SkillEngine] Failed to load skill from ${file}:`, err);
          }
        }
      }
    } catch (err) {
      console.error('[SkillEngine] Failed to load skills:', err);
    }
  }

  /**
   * Reload all skills from disk
   */
  reloadSkills(): void {
    this.skills.clear();
    this.contexts.clear();
    this.loadSkills();
  }

  // ========================================================================
  // Skill Registration
  // ========================================================================

  /**
   * Register a skill dynamically (not from file)
   */
  registerSkill(skill: SkillDefinition): void {
    this.skills.set(skill.id, skill);
    if (this.config.logExecutions) {
      console.log(`[SkillEngine] Registered skill: ${skill.id}`);
    }
  }

  /**
   * Unregister a skill
   */
  unregisterSkill(skillId: string): void {
    this.skills.delete(skillId);
    if (this.config.logExecutions) {
      console.log(`[SkillEngine] Unregistered skill: ${skillId}`);
    }
  }

  /**
   * Get a skill definition by ID
   */
  getSkill(skillId: string): SkillDefinition | undefined {
    return this.skills.get(skillId);
  }

  /**
   * Get all registered skills
   */
  listSkills(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  // ========================================================================
  // Context Management
  // ========================================================================

  /**
   * Get the current context for a skill execution
   */
  getContext(skillId: string): SkillContext | undefined {
    return this.contexts.get(skillId);
  }

  /**
   * Clear the context for a skill
   */
  clearContext(skillId: string): void {
    this.contexts.delete(skillId);
  }

  /**
   * Clear all contexts
   */
  clearAllContexts(): void {
    this.contexts.clear();
  }

  // ========================================================================
  // Main Execution Methods
  // ========================================================================

  /**
   * Execute a skill synchronously
   */
  async execute(skillId: string, input: SkillInput = {}): Promise<SkillResult> {
    const startTime = Date.now();
    const skill = this.skills.get(skillId);

    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    // Create execution context
    const context: SkillContext = {
      skill_id: skillId,
      trigger: skill.trigger,
      input,
      results: {},
      meta: {
        started_at: new Date().toISOString(),
        current_step: 0,
        total_steps: skill.steps.length,
        errors: [],
        warnings: []
      }
    };

    this.contexts.set(skillId, context);

    try {
      for (let i = 0; i < skill.steps.length; i++) {
        context.meta.current_step = i + 1;
        const step = skill.steps[i];

        try {
          await this.executeStep(skill, step, context);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          context.meta.errors.push(error);

          const onError = step.on_error || 'notify';
          switch (onError) {
            case 'abort':
              throw error;
            case 'notify':
              context.meta.warnings.push(
                `Step ${i + 1} (${step.type}) failed: ${error.message}`
              );
              break;
            case 'ignore':
            default:
              // Continue silently
              break;
          }
        }
      }

      return {
        success: context.meta.errors.length === 0,
        result: context.results,
        skill_id: skillId,
        duration_ms: Date.now() - startTime,
        steps_executed: skill.steps.length,
        errors: context.meta.errors,
        warnings: context.meta.warnings
      };
    } finally {
      this.contexts.delete(skillId);
    }
  }

  /**
   * Execute a skill with streaming output
   * Yields each prompt response chunk as it's generated
   */
  async *executeStream(
    skillId: string,
    input: SkillInput = {}
  ): AsyncGenerator<string, SkillResult, unknown> {
    const skill = this.skills.get(skillId);

    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    const context: SkillContext = {
      skill_id: skillId,
      trigger: skill.trigger,
      input,
      results: {},
      meta: {
        started_at: new Date().toISOString(),
        current_step: 0,
        total_steps: skill.steps.length,
        errors: [],
        warnings: []
      }
    };

    this.contexts.set(skillId, context);

    try {
      for (let i = 0; i < skill.steps.length; i++) {
        context.meta.current_step = i + 1;
        const step = skill.steps[i];

        try {
          // For streaming, we need special handling of prompt steps
          if (step.type === 'prompt') {
            const promptStep = step as PromptStep;
            const resolvedPrompt = this.resolveString(promptStep.prompt, context);
            const resolvedSystemPrompt = promptStep.system_prompt
              ? this.resolveString(promptStep.system_prompt, context)
              : undefined;

            const taskType = skill.task_type || 'custom';
            const provider = this.resolveProvider(promptStep, skill);

            const request: AIRequest = {
              prompt: resolvedPrompt,
              systemPrompt: resolvedSystemPrompt,
              taskType,
              provider,
              config: {
                temperature: promptStep.temperature,
                maxTokens: promptStep.max_tokens
              }
            };

            // Stream the response
            const stream = this.aiService.generateStream(request);
            for await (const chunk of stream) {
              yield chunk;
            }

            // Store the full response in context
            context.results.prompt_result = this.parseResponse(
              '', // Full content not available in streaming
              promptStep.response_format
            );
          } else {
            await this.executeStep(skill, step, context);
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          context.meta.errors.push(error);

          const onError = step.on_error || 'notify';
          if (onError === 'abort') {
            throw error;
          }
        }
      }

      return {
        success: context.meta.errors.length === 0,
        result: context.results,
        skill_id: skillId,
        duration_ms: Date.now(),
        steps_executed: skill.steps.length,
        errors: context.meta.errors,
        warnings: context.meta.warnings
      };
    } finally {
      this.contexts.delete(skillId);
    }
  }

  // ========================================================================
  // Step Execution
  // ========================================================================

  /**
   * Execute a single step based on its type
   */
  private async executeStep(
    skill: SkillDefinition,
    step: SkillStep,
    context: SkillContext
  ): Promise<void> {
    switch (step.type) {
      case 'tool':
        await this.executeToolStep(step, context);
        break;
      case 'prompt':
        await this.executePromptStep(step, context, skill);
        break;
      case 'command':
        await this.executeCommandStep(step, context);
        break;
      default:
        throw new Error(`Unknown step type: ${(step as SkillStep).type}`);
    }
  }

  /**
   * Execute a tool step (MCP tool call)
   */
  private async executeToolStep(step: ToolStep, context: SkillContext): Promise<void> {
    const resolvedParams = this.resolveParams(step.params || {}, context);
    const toolName = step.tool as keyof typeof MCP_TOOLS;

    // Check if tool exists
    if (!MCP_TOOLS[toolName]) {
      throw new Error(`Unknown MCP tool: ${toolName}`);
    }

    try {
      // Execute the MCP tool with resolved parameters
      const result = executeMCPTool(toolName, ...Object.values(resolvedParams));
      const resultKey = `result_${toolName.replace('.', '_')}`;
      context.results[resultKey] = result;

      if (this.config.logExecutions) {
        console.log(`[SkillEngine] Tool executed: ${toolName}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('MCP tool execution failed');
      if (this.config.logExecutions) {
        console.error(`[SkillEngine] Tool ${toolName} failed:`, error.message);
      }
      throw error;
    }
  }

  /**
   * Execute a prompt step (AI model call)
   */
  private async executePromptStep(
    step: PromptStep,
    context: SkillContext,
    skill: SkillDefinition
  ): Promise<void> {
    const resolvedPrompt = this.resolveString(step.prompt, context);
    const resolvedSystemPrompt = step.system_prompt
      ? this.resolveString(step.system_prompt, context)
      : undefined;

    const taskType = skill.task_type || 'custom';
    const provider = this.resolveProvider(step, skill);

    // Build context for AI prompt
    const aiContext = this.buildAIPromptContext(context);

    // Combine context with the prompt
    const fullPrompt = aiContext + '\n\n' + resolvedPrompt;

    const request: AIRequest = {
      prompt: fullPrompt,
      systemPrompt: resolvedSystemPrompt,
      taskType,
      provider,
      config: {
        temperature: step.temperature,
        maxTokens: step.max_tokens,
        top_p: step.top_p
      }
    };

    try {
      const response = await this.aiService.generate(request);
      context.results.prompt_result = this.parseResponse(
        response.content,
        step.response_format
      );

      if (this.config.logExecutions) {
        console.log(
          `[SkillEngine] Prompt executed: ${step.prompt.substring(0, 50)}...`
        );
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('AI request failed');
      if (this.config.logExecutions) {
        console.error(`[SkillEngine] Prompt failed:`, error.message);
      }
      throw error;
    }
  }

  /**
   * Execute a command step (Command Bus emission)
   */
  private async executeCommandStep(step: CommandStep, context: SkillContext): Promise<void> {
    const resolvedParams = this.resolveParams(step.params || {}, context);

    const event: CommandEvent = {
      command: step.command as any,
      params: resolvedParams,
      on_error: step.on_error,
      source: context.skill_id,
      timestamp: Date.now()
    };

    try {
      const result = await this.commandBus.emit(event);
      if (result !== undefined) {
        const resultKey = `result_${step.command.replace('.', '_')}`;
        context.results[resultKey] = result;
      }

      if (this.config.logExecutions) {
        console.log(`[SkillEngine] Command emitted: ${step.command}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Command execution failed');
      if (this.config.logExecutions) {
        console.error(`[SkillEngine] Command ${step.command} failed:`, error.message);
      }
      throw error;
    }
  }

  // ========================================================================
  // Helper Methods
  // ========================================================================

  /**
   * Resolve provider for a prompt step
   */
  private resolveProvider(step: PromptStep, skill: SkillDefinition): AIProvider {
    // Priority: step.model > skill.model > skill.provider > config.defaultProvider
    if (step.model) {
      return step.model.split('/')[0] as AIProvider;
    }
    if (skill.model) {
      return skill.model.split('/')[0] as AIProvider;
    }
    if (skill.provider) {
      return skill.provider;
    }
    return this.config.defaultProvider;
  }

  /**
   * Resolve string template with variable placeholders
   */
  private resolveString(template: string, context: SkillContext): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, ref) => {
      const value = this.resolveVariable(ref.trim(), context);
      return value !== undefined ? String(value) : `{{${ref}}}`;
    });
  }

  /**
   * Resolve all parameters for a step
   */
  private resolveParams(params: Record<string, unknown>, context: SkillContext): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value.includes('{{')) {
        resolved[key] = this.resolveString(value, context);
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  }

  /**
   * Resolve a variable reference from context
   * Priority: input > results > app state > undefined
   */
  private resolveVariable(ref: string, context: SkillContext): unknown {
    // 1. Check input
    if (context.input && Object.prototype.hasOwnProperty.call(context.input, ref)) {
      return context.input[ref];
    }

    // 2. Check results
    if (context.results && Object.prototype.hasOwnProperty.call(context.results, ref)) {
      return context.results[ref];
    }

    // 3. Check app state (would be injected in future)
    // For now, return undefined

    // 4. Return undefined
    return undefined;
  }

  /**
   * Parse AI response based on expected format
   */
  private parseResponse(content: string, format?: string): unknown {
    switch (format) {
      case 'json':
        try {
          return JSON.parse(content);
        } catch {
          return content;
        }
      case 'yaml':
        try {
          return yaml.load(content);
        } catch {
          return content;
        }
      default:
        return content;
    }
  }

  /**
   * Build context string to prepend to AI prompts
   * Automatically injects relevant context from previous steps
   */
  private buildAIPromptContext(context: SkillContext): string {
    const parts: string[] = [];

    // Add information about the current state
    if (context.input.current_chapter) {
      parts.push(`Current Chapter: ${context.input.current_chapter}`);
    }
    if (context.input.scope) {
      parts.push(`Scope: ${context.input.scope}`);
    }

    // Add results from MCP tool calls
    for (const [key, value] of Object.entries(context.results)) {
      if (key.startsWith('result_read_')) {
        const fileName = key.replace('result_read_', '');
        parts.push(`${fileName}: ${JSON.stringify(value).substring(0, 200)}...`);
      }
    }

    if (parts.length > 0) {
      return `[AUTOMATICALLY INJECTED CONTEXT]\n${parts.join('\n')}`;
    }

    return '';
  }

  // ========================================================================
  // Configuration
  // ========================================================================

  /**
   * Update engine configuration
   */
  updateConfig(updates: Partial<SkillEngineConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): SkillEngineConfig {
    return { ...this.config };
  }

  /**
   * Get skill directory
   */
  getSkillDir(): string {
    return this.config.skillDir;
  }

  /**
   * Set skill directory and reload skills
   */
  setSkillDir(dir: string): void {
    this.config.skillDir = dir;
    this.reloadSkills();
  }
}
