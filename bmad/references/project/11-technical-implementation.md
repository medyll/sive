<!-- 11-technical-implementation.md -->
# 11. Technical Implementation Guide — Sive AI Architecture

> **Document Type:** Technical Specification  
> **Version:** 1.0  
> **Status:** Draft  
> **Last Updated:** 2024  
> **Related Files:** [5-ai-architecture-mcp-skills](./5-ai-architecture-mcp-skills.md), [0-software-architecture.md](./0-software-architecture.md)

---

## Overview

This document provides the **technical implementation details** for wiring the Sive AI architecture as described in the BMAD references. It bridges the gap between the conceptual architecture (Section 5) and the actual codebase.

### Current State (Before Implementation)

| Component | Status | Location |
|-----------|--------|----------|
| **MCP Tools** | ✅ Implemented | `src/lib/server/mcp/tools.ts` |
| **AI Service** | ✅ Partially Implemented | `src/lib/server/ai/` |
| **Ollama Client** | ✅ Implemented | `src/lib/server/ai/ollama.ts` |
| **AI Router** | ✅ Implemented | `src/lib/server/ai/router.ts` |
| **Skill Engine** | ❌ NOT Implemented | - |
| **Command Bus** | ❌ NOT Implemented | - |
| **Skill Definitions (YAML)** | ❌ NOT Implemented | - |
| **UI Integration** | ❌ Using STUBS | `src/lib/elements/AIPanel.svelte` |
| **Provider Configuration UI** | ❌ NOT Implemented | - |

### Target State (After Implementation)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │
│  │  AIPanel.svelte  │  │ AISettings.svelte│  │  EditorPanel...  │       │
│  │  (Coherence tab) │  │ (Config providers)│  │                 │       │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘       │
└───────────┼─────────────────────┼─────────────────────┼─────────────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      COMMAND BUS                                      │
│  Routes commands from Skills to UI modules                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │  ui.open_tab │  │ ui.show_modal│  │coherence... │                      │
│  └─────────────┘  └─────────────┘  └─────────────┘                      │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      SKILL ENGINE                                     │
│  Executes skill YAML files, manages context, calls MCP tools & AI       │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  Load skill_coherence.yaml                                        │  │
│  │  → tool: read_bible                                               │  │
│  │  → tool: read_chapter(id: "{{current_chapter}}")                  │  │
│  │  → prompt: "Analyse..." → AI Service                              │  │
│  │  → command: coherence.push_alert → Command Bus                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
┌─────────────────────┐ ┌─────────────┐ ┌─────────────────────┐
│   MCP TOOLS          │ │ AI SERVICE  │ │ COMMAND HANDLERS    │
│  (read/write files)  │ │ (LLM calls) │ │ (UI/business logic) │
└─────────────────────┘ └─────────────┘ └─────────────────────┘
```

---

## 1. Directory Structure for New Components

```
src/
├── lib/
│   ├── server/
│   │   ├── skills/                          # NEW: Skill Engine
│   │   │   ├── engine.ts                    # Core Skill Engine
│   │   │   ├── registry.ts                  # Skill registry & loader
│   │   │   ├── context.ts                   # Execution context manager
│   │   │   └── types.ts                     # Type definitions
│   │   │
│   │   ├── commands/                        # NEW: Command Bus
│   │   │   ├── bus.ts                       # Core Command Bus
│   │   │   ├── registry.ts                  # Command handlers registry
│   │   │   ├── handlers/                    # Command handler modules
│   │   │   │   ├── uiHandlers.ts             # UI command handlers
│   │   │   │   ├── editorHandlers.ts         # Editor command handlers
│   │   │   │   ├── coherenceHandlers.ts      # Coherence command handlers
│   │   │   │   ├── styleHandlers.ts          # Style command handlers
│   │   │   │   ├── suggestionsHandlers.ts     # Suggestions command handlers
│   │   │   │   ├── versioningHandlers.ts     # Versioning command handlers
│   │   │   │   └── reviewHandlers.ts         # Review command handlers
│   │   │   └── types.ts                     # Type definitions
│   │   │
│   │   └── ai/                              # EXISTING: AI Service
│   │       ├── service.ts                   # ✅ Already exists
│   │       ├── router.ts                    # ✅ Already exists
│   │       └── ollama.ts                    # ✅ Already exists
│   │
│   └── skills/                              # NEW: Skill definitions (YAML)
│       ├── skill_coherence.yaml             # Coherence detection skill
│       ├── skill_style.yaml                 # Style analysis skill
│       ├── skill_review.yaml                # Review mode skill
│       ├── skill_suggestions.yaml           # Suggestions skill
│       ├── skill_version_description.yaml    # Version message skill
│       └── index.ts                          # Skill loader/exporter
│
└── routes/
    └── api/
        └── skills/                           # NEW: API endpoints
            ├── execute/+server.ts           # Execute a skill
            ├── list/+server.ts              # List available skills
            └── config/+server.ts             # Get/set skill config
