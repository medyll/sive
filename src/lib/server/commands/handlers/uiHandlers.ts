/**
 * UI Command Handlers
 * 
 * Handles UI-related commands emitted by skills.
 * These commands control the user interface without skills needing to
 * know the internal implementation.
 * 
 * Follows the architecture described in BMAD:
 * bmad/references/project/5-ai-architecture-mcp-skills.md
 * bmad/references/project/11-technical-implementation.md
 */

import type { CommandEvent } from '../types';
import type { CoherenceAlertData } from '$lib/coherenceStore';
import type { SuggestionData } from '$lib/suggestionsStore';

// StyleSignalData is defined in AIPanel.svelte but not exported.
// Re-defining here to avoid circular dependencies
export interface StyleSignalData {
  location: string;
  signal: string;
  suggestion: string;
}

/**
 * Get typed parameters for a UI command
 */
function getUIParams<T extends Record<string, unknown>>(event: CommandEvent): T {
  return event.params as T;
}

/**
 * UI Command Handlers
 * Each handler processes a specific UI command and performs the corresponding action
 */
export const uiHandlers = {
  /**
   * Open a tab in the right panel
   */
  open_tab: async (event: CommandEvent): Promise<void> => {
    const { tab } = getUIParams<{ tab: string }>(event);
    
    // Dispatch custom event to trigger tab change in the UI
    // This will be picked up by AIPanel.svelte or similar components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai:open-tab', {
        detail: { tab }
      }));
    }
  },

  /**
   * Scroll the editor to a specific anchor
   */
  scroll_to: async (event: CommandEvent): Promise<void> => {
    const { anchor } = getUIParams<{ anchor: string }>(event);
    
    if (typeof document !== 'undefined') {
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  },

  /**
   * Highlight a range of text in the editor
   */
  highlight_range: async (event: CommandEvent): Promise<void> => {
    const { start, end, color } = getUIParams<{ 
      start: number; 
      end: number; 
      color?: string 
    }>(event);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('editor:highlight', {
        detail: { start, end, color: color || '#ffff00' }
      }));
    }
  },

  /**
   * Show a notification to the user
   */
  show_notification: async (event: CommandEvent): Promise<void> => {
    const { message, level } = getUIParams<{ 
      message: string; 
      level: 'info' | 'warning' | 'error' | 'success' 
    }>(event);
    
    if (typeof window !== 'undefined') {
      // Dispatch event that can be picked up by toast/notification components
      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { message, level, duration: 5000 }
      }));
    }
  },

  /**
   * Show a modal dialog to the user
   * Returns the user's choice
   */
  show_modal: async (event: CommandEvent): Promise<string | undefined> => {
    const { title, content, actions } = getUIParams<{ 
      title: string; 
      content: string; 
      actions?: string[] 
    }>(event);
    
    if (typeof window !== 'undefined') {
      // Create a promise that will be resolved when the user makes a choice
      return new Promise((resolve) => {
        const handler = (e: Event) => {
          const customEvent = e as CustomEvent;
          if (customEvent.detail?.modalId === title) {
            resolve(customEvent.detail?.action);
            window.removeEventListener('modal:response', handler);
          }
        };
        
        window.addEventListener('modal:response', handler);
        
        // Dispatch event to show modal
        window.dispatchEvent(new CustomEvent('modal:show', {
          detail: { 
            title, 
            content, 
            actions: actions || ['ok', 'cancel'],
            modalId: title
          }
        }));
        
        // Timeout fallback - resolve with first action after 30 seconds
        setTimeout(() => {
          window.removeEventListener('modal:response', handler);
          resolve(actions?.[0] || 'ok');
        }, 30000);
      });
    }
    
    // Fallback for non-browser environments
    return 'ok';
  },

  /**
   * Set the visibility of the AI spinner
   */
  set_spinner: async (event: CommandEvent): Promise<void> => {
    const { visible } = getUIParams<{ visible: boolean }>(event);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai:spinner', {
        detail: { visible }
      }));
    }
  },

  /**
   * Focus the main editor
   */
  focus_editor: async (): Promise<void> => {
    if (typeof document !== 'undefined') {
      const editor = document.querySelector('.editor-textarea, textarea.editor') as HTMLTextAreaElement;
      if (editor) {
        editor.focus();
      }
    }
  },

  /**
   * Toggle focus mode on/off
   */
  toggle_focus_mode: async (event: CommandEvent): Promise<void> => {
    const { active } = getUIParams<{ active: boolean }>(event);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('focus:toggle', {
        detail: { active }
      }));
    }
  }
};

