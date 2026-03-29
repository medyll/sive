/**
 * Review Command Handlers
 * 
 * Registers review-related commands in the Command Bus.
 */

import { registerCommand } from '$lib/shared/commandBus';

interface Report {
	inconsistencies: Array<{ section: string; items: string[] }>;
	pov: { compliance: string; notes: string[] };
	narrative_threads: { open: string[]; unresolved: string[] };
	tension: { curve: string; consistency: string };
	themes: { present: string[]; missing: string[] };
	voices: { characters: Array<{ name: string; notes: string[] }> };
	style: { tics: string[]; repetitions: string[] };
}

interface PushReportParams {
	report: Report;
}

interface HighlightPassageParams {
	start: number;
	end: number;
	report_section: string;
}

interface ClearParams {
	// No params
}

/**
 * Initialize review command handlers
 */
export function initReviewCommands(): void {
	// review.push_report - Pushes the structured report to the review screen
	registerCommand<PushReportParams, void>(
		'review.push_report',
		({ report }) => {
			console.log('[Review Command] Pushing audit report');
			// In real app: reviewStore.setReport(report);
		},
		'Displays a structured audit report in the Review panel'
	);

	// review.highlight_passage - Links a text highlight to a report section
	registerCommand<HighlightPassageParams, void>(
		'review.highlight_passage',
		({ start, end, report_section }) => {
			console.log(`[Review Command] Highlighting passage linked to ${report_section}`);
			// In real app: editor.highlight({ start, end }); reviewStore.linkToSection(report_section);
		},
		'Highlights a passage and links it to a report section'
	);

	// review.clear - Clears current review data
	registerCommand<ClearParams, void>(
		'review.clear',
		() => {
			console.log('[Review Command] Clearing review');
			// In real app: reviewStore.clear();
		},
		'Clears the current review report'
	);

	console.log('[Review Commands] Registered');
}
