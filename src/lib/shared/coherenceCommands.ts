/**
 * Coherence Command Handlers
 * 
 * Registers coherence-related commands in the Command Bus.
 */

import { registerCommand } from '$lib/shared/commandBus';

interface Alert {
	entity: string;
	discrepancy_type: string;
	confidence: 'Low' | 'Medium' | 'High';
	note: string;
}

interface PushAlertParams {
	entity: string;
	discrepancy_type: string;
	confidence: 'Low' | 'Medium' | 'High';
	note: string;
}

interface PushAlertsParams {
	alerts: Alert[];
}

interface ClearParams {
	// No params
}

/**
 * Initialize coherence command handlers
 */
export function initCoherenceCommands(): void {
	// coherence.push_alert - Adds a single alert to the Coherence tab
	registerCommand<PushAlertParams, void>(
		'coherence.push_alert',
		({ entity, discrepancy_type, confidence, note }) => {
			console.log(`[Coherence Command] Alert: ${entity} - ${discrepancy_type} (${confidence})`);
			// In real app: coherenceStore.addAlert({ entity, discrepancy_type, confidence, note });
		},
		'Adds a coherence alert to the Coherence panel'
	);

	// coherence.push_alerts - Adds multiple alerts at once
	registerCommand<PushAlertsParams, void>(
		'coherence.push_alerts',
		({ alerts }) => {
			console.log(`[Coherence Command] Pushing ${alerts.length} alerts`);
			// In real app: alerts.forEach(alert => coherenceStore.addAlert(alert));
		},
		'Adds multiple coherence alerts at once'
	);

	// coherence.clear - Clears current alerts
	registerCommand<ClearParams, void>(
		'coherence.clear',
		() => {
			console.log('[Coherence Command] Clearing alerts');
			// In real app: coherenceStore.clear();
		},
		'Clears all coherence alerts'
	);

	console.log('[Coherence Commands] Registered');
}
