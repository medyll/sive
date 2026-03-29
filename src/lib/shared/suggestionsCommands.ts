/**
 * Suggestions Command Handlers
 * 
 * Registers suggestion-related commands in the Command Bus.
 */

import { registerCommand } from '$lib/shared/commandBus';

interface PushDiffParams {
	original: string;
	proposal: string;
	id?: string;
}

interface ClearParams {
	// No params
}

/**
 * Initialize suggestions command handlers
 */
export function initSuggestionsCommands(): void {
	// suggestions.push_diff - Pushes a diff to the Suggestions tab
	registerCommand<PushDiffParams, void>(
		'suggestions.push_diff',
		({ original, proposal, id }) => {
			console.log(`[Suggestions Command] Pushing diff ${id || 'new'}`);
			// In real app: suggestionsStore.add({ id, original, proposal });
		},
		'Adds a suggestion diff to the Suggestions panel'
	);

	// suggestions.clear - Clears the current suggestion list
	registerCommand<ClearParams, void>(
		'suggestions.clear',
		() => {
			console.log('[Suggestions Command] Clearing suggestions');
			// In real app: suggestionsStore.clear();
		},
		'Clears all current suggestions'
	);

	console.log('[Suggestions Commands] Registered');
}
