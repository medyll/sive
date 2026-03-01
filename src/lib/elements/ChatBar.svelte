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
        <div class="chat-bubble {msg.role}" role="article">
          <span class="bubble-label">{msg.role === 'user' ? 'You' : 'AI'}</span>
          <p class="bubble-text">{msg.text}</p>
        </div>
      {/each}
      {#if chatStore.sending}
        <div class="chat-bubble assistant typing" aria-label="AI typing">
          <span class="bubble-label">AI</span>
          <p class="bubble-text">…</p>
        </div>
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
  .chat-bar {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.5rem;
    background: var(--color-background, #fff);
    overflow: hidden;
  }

  .chat-messages {
    max-height: 220px;
    overflow-y: auto;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-bottom: 1px solid var(--color-border, #e0e0e0);
  }

  .chat-bubble {
    display: flex;
    flex-direction: column;
    max-width: 85%;
    gap: 0.1rem;
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
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-text-muted, #9ca3af);
    letter-spacing: 0.04em;
  }

  .bubble-text {
    margin: 0;
    padding: 0.4rem 0.7rem;
    border-radius: 1rem;
    font-size: 0.85rem;
    line-height: 1.45;
  }

  .chat-bubble.user .bubble-text {
    background: var(--color-primary, #646cff);
    color: #fff;
    border-bottom-right-radius: 0.2rem;
  }

  .chat-bubble.assistant .bubble-text {
    background: var(--color-surface, #f3f4f6);
    color: var(--color-text, #1a1a1a);
    border-bottom-left-radius: 0.2rem;
  }

  .chat-bubble.typing .bubble-text {
    color: var(--color-text-muted, #9ca3af);
    font-style: italic;
  }

  .chat-input-row {
    display: flex;
    padding: 0.5rem;
    gap: 0.4rem;
  }

  .chat-input {
    flex: 1;
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.375rem;
    padding: 0.4rem 0.6rem;
    font-size: 0.875rem;
    outline: none;
    background: var(--color-background, #fff);
  }

  .chat-input:focus {
    border-color: var(--color-primary, #646cff);
  }

  .btn-send {
    padding: 0.4rem 0.9rem;
    background: var(--color-primary, #646cff);
    color: #fff;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .btn-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>