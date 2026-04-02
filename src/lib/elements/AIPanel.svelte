<script lang="ts">
  import TabBar from './TabBar.svelte';
  import Spinner from './Spinner.svelte';
  import HardenTimeline from './HardenTimeline.svelte';
  import HardenDiff from './HardenDiff.svelte';
  import StyleSliders from './StyleSliders.svelte';
  import StyleSignal from './StyleSignal.svelte';
  import CoherenceAlert from './CoherenceAlert.svelte';
  import SuggestionItem from './SuggestionItem.svelte';
  import { hardenStore } from '$lib/hardenStore.svelte.js';
  import { styleStore } from '$lib/styleStore.svelte.js';
  import { STUB_ALERTS, type CoherenceAlertData } from '$lib/coherenceStore.svelte.js';
  import { STUB_SUGGESTIONS, suggestionsStore, type SuggestionData } from '$lib/suggestionsStore.svelte.js';
  import { toastStore } from '$lib/toastStore.svelte';
  import { promptHistoryStore } from '$lib/promptHistoryStore.svelte.js';
  import OutlinePanel from './OutlinePanel.svelte';
  import { browser } from '$app/environment';

  export interface AIPanelProps {
    activeTab?: string;
    aiProcessing?: boolean;
    theme?: string;
    editorContent?: string;
    docId?: string | null;
  }

  const TABS = ['Chat', 'Suggestions', 'Coherence', 'Style', 'History', 'Outline'] as const;
  type Tab = (typeof TABS)[number];

  // ── Chat state ────────────────────────────────────────────────────────────
  interface ChatMessage { role: 'user' | 'assistant'; text: string; }
  const SUGGESTED_PROMPTS = [
    'How can I improve the pacing of this chapter?',
    'Suggest a stronger opening line for this passage.',
    'Are there any character consistency issues I should fix?'
  ];

  const CTX_TOGGLE_KEY = 'sive.aiUseDocContext';

  let chatMessages = $state<ChatMessage[]>([]);
  let chatInput = $state('');
  let chatStreaming = $state(false);
  let chatController = $state<AbortController | null>(null);
  let useDocContext = $state<boolean>(
    browser ? localStorage.getItem(CTX_TOGGLE_KEY) !== 'false' : true
  );
  // Prompt history navigation
  let historyIndex = $state(-1);

  function toggleDocContext() {
    useDocContext = !useDocContext;
    if (browser) localStorage.setItem(CTX_TOGGLE_KEY, String(useDocContext));
  }

  function onChatKeydown(e: KeyboardEvent) {
    const history = promptHistoryStore.items;
    if (e.key === 'ArrowUp' && history.length > 0) {
      e.preventDefault();
      const next = Math.min(historyIndex + 1, history.length - 1);
      historyIndex = next;
      chatInput = history[next];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        historyIndex = -1;
        chatInput = '';
      } else {
        historyIndex -= 1;
        chatInput = promptHistoryStore.items[historyIndex];
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    } else {
      // Any other key resets history navigation
      historyIndex = -1;
    }
  }

  async function sendChatMessage(text?: string) {
    const msg = (text ?? chatInput).trim();
    if (!msg || chatStreaming) return;
    promptHistoryStore.add(msg);
    historyIndex = -1;
    chatInput = '';
    chatMessages = [...chatMessages, { role: 'user', text: msg }];
    // placeholder assistant bubble
    chatMessages = [...chatMessages, { role: 'assistant', text: '' }];

    const ctrl = new AbortController();
    chatController = ctrl;
    chatStreaming = true;

    try {
      const q = btoa(JSON.stringify(chatMessages.slice(0, -1).map((m) => ({ role: m.role, text: m.text }))));
      let streamUrl = `/api/ai/stream?q=${encodeURIComponent(q)}`;
      if (useDocContext && editorContent) {
        const ctx = btoa(unescape(encodeURIComponent(editorContent.slice(0, 2000))));
        streamUrl += `&ctx=${encodeURIComponent(ctx)}`;
      }
      const res = await fetch(streamUrl, { signal: ctrl.signal });
      if (!res.body) throw new Error('No body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const chunk = line.slice(6);
          if (chunk === '[DONE]') break;
          // append to last assistant message
          chatMessages = chatMessages.map((m, i) =>
            i === chatMessages.length - 1 ? { ...m, text: m.text + chunk } : m
          );
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // trim empty trailing bubble
        chatMessages = chatMessages.filter((_, i) => !(i === chatMessages.length - 1 && chatMessages[i].text === ''));
      } else {
        chatMessages = chatMessages.map((m, i) =>
          i === chatMessages.length - 1 ? { ...m, text: 'Sorry, something went wrong. Please try again.' } : m
        );
        toastStore.warning('Chat request failed');
      }
    } finally {
      chatStreaming = false;
      chatController = null;
      persistChatHistory();
    }
  }

  function cancelChat() {
    chatController?.abort();
  }

  let {
    activeTab = $bindable<string>('Suggestions'),
    aiProcessing = false,
    theme = 'light',
    editorContent = '',
    docId = null
  }: AIPanelProps = $props();

  // Persist chat history per document
  const CHAT_PREFIX = 'sive:chat:';
  $effect(() => {
    if (!docId) return;
    try {
      const saved = JSON.parse(localStorage.getItem(CHAT_PREFIX + docId) ?? '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        chatMessages = saved.map((m: { role: string; content?: string; text?: string }) => ({
          role: m.role as 'user' | 'assistant',
          text: m.content ?? m.text ?? ''
        }));
      } else {
        chatMessages = [];
      }
    } catch { chatMessages = []; }
  });

  function persistChatHistory() {
    if (!docId) return;
    const toSave = chatMessages.slice(-20).map((m) => ({ role: m.role, content: m.text }));
    localStorage.setItem(CHAT_PREFIX + docId, JSON.stringify(toSave));
  }

  let selectedHardenId = $state<string | undefined>(undefined);

  interface StyleSignalData { location: string; signal: string; suggestion: string; }

  const STUB_SIGNALS: StyleSignalData[] = [
    { location: 'Para. 1', signal: 'Repetition',      suggestion: 'The word "shadow" appears 4 times. Consider varying with "silhouette" or "shade".' },
    { location: 'Para. 3', signal: 'Sentence length',  suggestion: 'Three consecutive short sentences disrupt the prose rhythm. Try merging the last two.' },
    { location: 'Para. 5', signal: 'Lexical density',  suggestion: 'High nominal density slows reading pace. Break into two sentences with a transitional verb.' }
  ];

  let analysing = $state(false);
  let signals = $state<StyleSignalData[]>([]);
  let analyseController = $state<AbortController | null>(null);

  let checking = $state(false);
  let coherenceAlerts = $state<CoherenceAlertData[]>([]);
  let coherenceController = $state<AbortController | null>(null);

  let suggesting = $state(false);
  let suggestController = $state<AbortController | null>(null);

  async function handleAnalyse() {
    if (analysing) { analyseController?.abort(); return; }
    const ctrl = new AbortController();
    analyseController = ctrl;
    analysing = true;
    signals = [];
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'style', content: editorContent }),
        signal: ctrl.signal
      });
      const data = await res.json();
      signals = data.signals ?? STUB_SIGNALS;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      signals = STUB_SIGNALS;
      toastStore.warning('Style analysis failed — showing cached results');
    } finally {
      analysing = false;
      analyseController = null;
    }
  }

  async function handleCoherenceCheck() {
    if (checking) { coherenceController?.abort(); return; }
    const ctrl = new AbortController();
    coherenceController = ctrl;
    checking = true;
    coherenceAlerts = [];
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'coherence', content: editorContent }),
        signal: ctrl.signal
      });
      const data = await res.json();
      coherenceAlerts = data.alerts ?? STUB_ALERTS;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      coherenceAlerts = STUB_ALERTS;
      toastStore.warning('Coherence check failed — showing cached results');
    } finally {
      checking = false;
      coherenceController = null;
    }
  }

  async function handleGenerateSuggestions() {
    if (suggesting) { suggestController?.abort(); return; }
    const ctrl = new AbortController();
    suggestController = ctrl;
    suggesting = true;
    suggestionsStore.setItems([]);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggestions', content: editorContent }),
        signal: ctrl.signal
      });
      const data = await res.json();
      suggestionsStore.setItems(data.suggestions ?? STUB_SUGGESTIONS);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      suggestionsStore.setItems(STUB_SUGGESTIONS);
      toastStore.warning('Suggestion generation failed — showing cached results');
    } finally {
      suggesting = false;
      suggestController = null;
    }
  }
