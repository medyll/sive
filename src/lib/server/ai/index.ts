/**
 * AI Module Index
 * 
 * Central entry point for all AI-related functionality.
 * Exports the Skill Engine, Command Bus, MCP Tools, and AI Service.
 * 
 * Follows the architecture described in BMAD:
 * bmad/references/project/5-ai-architecture-mcp-skills.md
 * bmad/references/project/11-technical-implementation.md
 */

// ============================================================================
// Core Components
// ============================================================================

export { AIService, aiService, type AIServiceConfig, type AIRequest, type AIResponse } from './service';
export { AIModelRouter, aiRouter, type AIProvider, type ModelConfig, type RoutingConfig } from './router';
export { OllamaClient, ollamaClient } from './ollama';

// ============================================================================
// Skill Engine
// ============================================================================

export {
  SkillEngine,
  type SkillDefinition,
  type SkillStep,
  type SkillContext,
  type SkillInput,
  type SkillResult,
  type SkillEngineConfig,
  type VariableResolver,
  type StepExecutor
} from './skills/engine';

export type { 
  BaseStep,
  ToolStep,
  PromptStep,
  CommandStep,
  SkillMetadata
} from './skills/types';

// ============================================================================
// Command Bus
// ============================================================================

export {
  CommandBus,
  commandBus,
  type CommandEvent,
  type CommandResult,
  type CommandHandler,
  type ModuleHandler,
  type CommandBusConfig
} from './commands/bus';

export type {
  CommandModule,
  CommandName,
  CommandParams,
  CommandParamsFor
} from './commands/types';

// ============================================================================
// MCP Tools
// ============================================================================

export {
  executeMCPTool,
  MCP_TOOLS,
  readBible,
  readTimeline,
  readStructure,
  readThemes,
  readNarrator,
  readChapter,
  readCharacterSheet,
  listChapters,
  readVersion,
  readVersionIndex,
  writeTransition,
  updateStatus,
  addTimelineEvent,
  addCharacter,
  updateNarrativeThread,
  addMotifOccurrence,
  compareVersions,
  extractChapterStates,
  countWords,
  searchOccurrences,
  createHarden,
  restoreVersion,
  parseYaml
} from './mcp/tools';

export type { MCPToolRegistry, MCPToolFunction } from './mcp/tools';

// ============================================================================
// Command Handlers
// ============================================================================

export {
  registerAllHandlers,
  unregisterAllHandlers,
  initializeCommandBus,
  ALL_HANDLERS
} from './commands/handlers';

export * as uiHandlers from './commands/handlers/uiHandlers';

// ============================================================================
// Skills
// ============================================================================

export {
  loadSkills,
  loadSkill,
  listSkillIds,
  listSkills,
  hasSkill,
  BUILT_IN_SKILLS,
  getBuiltInSkill,
  getAllBuiltInSkills
} from '$lib/skills';

// ============================================================================
// Initialization
// ============================================================================

import { AIService } from './service';
import { CommandBus } from './commands/bus';
import { SkillEngine } from './skills/engine';
import { registerAllHandlers } from './commands/handlers';

// Singleton instances
let _aiService: AIService | null = null;
let _commandBus: CommandBus | null = null;
let _skillEngine: SkillEngine | null = null;

/**
 * Initialize the complete AI system
 * Creates and connects all components:
 * - AI Service
 * - Command Bus with all handlers
 * - Skill Engine with loaded skills
 */
export function initializeAIService(): {
  aiService: AIService;
  commandBus: CommandBus;
  skillEngine: SkillEngine;
} {
  // Create singleton instances if they don't exist
  if (!_aiService) {
    _aiService = new AIService();
  }
  
  if (!_commandBus) {
    _commandBus = new CommandBus();
    registerAllHandlers(_commandBus);
  }
  
  if (!_skillEngine) {
    _skillEngine = new SkillEngine(_commandBus, _aiService);
  }
  
  return {
    aiService: _aiService,
    commandBus: _commandBus,
    skillEngine: _skillEngine
  };
}

/**
 * Get the singleton AI Service instance
 */
export function getAIService(): AIService {
  if (!_aiService) {
    _aiService = new AIService();
  }
  return _aiService;
}

/**
 * Get the singleton Command Bus instance
 */
export function getCommandBus(): CommandBus {
  if (!_commandBus) {
    _commandBus = new CommandBus();
    registerAllHandlers(_commandBus);
  }
  return _commandBus;
}

/**
 * Get the singleton Skill Engine instance
 */
export function getSkillEngine(): SkillEngine {
  if (!_skillEngine) {
    const aiService = getAIService();
    const commandBus = getCommandBus();
    _skillEngine = new SkillEngine(commandBus, aiService);
  }
  return _skillEngine;
}

/**
 * Reset all singleton instances (useful for testing)
 */
export function resetAIService(): void {
  _aiService = null;
  _commandBus = null;
  _skillEngine = null;
}