```

---

## 2. Implementation Checklist

### Phase 1: Core Infrastructure (High Priority)

- [ ] **2.1** Create Skill Engine (`src/lib/server/skills/engine.ts`)
- [ ] **2.2** Create Skill Registry (`src/lib/server/skills/registry.ts`)
- [ ] **2.3** Create Execution Context Manager (`src/lib/server/skills/context.ts`)
- [ ] **2.4** Create Command Bus (`src/lib/server/commands/bus.ts`)
- [ ] **2.5** Create Command Registry (`src/lib/server/commands/registry.ts`)
- [ ] **2.6** Define TypeScript types (`src/lib/server/skills/types.ts`, `src/lib/server/commands/types.ts`)

### Phase 2: Command Handlers (High Priority)

- [ ] **2.7** Implement UI command handlers (`src/lib/server/commands/handlers/uiHandlers.ts`)
- [ ] **2.8** Implement Editor command handlers (`src/lib/server/commands/handlers/editorHandlers.ts`)
- [ ] **2.9** Implement Coherence command handlers (`src/lib/server/commands/handlers/coherenceHandlers.ts`)
- [ ] **2.10** Implement Style command handlers (`src/lib/server/commands/handlers/styleHandlers.ts`)
- [ ] **2.11** Implement Suggestions command handlers (`src/lib/server/commands/handlers/suggestionsHandlers.ts`)
- [ ] **2.12** Implement Versioning command handlers (`src/lib/server/commands/handlers/versioningHandlers.ts`)
- [ ] **2.13** Implement Review command handlers (`src/lib/server/commands/handlers/reviewHandlers.ts`)

### Phase 3: Skill Definitions (High Priority)

- [ ] **2.14** Create skill YAML files in `src/lib/skills/`
- [ ] **2.15** Create skill loader (`src/lib/skills/index.ts`)

### Phase 4: API Endpoints (Medium Priority)

- [ ] **2.16** Create `/api/skills/execute` endpoint
- [ ] **2.17** Create `/api/skills/list` endpoint
- [ ] **2.18** Create `/api/skills/config` endpoint

### Phase 5: UI Integration (High Priority)

- [ ] **2.19** Update `AIPanel.svelte` to use real Skill Engine instead of STUBS
- [ ] **2.20** Update `AISettings.svelte` to save user preferences
- [ ] **2.21** Add provider API key configuration UI
- [ ] **2.22** Add skill routing configuration UI

### Phase 6: Enhanced AI Service (Medium Priority)

- [ ] **2.23** Implement OpenAI integration in `router.ts`
- [ ] **2.24** Implement Gemini integration in `router.ts`
- [ ] **2.25** Add provider health checks
- [ ] **2.26** Add model availability detection

---

## 3. Component Specifications

### 3.1 Skill Engine (`src/lib/server/skills/engine.ts`)

**Responsibilities:**
- Load and parse skill YAML files
- Execute skill steps in sequence
- Maintain execution context between steps
- Resolve `{{variable}}` placeholders
- Handle errors according to `on_error` policy
- Log skill executions
- Manage AI model routing

**Key Methods:**
```typescript
class SkillEngine {
  constructor(private commandBus: CommandBus, private aiService: AIService);
  
  async execute(skillId: string, input?: SkillInput): Promise<SkillResult>;
  async executeStream(skillId: string, input?: SkillInput): AsyncGenerator<string, void, unknown>;
  
  getContext(skillId: string): SkillContext;
  clearContext(skillId: string): void;
  
  registerSkill(skill: SkillDefinition): void;
  unregisterSkill(skillId: string): void;
  getSkill(skillId: string): SkillDefinition | undefined;
  listSkills(): SkillDefinition[];
}
```

**Configuration:**
```typescript
interface SkillEngineConfig {
  skillDir: string;           // Directory containing skill YAML files
  maxContextSize: number;    // Max tokens to inject into prompts
  defaultProvider: string;   // Default AI provider
  enableFallback: boolean;   // Enable provider fallback
  logExecutions: boolean;    // Log skill executions to file
  logDir: string;           // Directory for execution logs
}
```

### 3.2 Command Bus (`src/lib/server/commands/bus.ts`)

**Responsibilities:**
- Receive CommandEvents from Skill Engine
- Route commands to registered handlers
- Manage command subscriptions
- Handle command errors
- Return results to callers

**Key Methods:**
```typescript
class CommandBus {
  constructor();
  
  emit(command: CommandEvent): Promise<unknown>;
  on(commandName: string, handler: CommandHandler): void;
  once(commandName: string, handler: CommandHandler): void;
  off(commandName: string, handler: CommandHandler): void;
  