/**
 * Coherence Command Handlers
 * Handle commands related to the coherence analysis tab
 */
export const coherenceHandlers = {
  /**
   * Add one or more alerts to the coherence tab
   */
  push_alert: async (event: CommandEvent): Promise<void> => {
    const { alerts } = getUIParams<{ alerts: CoherenceAlertData[] | CoherenceAlertData }>(event);
    
    const alertList = Array.isArray(alerts) ? alerts : [alerts];
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('coherence:push-alerts', {
        detail: { alerts: alertList }
      }));
    }
  },

  /**
   * Clear all alerts from the coherence tab
   */
  clear: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('coherence:clear'));
    }
  }
};

/**
 * Style Command Handlers
 * Handle commands related to the style analysis tab
 */
export const styleHandlers = {
  /**
   * Add one or more signals to the style tab
   */
  push_signal: async (event: CommandEvent): Promise<void> => {
    const { signals, location, signal, suggestion } = getUIParams<{
      signals?: StyleSignalData[] | StyleSignalData;
      location?: string;
      signal?: string;
      suggestion?: string;
    }>(event);
    
    let signalList: StyleSignalData[];
    
    if (signals) {
      signalList = Array.isArray(signals) ? signals : [signals];
    } else if (location && signal && suggestion) {
      signalList = [{ location, signal, suggestion }];
    } else {
      signalList = [];
    }
    
    if (typeof window !== 'undefined' && signalList.length > 0) {
      window.dispatchEvent(new CustomEvent('style:push-signals', {
        detail: { signals: signalList }
      }));
    }
  },

  /**
   * Clear all signals from the style tab
   */
  clear: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('style:clear'));
    }
  }
};

/**
 * Suggestions Command Handlers
 * Handle commands related to the suggestions tab
 */
export const suggestionsHandlers = {
  /**
   * Add one or more suggestions to the suggestions tab
   */
  push_diff: async (event: CommandEvent): Promise<void> => {
    const { suggestions, original, proposal, context } = getUIParams<{
      suggestions?: SuggestionData[] | SuggestionData;
      original?: string;
      proposal?: string;
      context?: string;
    }>(event);
    
    let suggestionList: SuggestionData[];
    
    if (suggestions) {
      suggestionList = Array.isArray(suggestions) ? suggestions : [suggestions];
    } else if (original && proposal) {
      suggestionList = [{
        id: `sug-${Date.now()}`,
        type: 'modification',
        before: original,
        after: proposal,
        context
      }];
    } else {
      suggestionList = [];
    }
    
    if (typeof window !== 'undefined' && suggestionList.length > 0) {
      window.dispatchEvent(new CustomEvent('suggestions:push', {
        detail: { suggestions: suggestionList }
      }));
    }
  },

  /**
   * Clear all suggestions from the suggestions tab
   */
  clear: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('suggestions:clear'));
    }
  }
};

/**
 * Review Command Handlers
 * Handle commands related to the review mode
 */
export const reviewHandlers = {
  /**
   * Push a review report to the review screen
   */
  push_report: async (event: CommandEvent): Promise<void> => {
    const { report } = getUIParams<{ report: unknown }>(event);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('review:push-report', {
        detail: { report }
      }));
    }
  },

  /**
   * Highlight a passage in the review text
   */
  highlight_passage: async (event: CommandEvent): Promise<void> => {
    const { start, end, report_section } = getUIParams<{
      start: number;
      end: number;
      report_section: string;
    }>(event);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('review:highlight-passage', {
        detail: { start, end, report_section }
      }));
    }
  }
};

/**
 * Versioning Command Handlers
 * Handle commands related to versioning and hardening
 */
