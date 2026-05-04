/**
 * Command Bus Types
 * 
 * Type definitions for the Command Bus and command handlers.
 * Follows the architecture described in BMAD: bmad/references/project/5-ai-architecture-mcp-skills.md
 */

// ============================================================================
// Command Categories
// ============================================================================

/**
 * Available command modules
 */
export type CommandModule = 
  | 'ui' | 'editor' | 'suggestions' | 'coherence' 
  | 'style' | 'versioning' | 'review' | 'app' | 'harden' | 'timeline';

/**
 * All available command names
 */
export type CommandName = 
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

// ============================================================================
// Command Event Types
// ============================================================================

/**
 * Event emitted to the Command Bus
 */
export interface CommandEvent {
  command: CommandName | string;  // Allows custom commands
  params: Record<string, unknown>;
  on_error?: 'ignore' | 'abort' | 'notify';
  source?: string;  // Source skill ID
  timestamp: number;
}

/**
 * Result of a command execution
 */
export interface CommandResult {
  success: boolean;
  data?: unknown;
  error?: Error;
  duration_ms: number;
}

// ============================================================================
// Command Parameters Types
// ============================================================================

/**
 * Parameter types for each command
 * This discriminated union allows type-safe access to command parameters
 */
export interface CommandParams {
  // UI Commands
  'ui.open_tab': { tab: string };
  'ui.scroll_to': { anchor: string };
  'ui.highlight_range': { start: number; end: number; color?: string };
  'ui.show_notification': { message: string; level: 'info' | 'warning' | 'error' | 'success' };
  'ui.show_modal': { title: string; content: string; actions?: string[] };
  'ui.set_spinner': { visible: boolean };
  'ui.focus_editor': Record<string, never>;
  'ui.toggle_focus_mode': { active: boolean };
  
  // Editor Commands
  'editor.inject_text': { position: number; text: string };
  'editor.replace_range': { start: number; end: number; text: string };
  'editor.get_selection': Record<string, never>;
  'editor.get_full_text': Record<string, never>;
  
  // Suggestions Commands
  'suggestions.push_diff': { original: string; proposal: string; context?: string };
  'suggestions.clear': Record<string, never>;
  
  // Coherence Commands
  'coherence.push_alert': { 
    entity: string; 
    discrepancy_type: string; 
    confidence: 'Low' | 'Medium' | 'High'; 
    note: string 
  };
  'coherence.clear': Record<string, never>;
  
  // Style Commands
  'style.push_signal': { location: string; signal: string; suggestion: string };
  'style.clear': Record<string, never>;
  
  // Versioning Commands
  'harden.trigger': { label: string; message: string };
  'timeline.refresh': Record<string, never>;
  'timeline.highlight_version': { id: string };
  
  // Review Commands
  'review.push_report': { report: unknown };
  'review.highlight_passage': { start: number; end: number; report_section: string };
  
  // App Commands
  'app.export_file': { content: string; format: 'md' | 'pdf' | 'yaml'; name: string };
  'app.navigate_to': { screen: string };
  'app.reload_project': Record<string, never>;
  'app.run_skill': { skill_id: string; params?: Record<string, unknown> };
}

/**
 * Helper type to get parameters for a specific command
 */
export type CommandParamsFor<T extends CommandName> = CommandParams[T];

// ============================================================================
// Command Handler Types
// ============================================================================

/**
 * Function type for command handlers
 * Takes a CommandEvent and returns a Promise of the result
 */
export type CommandHandler<T = unknown> = (event: CommandEvent) => Promise<T>;

/**
 * Function type for module handlers (handlers for a specific module)
 */
export type ModuleHandler = Record<string, CommandHandler>;

/**
 * Registry of all command handlers
 */
export type CommandHandlerRegistry = Map<CommandName | string, CommandHandler[]>;

/**
 * Registry of module handlers
 */
export type ModuleHandlerRegistry = Map<string, ModuleHandler>;

// ============================================================================
// Command Bus Configuration
// ============================================================================

/**
 * Configuration options for the Command Bus
 */
export interface CommandBusConfig {
  maxHandlerRetries: number;  // Max retries for failed handlers
  defaultOnError: 'ignore' | 'abort' | 'notify';  // Default error behavior
  logCommands: boolean;  // Log all command executions
}