  registerHandler(module: string, handler: ModuleHandler): void;
  unregisterHandler(module: string): void;
  
  listCommands(): string[];
  hasHandler(commandName: string): boolean;
}
```

**Command Event Structure:**
```typescript
interface CommandEvent {
  command: string;           // e.g., "ui.open_tab", "coherence.push_alert"
  params: Record<string, unknown>;
  on_error?: 'ignore' | 'abort' | 'notify';
  source?: string;           // Source skill ID
  timestamp: number;
}

interface CommandResult {
  success: boolean;
  data?: unknown;
  error?: Error;
  duration_ms: number;
}
```

### 3.3 Execution Context (`src/lib/server/skills/context.ts`)

**Responsibilities:**
- Maintain mutable state during skill execution
- Store results from tool calls and prompts
- Provide variable resolution for `{{...}}` placeholders
- Manage context lifecycle
- Handle context truncation for AI prompts

**Structure:**
```typescript
interface SkillContext {
  skill_id: string;
  trigger?: string;
  input: Record<string, unknown>;
  results: Record<string, unknown>;
  meta: {
    started_at: string;
    current_step: number;
    total_steps: number;
    errors: Error[];
    warnings: string[];
  };
  
  // Methods
  setResult(key: string, value: unknown): void;
  getResult(key: string): unknown;
  resolveVariable(ref: string): unknown;
  clear(): void;
}
```

### 3.4 Skill Definition Types (`src/lib/server/skills/types.ts`)

**Skill Definition:**
```typescript
interface SkillDefinition {
  id: string;
  description: string;
  trigger?: string | string[];
  task_type?: 'coherence' | 'style' | 'review' | 'suggestions' | 'chat' | 'custom';
  provider?: AIProvider;  // Override default provider for this skill
  model?: string;        // Override default model for this skill
  steps: SkillStep[];
  metadata?: {
    version: string;
    author: string;
    created_at: string;
    updated_at: string;
  };
}

type SkillStep = 
  | ToolStep 
  | PromptStep 
  | CommandStep;

interface BaseStep {
  id?: string;
  description?: string;
  on_error?: 'ignore' | 'abort' | 'notify';
  timeout?: number;  // Step timeout in ms
}

interface ToolStep extends BaseStep {
  type: 'tool';
  tool: string;  // MCP tool name (e.g., "read_bible", "read_chapter")
  params?: Record<string, string | number | boolean>;
}

interface PromptStep extends BaseStep {
  type: 'prompt';
  prompt: string;  // Prompt template with {{variable}} placeholders
  system_prompt?: string;
  model?: string;  // Override model for this prompt
  temperature?: number;
  max_tokens?: number;
  response_format?: 'text' | 'json' | 'yaml';
}

interface CommandStep extends BaseStep {
  type: 'command';
  command: string;  // Command name (e.g., "ui.open_tab", "coherence.push_alert")
  params?: Record<string, string | number | boolean>;
}
```

### 3.5 Command Types (`src/lib/server/commands/types.ts`)

**Command Categories:**
```typescript
type CommandModule = 
  | 'ui' | 'editor' | 'suggestions' | 'coherence' 
  | 'style' | 'versioning' | 'review' | 'app' | 'harden' | 'timeline';

type CommandName = 
  // UI Commands
  | 'ui.open_tab' | 'ui.scroll_to' | 'ui.highlight_range'
  | 'ui.show_notification' | 'ui.show_modal' | 'ui.set_spinner'
  | 'ui.focus_editor' | 'ui.toggle_focus_mode'
  
  // Editor Commands
  | 'editor.inject_text' | 'editor.replace_range'
  | 'editor.get_selection' | 'editor.get_full_text'
  
  // Suggestions Commands
  | 'suggestions.push_diff' | 'suggestions.clear'
  
  // Coherence Commands
  | 'coherence.push_alert' | 'coherence.clear'
  
  // Style Commands
  | 'style.push_signal' | 'style.clear'
  
  // Versioning Commands
  | 'harden.trigger' | 'timeline.refresh' | 'timeline.highlight_version'
  
  // Review Commands
  | 'review.push_report' | 'review.highlight_passage'
  
  // App Commands
  | 'app.export_file' | 'app.navigate_to' | 'app.reload_project'
  | 'app.run_skill';

interface CommandParams {
  // UI
  'ui.open_tab': { tab: string };
  'ui.scroll_to': { anchor: string };
  'ui.highlight_range': { start: number; end: number; color?: string };
  'ui.show_notification': { message: string; level: 'info' | 'warning' | 'error' | 'success' };
  'ui.show_modal': { title: string; content: string; actions?: string[] };
  'ui.set_spinner': { visible: boolean };
  'ui.focus_editor': {};
  'ui.toggle_focus_mode': { active: boolean };
  
