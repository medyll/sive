/**
 * Command Handlers Index
 * 
 * Central export point for all command handlers.
 * Register all handlers with the Command Bus on initialization.
 * 
 * Follows the architecture described in BMAD:
 * bmad/references/project/5-ai-architecture-mcp-skills.md
 * bmad/references/project/11-technical-implementation.md
 */

import { commandBus, CommandBus } from '../bus';
import type { ModuleHandler } from '../types';

// Import all handler modules
import * as uiHandlersModule from './uiHandlers';

// Extract the individual handler groups from the module
export const uiHandlers = uiHandlersModule.uiHandlers;
export const editorHandlers = uiHandlersModule.editorHandlers;
export const coherenceHandlers = uiHandlersModule.coherenceHandlers;
export const styleHandlers = uiHandlersModule.styleHandlers;
export const suggestionsHandlers = uiHandlersModule.suggestionsHandlers;
export const reviewHandlers = uiHandlersModule.reviewHandlers;
export const versioningHandlers = uiHandlersModule.versioningHandlers;
export const appHandlers = uiHandlersModule.appHandlers;

// Re-export everything from the module for convenience
export * from './uiHandlers';

/**
 * All handler modules as a single object
 * Used for registering all handlers at once
 */
export const ALL_HANDLERS: Record<string, ModuleHandler> = {
  ui: {
    open_tab: uiHandlers.open_tab,
    scroll_to: uiHandlers.scroll_to,
    highlight_range: uiHandlers.highlight_range,
    show_notification: uiHandlers.show_notification,
    show_modal: uiHandlers.show_modal,
    set_spinner: uiHandlers.set_spinner,
    focus_editor: uiHandlers.focus_editor,
    toggle_focus_mode: uiHandlers.toggle_focus_mode
  },
  coherence: {
    push_alert: coherenceHandlers.push_alert,
    clear: coherenceHandlers.clear
  },
  style: {
    push_signal: styleHandlers.push_signal,
    clear: styleHandlers.clear
  },
  suggestions: {
    push_diff: suggestionsHandlers.push_diff,
    clear: suggestionsHandlers.clear
  },
  review: {
    push_report: reviewHandlers.push_report,
    highlight_passage: reviewHandlers.highlight_passage
  },
  harden: {
    trigger: versioningHandlers.trigger
  },
  timeline: {
    refresh: versioningHandlers.refresh,
    highlight_version: versioningHandlers.highlight_version
  },
  app: {
    export_file: appHandlers.export_file,
    navigate_to: appHandlers.navigate_to,
    reload_project: appHandlers.reload_project,
    run_skill: appHandlers.run_skill
  },
  editor: {
    inject_text: editorHandlers.inject_text,
    replace_range: editorHandlers.replace_range,
    get_selection: editorHandlers.get_selection,
    get_full_text: editorHandlers.get_full_text
  }
};

/**
 * Register all handlers with a Command Bus instance
 */
export function registerAllHandlers(bus: CommandBus = commandBus): void {
  for (const [module, handlers] of Object.entries(ALL_HANDLERS)) {
    bus.registerModule(module, handlers);
  }
}

/**
 * Unregister all handlers from a Command Bus instance
 */
export function unregisterAllHandlers(bus: CommandBus = commandBus): void {
  for (const module of Object.keys(ALL_HANDLERS)) {
    bus.unregisterModule(module);
  }
}

/**
 * Initialize the Command Bus with all handlers
 * Call this during application startup
 */
export function initializeCommandBus(): CommandBus {
  const bus = new CommandBus();
  registerAllHandlers(bus);
  return bus;
}

// Auto-register handlers with the default bus on import
// This ensures handlers are available as soon as the module is imported
registerAllHandlers();