export const versioningHandlers = {
  /**
   * Trigger a versioning snapshot (Harden)
   */
  trigger: async (event: CommandEvent): Promise<void> => {
    const { label, message } = getUIParams<{ label: string; message: string }>(event);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('harden:trigger', {
        detail: { label, message }
      }));
    }
  },

  /**
   * Refresh the version timeline
   */
  refresh: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('timeline:refresh'));
    }
  },

  /**
   * Highlight a specific version on the timeline
   */
  highlight_version: async (event: CommandEvent): Promise<void> => {
    const { id } = getUIParams<{ id: string }>(event);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('timeline:highlight', {
        detail: { versionId: id }
      }));
    }
  }
};

/**
 * App Command Handlers
 * Handle generic application commands
 */
export const appHandlers = {
  /**
   * Export a file
   */
  export_file: async (event: CommandEvent): Promise<void> => {
    const { content, format, name } = getUIParams<{
      content: string;
      format: 'md' | 'pdf' | 'yaml';
      name: string;
    }>(event);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:export', {
        detail: { content, format, name }
      }));
    }
  },

  /**
   * Navigate to a different screen
   */
  navigate_to: async (event: CommandEvent): Promise<void> => {
    const { screen } = getUIParams<{ screen: string }>(event);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:navigate', {
        detail: { screen }
      }));
    }
  },

  /**
   * Reload project files into memory
   */
  reload_project: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:reload'));
    }
  },

  /**
   * Run another skill (skill composition)
   */
  run_skill: async (event: CommandEvent): Promise<unknown> => {
    const { skill_id, params } = getUIParams<{
      skill_id: string;
      params?: Record<string, unknown>;
    }>(event);
    
    if (typeof window !== 'undefined') {
      // Return the result of the nested skill execution
      return new Promise((resolve, reject) => {
        const handler = (e: Event) => {
          const customEvent = e as CustomEvent;
          if (customEvent.detail?.skillId === skill_id) {
            if (customEvent.detail?.success) {
              resolve(customEvent.detail?.result);
            } else {
              reject(new Error(customEvent.detail?.error || 'Skill execution failed'));
            }
            window.removeEventListener('skill:complete', handler);
          }
        };
        
        window.addEventListener('skill:complete', handler);
        
        window.dispatchEvent(new CustomEvent('skill:run', {
          detail: { skill_id, params }
        }));
        
        setTimeout(() => {
          window.removeEventListener('skill:complete', handler);
          reject(new Error('Skill execution timeout'));
        }, 60000);
      });
    }
    
    return {};
  }
};

/**
 * Editor Command Handlers
 * Handle commands related to the editor
 */
export const editorHandlers = {
  /**
   * Inject text at a position
   */
  inject_text: async (event: CommandEvent): Promise<void> => {
    const { position, text } = getUIParams<{ position: number; text: string }>(event);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('editor:inject', {
        detail: { position, text }
      }));
    }
  },

  /**
   * Replace a range of text
   */
  replace_range: async (event: CommandEvent): Promise<void> => {
    const { start, end, text } = getUIParams<{ start: number; end: number; text: string }>(event);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('editor:replace', {
        detail: { start, end, text }
      }));
    }
  },

  /**
   * Get the currently selected text
   */
  get_selection: async (event: CommandEvent): Promise<string> => {
    if (typeof window !== 'undefined') {
      return new Promise((resolve) => {
        const handler = (e: Event) => {
          const customEvent = e as CustomEvent;
          resolve(customEvent.detail?.text || '');
          window.removeEventListener('editor:selection', handler);
        };
        
        window.addEventListener('editor:selection', handler);
        window.dispatchEvent(new CustomEvent('editor:get-selection'));
        
        setTimeout(() => {
          window.removeEventListener('editor:selection', handler);
          resolve('');
        }, 5000);
      });
    }
    return '';
  },

  /**
   * Get the full chapter text
   */
  get_full_text: async (): Promise<string> => {
    if (typeof window !== 'undefined') {
      return new Promise((resolve) => {
        const handler = (e: Event) => {
          const customEvent = e as CustomEvent;
          resolve(customEvent.detail?.text || '');
          window.removeEventListener('editor:full-text', handler);
        };
        
        window.addEventListener('editor:full-text', handler);
        window.dispatchEvent(new CustomEvent('editor:get-full-text'));
        
        setTimeout(() => {
          window.removeEventListener('editor:full-text', handler);
          resolve('');
        }, 5000);
      });
    }
    return '';
  }
};