  // Editor
  'editor.inject_text': { position: number; text: string };
  'editor.replace_range': { start: number; end: number; text: string };
  'editor.get_selection': {};
  'editor.get_full_text': {};
  
  // Suggestions
  'suggestions.push_diff': { original: string; proposal: string; context?: string };
  'suggestions.clear': {};
  
  // Coherence
  'coherence.push_alert': { entity: string; discrepancy_type: string; confidence: 'Low' | 'Medium' | 'High'; note: string };
  'coherence.clear': {};
  
  // Style
  'style.push_signal': { location: string; signal: string; suggestion: string };
  'style.clear': {};
  
  // Versioning
  'harden.trigger': { label: string; message: string };
  'timeline.refresh': {};
  'timeline.highlight_version': { id: string };
  
  // Review
  'review.push_report': { report: unknown };
  'review.highlight_passage': { start: number; end: number; report_section: string };
  
  // App
  'app.export_file': { content: string; format: 'md' | 'pdf' | 'yaml'; name: string };
  'app.navigate_to': { screen: string };
  'app.reload_project': {};
  'app.run_skill': { skill_id: string; params?: Record<string, unknown> };
}
```

---

## 4. API Endpoints Specification

### 4.1 Execute Skill Endpoint

**Path:** `POST /api/skills/execute`  
**Method:** POST  
**Content-Type:** application/json

**Request Body:**
```typescript
{
  "skill_id": string;
  "input"?: Record<string, unknown>;
  "stream"?: boolean;  // default: false
}
```

**Response (non-streaming):**
```typescript
{
  "success": boolean;
  "result"?: unknown;
  "error"?: string;
  "skill_id": string;
  "duration_ms": number;
  "steps_executed": number;
  "warnings": string[];
}
```

**Response (streaming):** Server-Sent Events (SSE)
- Event: `data` - Stream chunk
- Event: `result` - Final result
- Event: `error` - Error message
- Event: `done` - Execution complete

### 4.2 List Skills Endpoint

**Path:** `GET /api/skills/list`  
**Method:** GET

**Response:**
```typescript
{
  "skills": Array<{
    id: string;
    description: string;
    task_type?: string;
    trigger?: string | string[];
    metadata?: {
      version: string;
      author: string;
      created_at: string;
    };
  }>;
}
```

### 4.3 Skill Configuration Endpoint

**Path:** `GET|POST /api/skills/config`  
**Method:** GET, POST

**GET Response:**
```typescript
{
  "routing": {
    coherence: { provider: string; model: string };
    style: { provider: string; model: string };
    review: { provider: string; model: string };
    suggestions: { provider: string; model: string };
    chat: { provider: string; model: string };
    fallback: { provider: string; model: string };
  };
  "providers": {
    ollama: { enabled: boolean; base_url: string; default_model: string };
    anthropic: { enabled: boolean; api_key_configured: boolean };
    openai: { enabled: boolean; api_key_configured: boolean };
    gemini: { enabled: boolean; api_key_configured: boolean };
  };
}
```

**POST Request Body:**
```typescript
{
  "routing"?: Partial<Record<string, { provider: string; model: string }>>;
  "providers"?: {
    ollama?: { enabled: boolean; base_url?: string; default_model?: string };
    anthropic?: { enabled: boolean };
    openai?: { enabled: boolean };
    gemini?: { enabled: boolean };
  };
}
```

---

## 5. UI Integration Points

### 5.1 AIPanel.svelte Updates

**Current (using STUBS):**
```typescript
import { STUB_ALERTS } from '$lib/coherenceStore.svelte.js';
import { STUB_SUGGESTIONS } from '$lib/suggestionsStore.svelte.js';
```

**Target (using Skill Engine):**
```typescript
import { skillEngine } from '$lib/server/skills/engine';
import { commandBus } from '$lib/server/commands/bus';

// Instead of STUB_ALERTS, execute:
skillEngine.execute('skill_coherence', {
  current_chapter: activeChapter
});
```

### 5.2 Coherence Tab Integration

```svelte
<script lang="ts">
  async function checkCoherence() {
    setAnalysing(true);
    
    try {
      const result = await fetch('/api/skills/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_id: 'skill_coherence',
          input: { current_chapter: currentChapterId }
        })
      });
      
      const data = await result.json();
      // Alerts are automatically pushed via Command Bus
      coherenceStore.setAlerts(data.alerts);
    } finally {
      setAnalysing(false);
    }
  }
