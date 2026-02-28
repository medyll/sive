<!--
Template for ChatBar component
-->
<script lang="ts">
  import type { Theme } from '$lib/types/types';

  export interface ChatBarProps {
    placeholder?: string;
    theme?: Theme['id'];
    onSend?: (message: string) => void;
  }

  let { placeholder = 'Type a message...', theme = 'light', onSend }: ChatBarProps = $props();

  let inputEl: HTMLInputElement | null = null;

  function ref(node: HTMLInputElement) {
    inputEl = node;
    return () => {
      inputEl = null;
    };
  }

  function sendMessage() {
    const message = inputEl?.value?.trim();
    if (!message) return;
    // prefer callback prop over custom events
    if (onSend) onSend(message);
    if (inputEl) inputEl.value = '';
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  }
</script>

<div class="chat-bar" data-theme={theme}>
  <input
    type="text"
    class="chat-input"
    placeholder={placeholder}
    {@attach ref}
    onkeydown={onKeydown}
  />
  <button type="button" onclick={sendMessage}>Send</button>
</div>

<style>
  .chat-bar {
    display: flex;
    border: 1px solid var(--color-border);
    padding: 0.5rem;
    background-color: var(--color-background);
  }

  .chat-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 0.5rem;
    font-size: 1rem;
  }
</style>