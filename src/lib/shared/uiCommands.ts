/**
 * UI Command Handlers
 * 
 * Registers UI-related commands in the Command Bus.
 * These handlers control UI state and navigation.
 */

import { commandBus, registerCommand } from '$lib/shared/commandBus';

// Type definitions for UI command parameters
interface OpenTabParams {
	tab: string;
}

interface ScrollToParams {
	anchor: string;
}

interface HighlightRangeParams {
	start: number;
	end: number;
	color?: string;
}

interface ShowNotificationParams {
	message: string;
	level?: 'info' | 'success' | 'warning' | 'error';
	duration?: number;
}

interface ShowModalParams {
	title: string;
	content: string;
	actions?: Array<'confirm' | 'edit' | 'cancel'>;
}

interface SetSpinnerParams {
	visible: boolean;
	message?: string;
}

interface FocusEditorParams {
	// No params
}

interface ToggleFocusModeParams {
	active: boolean;
}

/**
 * Initialize UI command handlers
 * Call this during app initialization
 */
export function initUICommands(): void {
	// ui.open_tab - Opens a right panel tab
	registerCommand<OpenTabParams, void>(
		'ui.open_tab',
		({ tab }) => {
			console.log(`[UI Command] Opening tab: ${tab}`);
			// In real app: dispatch event or update store
			// rightPanelStore.openTab(tab);
		},
		'Opens a right panel tab (coherence, suggestions, style, etc.)'
	);

	// ui.scroll_to - Scrolls the editor to a position
	registerCommand<ScrollToParams, void>(
		'ui.scroll_to',
		({ anchor }) => {
			console.log(`[UI Command] Scrolling to: ${anchor}`);
			// In real app: editor.scrollTo(anchor);
		},
		'Scrolls the editor to an anchor position'
	);

	// ui.highlight_range - Highlights a passage in the editor
	registerCommand<HighlightRangeParams, void>(
		'ui.highlight_range',
		({ start, end, color = 'yellow' }) => {
			console.log(`[UI Command] Highlighting range ${start}-${end} in ${color}`);
			// In real app: editor.highlight({ start, end, color });
		},
		'Highlights a text range in the editor'
	);

	// ui.show_notification - Displays a non-blocking notification
	registerCommand<ShowNotificationParams, void>(
		'ui.show_notification',
		({ message, level = 'info', duration = 3000 }) => {
			console.log(`[UI Command] Notification (${level}): ${message}`);
			// In real app: toastStore.add({ message, level, duration });
		},
		'Displays a toast notification'
	);

	// ui.show_modal - Displays a confirmation modal
	registerCommand<ShowModalParams, Promise<string | null>>(
		'ui.show_modal',
		async ({ title, content, actions = ['confirm', 'cancel'] }) => {
			console.log(`[UI Command] Modal: ${title}`);
			// In real app: return await modalStore.show({ title, content, actions });
			return 'confirm'; // Stub
		},
		'Displays a modal dialog and returns user action'
	);

	// ui.set_spinner - Controls the AI spinner
	registerCommand<SetSpinnerParams, void>(
		'ui.set_spinner',
		({ visible, message }) => {
			console.log(`[UI Command] Spinner ${visible ? 'shown' : 'hidden'}${message ? `: ${message}` : ''}`);
			// In real app: aiSpinnerStore.set({ visible, message });
		},
		'Shows or hides the AI loading spinner'
	);

	// ui.focus_editor - Returns focus to the main editor
	registerCommand<FocusEditorParams, void>(
		'ui.focus_editor',
		() => {
			console.log('[UI Command] Focusing editor');
			// In real app: editor.focus();
		},
		'Returns keyboard focus to the main editor'
	);

	// ui.toggle_focus_mode - Enables/disables Focus Mode
	registerCommand<ToggleFocusModeParams, void>(
		'ui.toggle_focus_mode',
		({ active }) => {
			console.log(`[UI Command] Focus mode ${active ? 'enabled' : 'disabled'}`);
			// In real app: focusStore.set(active);
		},
		'Toggles Focus Mode (hides UI chrome for distraction-free writing)'
	);

	console.log('[UI Commands] All UI command handlers registered');
}

/**
 * Get list of registered UI commands
 */
export function getUICommands(): Array<{ command: string; description: string }> {
	return commandBus.getCommandsByModule('ui');
}