</script>
```

### 5.3 Style Tab Integration

```svelte
<script lang="ts">
  async function analyseStyle() {
    setAnalysing(true);
    
    try {
      const result = await fetch('/api/skills/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_id: 'skill_style',
          input: {
            scope: currentChapterId,
            active_narrator: narratorId
          }
        })
      });
      
      const data = await result.json();
      // Signals are automatically pushed via Command Bus
    } finally {
      setAnalysing(false);
    }
  }
</script>
```

---

## 6. File Implementation Templates

### 6.1 Skill Engine Implementation Template

`src/lib/server/skills/engine.ts`:

```typescript
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { AIService, type AIRequest } from '../ai/service';
import { CommandBus } from '../commands/bus';
import type {
  SkillDefinition,
  SkillStep,
  SkillContext,
  SkillInput,
  SkillResult,
  SkillEngineConfig
} from './types';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_CONFIG: SkillEngineConfig = {
  skillDir: join(__dirname, '..', '..', '..', 'lib', 'skills'),
  maxContextSize: 16000,
  defaultProvider: 'ollama',
  enableFallback: true,
  logExecutions: true,
  logDir: './.skills_log'
};

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
  
  private loadSkills(): void {
    try {
      const files = readdirSync(this.config.skillDir);
      for (const file of files) {
        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
          const path = join(this.config.skillDir, file);
          const content = readFileSync(path, 'utf-8');
          const skill = yaml.load(content) as SkillDefinition;
          this.skills.set(skill.id, skill);
        }
      }
    } catch (err) {
      console.error('[SkillEngine] Failed to load skills:', err);
    }
  }
  
  async execute(skillId: string, input: SkillInput = {}): Promise<SkillResult> {
    const startTime = Date.now();
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
          await this.executeStep(skill, step, context);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          context.meta.errors.push(error);
          
          switch (step.on_error) {
            case 'abort':
              throw error;
            case 'notify':
              context.meta.warnings.push(`Step ${i + 1} failed: ${error.message}`);
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
  
  private async executeStep(skill: SkillDefinition, step: SkillStep, context: SkillContext): Promise<void> {
    switch (step.type) {
      case 'tool':
        await this.executeToolStep(step, context);
        break;
      case 'prompt':
        await this.executePromptStep(step, context);
        break;
      case 'command':
        await this.executeCommandStep(step, context);
        break;
      default:
        throw new Error(`Unknown step type: ${(step as SkillStep).type}`);
    }
  }
  
  private async executeToolStep(step: Extract<SkillStep, { type: 'tool' }>, context: SkillContext): Promise<void> {
    // Import MCP tools dynamically to avoid circular dependencies
    const { MCP_TOOLS, executeMCPTool } = await import('../mcp/tools');
    
    const resolvedParams = this.resolveParams(step.params || {}, context);
    const toolName = step.tool as keyof typeof MCP_TOOLS;
    
    const result = executeMCPTool(toolName, ...Object.values(resolvedParams));
    const resultKey = `result_${step.tool}`;
    context.results[resultKey] = result;
  }
  
  private async executePromptStep(step: Extract<SkillStep, { type: 'prompt' }>, context: SkillContext): Promise<void> {
    const resolvedPrompt = this.resolveString(step.prompt, context);
    const resolvedSystemPrompt = step.system_prompt ? this.resolveString(step.system_prompt, context) : undefined;
    
    const taskType = skill.task_type || 'custom';
    const provider = step.model ? step.model.split('/')[0] as AIProvider : undefined;
    
    const request: AIRequest = {
      prompt: resolvedPrompt,
      systemPrompt: resolvedSystemPrompt,
      taskType,
      provider,
      config: {
        temperature: step.temperature,
        maxTokens: step.max_tokens
      }
    };
    
    const response = await this.aiService.generate(request);
    
    context.results.prompt_result = this.parseResponse(response.content, step.response_format);
  }
  
  private async executeCommandStep(step: Extract<SkillStep, { type: 'command' }>, context: SkillContext): Promise<void> {
    const resolvedParams = this.resolveParams(step.params || {}, context);
    
    const result = await this.commandBus.emit({
      command: step.command,
      params: resolvedParams,
      on_error: step.on_error,
      source: context.skill_id
    });
    
    if (result !== undefined) {
      const resultKey = `result_${step.command.replace('.', '_')}`;
      context.results[resultKey] = result;
    }
  }
  
  private resolveString(template: string, context: SkillContext): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, ref) => {
      const value = this.resolveVariable(ref.trim(), context);
      return value !== undefined ? String(value) : `{{${ref}}}`;
    });
  }
  
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
  
  private resolveVariable(ref: string, context: SkillContext): unknown {
    // 1. Check input
    if (context.input && ref in context.input) {
      return context.input[ref];
    }
    
    // 2. Check results
    if (context.results && ref in context.results) {
      return context.results[ref];
    }
    
    // 3. Check app state (would be injected)
    // This would be extended with app state access
    
    // 4. Return undefined
    return undefined;
  }
  
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
  
  getContext(skillId: string): SkillContext | undefined {
    return this.contexts.get(skillId);
  }
  
  clearContext(skillId: string): void {
    this.contexts.delete(skillId);
  }
  
  registerSkill(skill: SkillDefinition): void {
    this.skills.set(skill.id, skill);
  }
  
  unregisterSkill(skillId: string): void {
    this.skills.delete(skillId);
  }
  
  getSkill(skillId: string): SkillDefinition | undefined {
    return this.skills.get(skillId);
  }
  
  listSkills(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }
}
```

### 6.2 Command Bus Implementation Template

`src/lib/server/commands/bus.ts`:

```typescript
import type { CommandEvent, CommandResult, CommandHandler } from './types';

