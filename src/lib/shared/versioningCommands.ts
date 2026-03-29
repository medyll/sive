/**
 * Versioning (Harden) Command Handlers
 * 
 * Registers versioning-related commands in the Command Bus.
 */

import { registerCommand } from '$lib/shared/commandBus';

interface TriggerParams {
	label: string;
	message: string;
}

interface HighlightVersionParams {
	id: string;
}

interface ClearParams {
	// No params
}

/**
 * Initialize versioning command handlers
 */
export function initVersioningCommands(): void {
	// harden.trigger - Triggers a versioning snapshot
	registerCommand<TriggerParams, Promise<string>>(
		'harden.trigger',
		async ({ label, message }) => {
			console.log(`[Harden Command] Creating version: ${label}`);
			// In real app: const id = await hardenStore.create(label, message);
			// return id;
			return 'h001'; // Stub
		},
		'Creates a new Harden (version) snapshot'
	);

	// timeline.refresh - Refreshes the version timeline
	registerCommand<ClearParams, void>(
		'timeline.refresh',
		() => {
			console.log('[Harden Command] Refreshing timeline');
			// In real app: timelineStore.load();
		},
		'Refreshes the version timeline display'
	);

	// timeline.highlight_version - Highlights a version on the timeline
	registerCommand<HighlightVersionParams, void>(
		'timeline.highlight_version',
		({ id }) => {
			console.log(`[Harden Command] Highlighting version: ${id}`);
			// In real app: timelineStore.highlight(id);
		},
		'Highlights a specific version on the timeline'
	);

	console.log('[Versioning Commands] Registered');
}
