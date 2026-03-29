/**
 * Command Bus - All Commands Index
 * 
 * Central initialization for all command handlers.
 * Import and call initAllCommands() during app startup.
 */

import { initUICommands } from './uiCommands';
import { initEditorCommands } from './editorCommands';
import { initSuggestionsCommands } from './suggestionsCommands';
import { initCoherenceCommands } from './coherenceCommands';
import { initStyleCommands } from './styleCommands';
import { initVersioningCommands } from './versioningCommands';
import { initReviewCommands } from './reviewCommands';
import { commandBus } from './commandBus';

/**
 * Initialize all command handlers
 * Call this once during app startup
 */
export function initAllCommands(): void {
	console.log('[CommandBus] Initializing all command handlers...');
	
	initUICommands();
	initEditorCommands();
	initSuggestionsCommands();
	initCoherenceCommands();
	initStyleCommands();
	initVersioningCommands();
	initReviewCommands();

	console.log('[CommandBus] All commands initialized');
	console.log('[CommandBus] Registered commands:', commandBus.listCommands().length);
}

/**
 * Get summary of all registered commands by module
 */
export function getCommandSummary(): Record<string, number> {
	const commands = commandBus.listCommands();
	const summary: Record<string, number> = {};

	commands.forEach(({ module }) => {
		summary[module] = (summary[module] || 0) + 1;
	});

	return summary;
}

/**
 * Export all command modules for selective initialization
 */
export {
	initUICommands,
	initEditorCommands,
	initSuggestionsCommands,
	initCoherenceCommands,
	initStyleCommands,
	initVersioningCommands,
	initReviewCommands
};

/**
 * Export core CommandBus for direct access
 */
export { commandBus, CommandBus, registerCommand, executeCommand } from './commandBus';
export type { CommandEvent, CommandHandler } from './commandBus';