export class CommandBus {
  private handlers: Map<string, CommandHandler[]> = new Map();
  private moduleHandlers: Map<string, Record<string, CommandHandler>> = new Map();
  
  constructor() {}
  
  async emit(event: CommandEvent): Promise<unknown> {
    const command = event.command;
    const handlers = this.handlers.get(command);
    
    if (!handlers || handlers.length === 0) {
      console.warn(`[CommandBus] No handlers for command: ${command}`);
      return undefined;
    }
    
    let lastResult: unknown;
    let lastError: Error | undefined;
    
    for (const handler of handlers) {
      try {
        const result = await handler(event);
        lastResult = result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Command handler error');
        
        if (event.on_error === 'abort') {
          throw lastError;
        } else if (event.on_error === 'notify') {
          // Would trigger notification
          console.error(`[CommandBus] Command ${command} failed:`, lastError);
        }
        // 'ignore' or undefined: continue
      }
    }
    
    if (lastError && event.on_error === 'abort') {
      throw lastError;
    }
    
    return lastResult;
  }
  
  on(command: string, handler: CommandHandler): void {
    if (!this.handlers.has(command)) {
      this.handlers.set(command, []);
    }
    this.handlers.get(command)!.push(handler);
  }
  
  once(command: string, handler: CommandHandler): void {
    const wrapped: CommandHandler = async (event) => {
      const result = await handler(event);
      this.off(command, wrapped);
      return result;
    };
    this.on(command, wrapped);
  }
  
  off(command: string, handler: CommandHandler): void {
    const handlers = this.handlers.get(command);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index >= 0) {
        handlers.splice(index, 1);
      }
    }
  }
  
  registerModule(module: string, handlers: Record<string, CommandHandler>): void {
    this.moduleHandlers.set(module, handlers);
    
    for (const [command, handler] of Object.entries(handlers)) {
      const fullCommand = `${module}.${command}`;
      this.on(fullCommand, handler);
    }
  }
  
  unregisterModule(module: string): void {
    const handlers = this.moduleHandlers.get(module);
    if (!handlers) return;
    
    for (const command of Object.keys(handlers)) {
      const fullCommand = `${module}.${command}`;
      this.off(fullCommand, handlers[command]);
    }
    
    this.moduleHandlers.delete(module);
  }
  
  listCommands(): string[] {
    return Array.from(this.handlers.keys());
  }
  
  hasHandler(command: string): boolean {
    return this.handlers.has(command) && this.handlers.get(command)!.length > 0;
  }
}

export const commandBus = new CommandBus();
```

### 6.3 UI Command Handlers Template

`src/lib/server/commands/handlers/uiHandlers.ts`:

```typescript
import type { CommandEvent, CommandResult } from '../types';
import { toastStore } from '$lib/toastStore.svelte';
import { aiProcessingStore } from '$lib/aiProcessingStore.svelte';

interface UICommandParams {
  'ui.open_tab': { tab: string };
  'ui.scroll_to': { anchor: string };
  'ui.highlight_range': { start: number; end: number; color?: string };
  'ui.show_notification': { message: string; level: 'info' | 'warning' | 'error' | 'success' };
  'ui.show_modal': { title: string; content: string; actions?: string[] };
  'ui.set_spinner': { visible: boolean };
  'ui.focus_editor': {};
  'ui.toggle_focus_mode': { active: boolean };
}

function getParams<T extends keyof UICommandParams>(event: CommandEvent): UICommandParams[T] {
  return event.params as UICommandParams[T];
}

