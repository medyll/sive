/**
 * Style Command Handlers
 * 
 * Registers style-related commands in the Command Bus.
 */

import { registerCommand } from '$lib/shared/commandBus';

interface Signal {
	location: string;
	signal: string;
	suggestion: string;
}

interface PushSignalParams {
	location: string;
	signal: string;
	suggestion: string;
}

interface PushSignalsParams {
	signals: Signal[];
}

interface ClearParams {
	// No params
}

/**
 * Initialize style command handlers
 */
export function initStyleCommands(): void {
	// style.push_signal - Adds a single signal to the Style tab
	registerCommand<PushSignalParams, void>(
		'style.push_signal',
		({ location, signal, suggestion }) => {
			console.log(`[Style Command] Signal: ${signal} at ${location}`);
			// In real app: styleStore.addSignal({ location, signal, suggestion });
		},
		'Adds a style signal to the Style panel'
	);

	// style.push_signals - Adds multiple signals at once
	registerCommand<PushSignalsParams, void>(
		'style.push_signals',
		({ signals }) => {
			console.log(`[Style Command] Pushing ${signals.length} signals`);
			// In real app: signals.forEach(s => styleStore.addSignal(s));
		},
		'Adds multiple style signals at once'
	);

	// style.clear - Clears current signals
	registerCommand<ClearParams, void>(
		'style.clear',
		() => {
			console.log('[Style Command] Clearing signals');
			// In real app: styleStore.clear();
		},
		'Clears all style signals'
	);

	console.log('[Style Commands] Registered');
}