</script>

<div class="ai-panel" data-theme={theme}>
  <TabBar
    tabs={[...TABS]}
    {activeTab}
    onChange={(tab) => { activeTab = tab; }}
  />

  {#if aiProcessing}
    <div class="spinner-row" aria-live="polite" aria-label="AI processing">
      <Spinner size="small" data-testid="ai-spinner" />
    </div>
  {/if}

  <div class="tab-content">
    {#if activeTab === 'Chat'}
      <div id="tab-content-chat" class="tab-pane chat-pane" role="tabpanel" aria-label="Chat">
        <div class="chat-context-bar">
          <button
            type="button"
            class={['btn-ctx-toggle', useDocContext && !!editorContent && 'btn-ctx-toggle--active'].filter(Boolean).join(' ')}
            aria-pressed={useDocContext}
            title={useDocContext ? 'Document context on — click to disable' : 'Document context off — click to enable'}
            onclick={toggleDocContext}
          >
            📄 {useDocContext && editorContent ? 'Doc context active' : 'Use doc as context'}
          </button>
        </div>
        <div class="chat-messages" aria-live="polite">
          {#if chatMessages.length === 0}
            <p class="tab-empty">Ask your writing assistant anything.</p>
            <div class="suggested-prompts">
              {#each SUGGESTED_PROMPTS as prompt}
                <button
                  type="button"
                  class="prompt-chip"
                  onclick={() => sendChatMessage(prompt)}
                >
                  {prompt}
                </button>
              {/each}
            </div>
          {:else}
            {#each chatMessages as msg, i (i)}
              <div class="chat-bubble chat-bubble--{msg.role}">
                <span class="bubble-text">{msg.text}{chatStreaming && i === chatMessages.length - 1 && msg.role === 'assistant' ? '▍' : ''}</span>
              </div>
            {/each}
          {/if}
        </div>
        <div class="chat-input-row">
          <input
            type="text"
            class="chat-input"
            placeholder="Ask something…"
            bind:value={chatInput}
            disabled={chatStreaming}
            onkeydown={onChatKeydown}
            aria-label="Chat input"
          />
          {#if chatStreaming}
            <button type="button" class="btn-chat-send btn--cancel" onclick={cancelChat}>Cancel</button>
          {:else}
            <button
              type="button"
              class="btn-chat-send"
              disabled={!chatInput.trim()}
              onclick={() => sendChatMessage()}
            >Send</button>
          {/if}
        </div>
        {#if promptHistoryStore.items.length > 0 && !chatStreaming}
          <p class="history-hint" aria-hidden="true">↑ history</p>
        {/if}
      </div>
    {:else if activeTab === 'Suggestions'}
      <div id="tab-content-suggestions" class="tab-pane" role="tabpanel" aria-label="Suggestions">
        <div class="analyse-bar">
          <button
            type="button"
            class={['btn-suggest', suggesting && 'btn--cancel'].filter(Boolean).join(' ')}
            onclick={handleGenerateSuggestions}
          >
            {suggesting ? 'Generating…' : 'Generate suggestions'}
          </button>
        </div>
        {#if suggestionsStore.items.length > 0}
          <div class="suggestions-list" aria-label="AI suggestions">
            {#each suggestionsStore.items as s (s.id)}
              <SuggestionItem
                suggestion={s}
                onAccept={(id) => suggestionsStore.accept(id)}
                onReject={(id)  => suggestionsStore.reject(id)}
              />
            {/each}
          </div>
          <div class="accept-all-bar">
            <button
              type="button"
              class="btn-accept-all"
              onclick={() => suggestionsStore.acceptAll()}
            >Accept all</button>
          </div>
        {:else if !suggesting}
          <p class="tab-empty">Click "Generate suggestions" to analyse your text.</p>
        {/if}
      </div>
    {:else if activeTab === 'Coherence'}
      <div id="tab-content-coherence" class="tab-pane" role="tabpanel" aria-label="Coherence">
        <div class="analyse-bar">
          <button
            type="button"
            class={['btn-coherence', checking && 'btn--cancel'].filter(Boolean).join(' ')}
            onclick={handleCoherenceCheck}
          >
            {checking ? 'Checking…' : 'Run coherence check'}
          </button>
        </div>
        {#if coherenceAlerts.length > 0}
          <div class="coherence-results" aria-label="Coherence alerts">
            {#each coherenceAlerts as alert (alert.entity + alert.discrepancy_type)}
              <CoherenceAlert
                entity={alert.entity}
                discrepancy_type={alert.discrepancy_type}
                confidence={alert.confidence}
                note={alert.note}
              />
            {/each}
          </div>
        {:else if !checking}
          <p class="tab-empty">Click "Run coherence check" to detect inconsistencies.</p>
        {/if}
      </div>
    {:else if activeTab === 'Style'}
      <div id="tab-content-style" class="tab-pane" role="tabpanel" aria-label="Style">
        <StyleSliders
          values={styleStore.values}
          onChange={(key, value) => styleStore.set(key, value)}
        />
        <div class="analyse-bar">
          <button
            type="button"
            class={['btn-analyse', analysing && 'btn--cancel'].filter(Boolean).join(' ')}
            onclick={handleAnalyse}
          >
            {analysing ? 'Analysing…' : 'Analyse this passage'}
          </button>
        </div>
        {#if signals.length > 0}
          <div class="style-results" aria-label="Style analysis results">
            {#each signals as s (s.location + s.signal)}
              <StyleSignal location={s.location} signal={s.signal} suggestion={s.suggestion} />
            {/each}
          </div>
        {:else if !analysing}
          <p class="tab-empty">Click "Analyse this passage" to get style feedback.</p>
        {/if}
      </div>
    {:else if activeTab === 'History'}
      <div id="tab-content-history" class="tab-pane" role="tabpanel" aria-label="History">
        <HardenTimeline
          snapshots={hardenStore.snapshots}
          selectedId={selectedHardenId}
          onSelectVersion={(id) => { selectedHardenId = id; }}
        />
        <HardenDiff snapshots={hardenStore.snapshots} />
      </div>
    {:else if activeTab === 'Outline'}
      <div id="tab-content-outline" class="tab-pane" role="tabpanel" aria-label="Outline">
        <OutlinePanel {docId} content={editorContent} />
      </div>
    {/if}
  </div>
</div>

<style>
  /* ───────────────────────────────────────────────────────────────────────
     CSS migrated to @medyll/css-base tokens
     ─────────────────────────────────────────────────────────────────────── */

  .ai-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-left: 1px solid var(--color-border);
    background-color: var(--color-surface);
  }

  .spinner-row {
    display: flex;
    justify-content: center;
    padding: var(--pad-sm);
    border-bottom: 1px solid var(--color-border);
  }

  .tab-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--pad-md);
  }

  .tab-pane {
    color: var(--color-text);
  }

  .tab-empty {
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    margin: var(--pad-lg) 0;
  }

  .analyse-bar {
    margin: var(--pad-md) 0 var(--pad-sm);
  }

  .btn-analyse,
  .btn-coherence,
  .btn-suggest {
    width: 100%;
    padding: var(--pad-sm) var(--pad-md);
    background: var(--color-primary);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .btn-analyse:hover,
  .btn-coherence:hover,
  .btn-suggest:hover {
    opacity: 0.9;
  }

  .btn-analyse:disabled,
  .btn-coherence:disabled,
  .btn-suggest:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .style-results,
  .coherence-results,
  .suggestions-list {
    display: flex;
    flex-direction: column;
    gap: var(--gap-md);
    margin-top: var(--pad-sm);
  }

  .accept-all-bar {
    margin-top: var(--pad-md);
    display: flex;
    justify-content: flex-end;
  }

  .btn-accept-all {
    width: auto;
    padding: var(--pad-sm) var(--pad-md);
    background: var(--color-success);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .btn-accept-all:hover {
    opacity: 0.9;
  }

  .btn--cancel {
    background: var(--color-critical) !important;
  }

  .btn--cancel:hover {
    opacity: 0.88;
  }

  /* ── Chat tab ── */
  .chat-pane {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--gap-sm);
    padding-bottom: var(--pad-sm);
    min-height: 0;
  }

  .chat-bubble {
    max-width: 85%;
    padding: var(--pad-sm) var(--pad-md);
    border-radius: var(--radius-lg);
    font-size: var(--text-sm);
    line-height: var(--leading-normal);
    word-break: break-word;
  }

  .chat-bubble--user {
    align-self: flex-end;
    background: var(--color-primary);
    color: var(--color-surface);
    border-bottom-right-radius: var(--radius-sm);
  }

  .chat-bubble--assistant {
    align-self: flex-start;
    background: var(--color-surface-alt);
    color: var(--color-text);
    border-bottom-left-radius: var(--radius-sm);
  }

  .bubble-text {
    white-space: pre-wrap;
  }

  .chat-input-row {
    display: flex;
    gap: var(--gap-sm);
    padding-top: var(--pad-sm);
    border-top: 1px solid var(--color-border);
    margin-top: var(--pad-sm);
  }

  .chat-input {
    flex: 1;
    padding: var(--pad-sm) var(--pad-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    background: var(--color-surface);
    color: var(--color-text);
    outline: none;
  }

  .chat-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-hover);
  }

  .btn-chat-send {
    padding: var(--pad-sm) var(--pad-md);
    background: var(--color-primary);
    color: var(--color-surface);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    cursor: pointer;
    white-space: nowrap;
    transition: var(--transition-fast);
  }

  .btn-chat-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .suggested-prompts {
    display: flex;
    flex-direction: column;
    gap: var(--gap-sm);
    margin-top: var(--pad-md);
  }

  .prompt-chip {
    text-align: left;
    padding: var(--pad-sm) var(--pad-md);
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    font-size: var(--text-sm);
    color: var(--color-text);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .prompt-chip:hover {
    background: var(--color-surface-hover);
  }

  /* ── Doc context toggle ── */
  .chat-context-bar {
    padding: var(--pad-xs) 0 var(--pad-xs);
    display: flex;
    align-items: center;
  }

  .btn-ctx-toggle {
    font-size: var(--text-xs);
    padding: var(--pad-xs) var(--pad-sm);
    border-radius: var(--radius-full);
    border: 1px solid var(--color-border);
    background: var(--color-surface-alt);
    color: var(--color-text-muted);
    cursor: pointer;
    transition: var(--transition-fast);
    white-space: nowrap;
  }

  .btn-ctx-toggle:hover {
    background: var(--color-surface-hover);
  }

  .btn-ctx-toggle--active {
    background: color-mix(in oklch, var(--color-primary) 12%, transparent);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  /* ── Prompt history hint ── */
  .history-hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-align: right;
    margin: var(--pad-xs) 0 0;
    padding-right: var(--pad-sm);
  }
</style>