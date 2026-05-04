/**
 * Skill Engine Types
 * 
 * Type definitions for the Skill Engine and related components.
 * Follows the architecture described in BMAD: bmad/references/project/5-ai-architecture-mcp-skills.md
 */

import type { AIProvider } from '../ai/router';

// ============================================================================
// Skill Definition Types
// ============================================================================

/**
 * Skill definition from YAML file
 * Defines AI behaviour for a specific business task
 */
export interface SkillDefinition {
  id: string;
  description: string;
  trigger?: string | string[];
  task_type?: 'coherence' | 'style' | 'review' | 'suggestions' | 'chat' | 'custom';
  provider?: AIProvider;  // Override default provider for this skill
  model?: string;        // Override default model for this skill
  steps: SkillStep[];
  metadata?: SkillMetadata;
}

/**
 * Skill metadata for versioning and attribution
 */
export interface SkillMetadata {
  version: string;
  author: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Skill Step Types
// ============================================================================

/**
 * Base properties common to all step types
 */
export interface BaseStep {
  id?: string;
  description?: string;
  on_error?: 'ignore' | 'abort' | 'notify';
  timeout?: number;  // Step timeout in milliseconds
}

/**
 * Step that calls an MCP tool to read/write project data
 */
export interface ToolStep extends BaseStep {
  type: 'tool';
  tool: string;  // MCP tool name (e.g., "read_bible", "read_chapter")
  params?: Record<string, string | number | boolean>;
}

/**
 * Step that sends a prompt to the AI model
 */
export interface PromptStep extends BaseStep {
  type: 'prompt';
  prompt: string;  // Prompt template with {{variable}} placeholders
  system_prompt?: string;
  model?: string;  // Override model for this prompt (e.g., "ollama/mistral")
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  response_format?: 'text' | 'json' | 'yaml';
}

/**
 * Step that emits a command to the Command Bus
 */
export interface CommandStep extends BaseStep {
  type: 'command';
  command: string;  // Command name (e.g., "ui.open_tab", "coherence.push_alert")
  params?: Record<string, string | number | boolean>;
}

/**
 * Union type for all possible skill steps
 */
export type SkillStep = ToolStep | PromptStep | CommandStep;

// ============================================================================
// Execution Context Types
// ============================================================================

/**
 * Input parameters passed to a skill execution
 */
export interface SkillInput {
  [key: string]: unknown;
  current_chapter?: string;
  scope?: string;
  user_id?: string;
  last_version?: string;
  project_id?: string;
}

/**
 * Execution context maintained during skill execution
 * Contains all state accumulated between steps
 */
export interface SkillContext {
  skill_id: string;
  trigger?: string | string[];
  input: SkillInput;
  results: Record<string, unknown>;
  meta: SkillMeta;
}

/**
 * Metadata about skill execution
 */
export interface SkillMeta {
  started_at: string;
  current_step: number;
  total_steps: number;
  errors: Error[];
  warnings: string[];
}

// ============================================================================
// Skill Result Types
// ============================================================================

/**
 * Result of a skill execution
 */
export interface SkillResult {
  success: boolean;
  result?: Record<string, unknown>;
  skill_id: string;
  duration_ms: number;
  steps_executed: number;
  errors: Error[];
  warnings: string[];
}

/**
 * Streaming chunk from skill execution
 */
export interface SkillStreamChunk {
  type: 'data' | 'result' | 'error' | 'done';
  data?: string;
  result?: unknown;
  error?: string;
  skill_id?: string;
  step?: number;
}

// ============================================================================
// Skill Engine Configuration
// ============================================================================

/**
 * Configuration options for the Skill Engine
 */
export interface SkillEngineConfig {
  skillDir: string;           // Directory containing skill YAML files
  maxContextSize: number;    // Max tokens to inject into prompts
  defaultProvider: AIProvider;   // Default AI provider
  enableFallback: boolean;   // Enable provider fallback
  logExecutions: boolean;    // Log skill executions to file
  logDir: string;           // Directory for execution logs
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Type for function that resolves variable references like {{variable}}
 */
export type VariableResolver = (ref: string, context: SkillContext) => unknown;

/**
 * Type for step executor functions
 */
export type StepExecutor = (
  step: SkillStep,
  context: SkillContext,
  skill: SkillDefinition
) => Promise<void>;

/**
 * Type for skill loader function
 */
export type SkillLoader = (skillDir: string) => Map<string, SkillDefinition>;

/**
 * Type for skill saver function
 */
export type SkillSaver = (skill: SkillDefinition, skillDir: string) => Promise<void>;