export const uiHandlers = {
  open_tab: async (event: CommandEvent): Promise<void> => {
    const { tab } = getParams<'ui.open_tab'>(event);
    // This would trigger the tab change in the UI
    // Implementation depends on the store/state management used
    // For now, we can use a custom event or store
    window.dispatchEvent(new CustomEvent('ai:open-tab', { detail: { tab } }));
  },
  
  scroll_to: async (event: CommandEvent): Promise<void> => {
    const { anchor } = getParams<'ui.scroll_to'>(event);
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  },
  
  highlight_range: async (event: CommandEvent): Promise<void> => {
    const { start, end, color } = getParams<'ui.highlight_range'>(event);
    // Implement highlighting logic
    window.dispatchEvent(new CustomEvent('editor:highlight', { detail: { start, end, color } }));
  },
  
  show_notification: async (event: CommandEvent): Promise<void> => {
    const { message, level } = getParams<'ui.show_notification'>(event);
    // Map to toastStore levels
    const toastLevel = level === 'error' ? 'error' : level === 'warning' ? 'warning' : 'info';
    toastStore[toastLevel](message);
  },
  
  show_modal: async (event: CommandEvent): Promise<string | undefined> => {
    const { title, content, actions } = getParams<'ui.show_modal'>(event);
    // This would open a modal and return the user's choice
    // For now, return a default value or implement a promise-based modal
    return new Promise((resolve) => {
      window.dispatchEvent(new CustomEvent('modal:show', {
        detail: { title, content, actions, resolve }
      }));
      // Timeout fallback
      setTimeout(() => resolve('confirm'), 30000);
    });
  },
  
  set_spinner: async (event: CommandEvent): Promise<void> => {
    const { visible } = getParams<'ui.set_spinner'>(event);
    aiProcessingStore.set(visible);
  },
  
  focus_editor: async (): Promise<void> => {
    const editor = document.querySelector('.editor-textarea') as HTMLTextAreaElement;
    if (editor) {
      editor.focus();
    }
  },
  
  toggle_focus_mode: async (event: CommandEvent): Promise<void> => {
    const { active } = getParams<'ui.toggle_focus_mode'>(event);
    window.dispatchEvent(new CustomEvent('focus:toggle', { detail: { active } }));
  }
};
```

---

## 7. Configuration Management

### 7.1 User Configuration Schema

`src/lib/types/aiConfig.ts`:

```typescript
export interface AIProviderConfig {
  enabled: boolean;
  apiKey?: string;  // Only stored locally, never in the codebase
  baseUrl?: string;
  defaultModel?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface SkillRoutingConfig {
  coherence: { provider: string; model: string };
  style: { provider: string; model: string };
  review: { provider: string; model: string };
  suggestions: { provider: string; model: string };
  chat: { provider: string; model: string };
  fallback: { provider: string; model: string };
}

export interface AIConfig {
  version: string;
  providers: {
    ollama: AIProviderConfig & { baseUrl: string };
    anthropic: AIProviderConfig;
    openai: AIProviderConfig;
    gemini: AIProviderConfig;
  };
  routing: SkillRoutingConfig;
  settings: {
    enableFallback: boolean;
    streamingEnabled: boolean;
    maxRetries: number;
  };
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  version: '1.0',
  providers: {
    ollama: { enabled: true, baseUrl: 'http://localhost:11434' },
    anthropic: { enabled: false },
    openai: { enabled: false },
    gemini: { enabled: false }
  },
  routing: {
    coherence: { provider: 'ollama', model: 'mistral' },
    style: { provider: 'ollama', model: 'mistral' },
    review: { provider: 'anthropic', model: 'claude-haiku-4-5' },
    suggestions: { provider: 'anthropic', model: 'claude-haiku-4-5' },
    chat: { provider: 'anthropic', model: 'claude-haiku-4-5' },
    fallback: { provider: 'ollama', model: 'mistral' }
  },
  settings: {
    enableFallback: true,
    streamingEnabled: true,
    maxRetries: 2
  }
};
```

### 7.2 Configuration Store

`src/lib/stores/aiConfigStore.svelte.ts`:

```typescript
import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { AIConfig } from '$lib/types/aiConfig';
import { DEFAULT_AI_CONFIG } from '$lib/types/aiConfig';

const CONFIG_KEY = 'sive:ai-config';

function createAIConfigStore() {
  const { subscribe, set, update } = writable<AIConfig>(DEFAULT_AI_CONFIG);
  
  if (browser) {
    // Load from localStorage
    try {
      const saved = localStorage.getItem(CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ ...DEFAULT_AI_CONFIG, ...parsed });
      }
    } catch {
      // Use defaults
    }
  }
  
  function save(config: AIConfig): void {
    if (browser) {
      // Don't save API keys to localStorage for security
      // (they should be stored in a more secure way or entered each session)
      const safeConfig = {
        ...config,
        providers: {
          ...config.providers,
          anthropic: { ...config.providers.anthropic, apiKey: undefined },
          openai: { ...config.providers.openai, apiKey: undefined },
          gemini: { ...config.providers.gemini, apiKey: undefined }
        }
      };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(safeConfig));
    }
    set(config);
  }
  
  return {
    subscribe,
    set,
    update,
    save
  };
}

