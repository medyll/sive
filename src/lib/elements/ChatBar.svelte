<!--
Template for ChatBar component
-->
<script lang="ts" module>
  const props = () => ({
    placeholder: 'Type a message...',
    theme: 'light',
  });

  const sendMessage = (message: string) => {
    console.log('Message sent:', message);
  };
</script>

<div class="chat-bar" data-theme={props().theme}>
  <input
    type="text"
    class="chat-input"
    placeholder={props().placeholder}
    onkeydown={(e) => e.key === 'Enter' && sendMessage(e.target.value)}
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