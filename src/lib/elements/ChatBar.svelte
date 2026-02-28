<!--
Template for ChatBar component
-->
<script lang="ts">
  import type { Theme } from '$lib/types/types';

  export let placeholder: string = 'Type a message...';
  export let theme: Theme['id'] = 'light';

  const sendMessage = (message: string) => {
    console.log('Message sent:', message);
  };
</script>

<div class="chat-bar" data-theme={props().theme}>
  <input
    type="text"
    class="chat-input"
    placeholder={placeholder}
    on:keydown={(e) => e.key === 'Enter' && sendMessage((e.target as HTMLInputElement).value)}
  />
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