export const aiConfigStore = createAIConfigStore();
```

---

## 8. Implementation Order Recommendation

Based on dependencies, implement in this order:

### Week 1: Core Infrastructure
1. **Day 1:** Type definitions (`types.ts` files)
2. **Day 1:** Command Bus (`bus.ts`, `registry.ts`)
3. **Day 2:** Command Handlers (start with UI handlers)
4. **Day 3:** Skill Engine (`engine.ts`, `context.ts`, `registry.ts`)
5. **Day 4:** Skill YAML definitions
6. **Day 5:** API endpoints

### Week 2: Integration
7. **Day 6:** Update AIPanel.svelte
8. **Day 7:** Update AISettings.svelte with config persistence
9. **Day 8:** Add provider API key UI
10. **Day 9:** Test coherence flow
11. **Day 10:** Test style flow

### Week 3: Enhancements
12. **Day 11:** Implement streaming for skills
13. **Day 12:** Add execution logging
14. **Day 13:** Implement remaining providers (OpenAI, Gemini)
15. **Day 14:** Add error handling and fallback
16. **Day 15:** Performance optimization

---

## 9. Testing Strategy

### 9.1 Unit Tests
- Skill Engine step execution
- Command Bus routing
- Variable resolution
- Context management
- Error handling

### 9.2 Integration Tests
- End-to-end skill execution
- MCP tool integration
- AI service integration
- UI command handling

### 9.3 E2E Tests
- User flows: coherence check, style analysis, review mode
- Configuration changes persistence
- Provider switching
- Error recovery

---

## 10. Migration Notes

### 10.1 Breaking Changes
- None initially — new features are additive
- STUB data can remain as fallback

### 10.2 Backward Compatibility
- Existing code continues to work
- STUBS can be gradually replaced
- API endpoints are new, don't affect existing routes

### 10.3 Rollout Strategy
1. Implement core infrastructure (Skill Engine, Command Bus)
2. Create skill definitions
3. Add API endpoints
4. Update UI to use new system
5. Test thoroughly
6. Remove STUBS (optional, can keep as fallback)

---

## 11. File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/server/skills/engine.ts` | CREATE | Core Skill Engine |
| `src/lib/server/skills/registry.ts` | CREATE | Skill registry |
| `src/lib/server/skills/context.ts` | CREATE | Execution context |
| `src/lib/server/skills/types.ts` | CREATE | Type definitions |
| `src/lib/server/commands/bus.ts` | CREATE | Command Bus |
| `src/lib/server/commands/registry.ts` | CREATE | Command registry |
| `src/lib/server/commands/handlers/uiHandlers.ts` | CREATE | UI handlers |
| `src/lib/server/commands/handlers/editorHandlers.ts` | CREATE | Editor handlers |
| `src/lib/server/commands/handlers/coherenceHandlers.ts` | CREATE | Coherence handlers |
| `src/lib/server/commands/handlers/styleHandlers.ts` | CREATE | Style handlers |
| `src/lib/server/commands/handlers/suggestionsHandlers.ts` | CREATE | Suggestions handlers |
| `src/lib/server/commands/handlers/versioningHandlers.ts` | CREATE | Versioning handlers |
| `src/lib/server/commands/handlers/reviewHandlers.ts` | CREATE | Review handlers |
| `src/lib/server/commands/types.ts` | CREATE | Command types |
| `src/lib/skills/skill_coherence.yaml` | CREATE | Skill definition |
| `src/lib/skills/skill_style.yaml` | CREATE | Skill definition |
| `src/lib/skills/skill_review.yaml` | CREATE | Skill definition |
| `src/lib/skills/skill_suggestions.yaml` | CREATE | Skill definition |
| `src/lib/skills/skill_version_description.yaml` | CREATE | Skill definition |
| `src/lib/skills/index.ts` | CREATE | Skill loader |
| `src/routes/api/skills/execute/+server.ts` | CREATE | API endpoint |
| `src/routes/api/skills/list/+server.ts` | CREATE | API endpoint |
| `src/routes/api/skills/config/+server.ts` | CREATE | API endpoint |
| `src/lib/types/aiConfig.ts` | CREATE | Config types |
| `src/lib/stores/aiConfigStore.svelte.ts` | CREATE | Config store |
| `src/lib/elements/AIPanel.svelte` | MODIFY | Use Skill Engine |
| `src/lib/elements/AISettings.svelte` | MODIFY | Save config |
| `src/lib/server/ai/router.ts` | MODIFY | Implement missing providers |

---

*Document generated for BMAD-Method compliance. Implementation follows the architecture described in [5-ai-architecture-mcp-skills](./5-ai-architecture-mcp-skills.md).*
