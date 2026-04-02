<!--
ChatBar — floating input with mini-chat history (user/AI bubbles)
-->
<script lang="ts">
  import type { Theme } from '$lib/types/types';
  import { chatStore } from '$lib/chatStore.svelte.js';

  export interface ChatBarProps {
    placeholder?: string;
    theme?: Theme['id'];
  }

  let { placeholder = 'Ask the AI…', theme = 'light' }: ChatBarProps = $props();

  let inputValue = $state('');
  let messagesEl = $state<HTMLDivElement | null>(null);

  async function send() {
    const msg = inputValue.trim();
    if (!msg || chatStore.sending) return;
    inputValue = '';
    await chatStore.send(msg);
    // Scroll to bottom after reply
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); send(); }
  }
</script>

<div class="chat-bar" data-theme={theme}>
  {#if chatStore.messages.length > 0}
    <div class="chat-messages" bind:this={messagesEl} aria-live="polite" aria-label="Chat history">
      {#each chatStore.messages as msg, i (i)}
        <article class="chat-bubble {msg.role}">
          <span class="bubble-label">{msg.role === 'user' ? 'You' : 'AI'}</span>
          <p class="bubble-text">{msg.text}</p>
        </article>
      {/each}
      {#if chatStore.sending}
        <article class="chat-bubble assistant typing" aria-label="AI typing">
          <span class="bubble-label">AI</span>
          <p class="bubble-text">…</p>
        </article>
      {/if}
    </div>
  {/if}

  <div class="chat-input-row">
    <input
      type="text"
      class="chat-input"
      {placeholder}
      bind:value={inputValue}
      onkeydown={onKeydown}
      disabled={chatStore.sending}
      aria-label="Chat input"
    />
    <button
      type="button"
      class="btn-send"
      onclick={send}
      disabled={chatStore.sending || !inputValue.trim()}
      aria-label="Send"
    >Send</button>
  </div>
</div>

<style>
  /* ───────────────────────────────────────────────────────────────────────
     CSS migrated to @medyll/css-base tokens
     ─────────────────────────────────────────────────────────────────────── */

  .chat-bar {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    overflow: hidden;
  }

  .chat-messages {
    max-height: 220px;
    overflow-y: auto;
    padding: var(--pad-md);
    display: flex;
    flex-direction: column;
    gap: var(--gap-sm);
    border-bottom: 1px solid var(--color-border);
  }

  .chat-bubble {
    display: flex;
    flex-direction: column;
    max-width: 85%;
    gap: var(--gap-xs);
  }

  .chat-bubble.user {
    align-self: flex-end;
    align-items: flex-end;
  }

  .chat-bubble.assistant {
    align-self: flex-start;
    align-items: flex-start;
  }

  .bubble-label {
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    text-transform: uppercase;
    color: var(--color-text-muted);
    letter-spacing: 0.04em;
  }

  .bubble-text {
    margin: 0;
    padding: var(--pad-sm) var(--pad-md);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    line-height: var(--leading-normal);
  }

  .chat-bubble.user .bubble-text {
    background: var(--color-primary);
    color: var(--color-surface);
    border-bottom-right-radius: var(--radius-sm);
  }

  .chat-bubble.assistant .bubble-text {
    background: var(--color-surface-alt);
    color: var(--color-text);
    border-bottom-left-radius: var(--radius-sm);
  }

  .chat-bubble.typing .bubble-text {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .chat-input-row {
    display: flex;
    padding: var(--pad-sm);
    gap: var(--gap-sm);
  }

  .chat-input {
    flex: 1;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--pad-sm);
    font-size: var(--text-base);
    outline: none;
    background: var(--color-surface);
    color: var(--color-text);
  }

  .chat-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-hover);
  }

  .btn-send {
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

  .btn-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>