/**
 * Editor Command Handlers
 * 
 * Registers editor-related commands in the Command Bus.
 * These handlers control text manipulation and editor state.
 */

import { commandBus, registerCommand } from '$lib/shared/commandBus';

// Type definitions for editor command parameters
interface InjectTextParams {
	position: number;
	text: string;
}

interface ReplaceRangeParams {
	start: number;
	end: number;
	text: string;
}

interface GetSelectionParams {
	// No params
}

interface GetFullTextParams {
	// No params
}

/**
 * Current editor content (stub - in real app, this comes from editor state)
 */
let editorContent = '';

/**
 * Initialize editor command handlers
 */
export function initEditorCommands(): void {
	// editor.inject_text - Injects text at a position
	registerCommand<InjectTextParams, void>(
		'editor.inject_text',
		({ position, text }) => {
			console.log(`[Editor Command] Injecting text at position ${position}`);
			// In real app: editor.insertText(position, text);
			editorContent = editorContent.slice(0, position) + text + editorContent.slice(position);
		},
		'Injects text at a specific position in the editor'
	);

	// editor.replace_range - Replaces a text range
	registerCommand<ReplaceRangeParams, void>(
		'editor.replace_range',
		({ start, end, text }) => {
			console.log(`[Editor Command] Replacing range ${start}-${end}`);
			// In real app: editor.replaceRange(start, end, text);
			editorContent = editorContent.slice(0, start) + text + editorContent.slice(end);
		},
		'Replaces text in a specified range'
	);

	// editor.get_selection - Returns the selected text
	registerCommand<GetSelectionParams, string>(
		'editor.get_selection',
		() => {
			console.log('[Editor Command] Getting selection');
			// In real app: return editor.getSelection();
			return ''; // Stub
		},
		'Returns the currently selected text'
	);

	// editor.get_full_text - Returns the full chapter text
	registerCommand<GetFullTextParams, string>(
		'editor.get_full_text',
		() => {
			console.log('[Editor Command] Getting full text');
			// In real app: return editor.getText();
			return editorContent;
		},
		'Returns the complete editor content'
	);

	console.log('[Editor Commands] All editor command handlers registered');
}

/**
 * Set editor content (for testing)
 */
export function setEditorContent(content: string): void {
	editorContent = content;
}

/**
 * Get list of registered editor commands
 */
export function getEditorCommands(): Array<{ command: string; description: string }> {
	return commandBus.getCommandsByModule('editor');
}
