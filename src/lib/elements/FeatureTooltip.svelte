<!--
  FeatureTooltip — pulsing dot + popover on first visit for key features.
  Usage: <FeatureTooltip id="ai-panel" title="AI Panel" description="…" />
  Seen state stored in localStorage as sive:tooltip:<id>
-->
<script lang="ts">
  import { browser } from '$app/environment';

  interface Props {
    id: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
  }

  let { id, title, description, position = 'bottom' }: Props = $props();

  const key = `sive:tooltip:${id}`;

  let visible = $state(browser ? localStorage.getItem(key) !== 'seen' : false);
  let popoverOpen = $state(false);

  function dismiss() {
    visible = false;
    popoverOpen = false;
    if (browser) localStorage.setItem(key, 'seen');
  }

  function toggle() {
    popoverOpen = !popoverOpen;
  }
</script>

{#if visible}
  <span class={['feature-tooltip-wrap', `pos-${position}`].join(' ')}>
    <button
      type="button"
      class="feature-dot"
      aria-label="Learn about {title}"
      onclick={toggle}
    ></button>
    {#if popoverOpen}
      <div class="feature-popover" role="tooltip">
        <strong>{title}</strong>
        <p>{description}</p>
        <button type="button" class="btn-dismiss" onclick={dismiss}>Got it</button>
      </div>
    {/if}
  </span>
{/if}

<style>
  .feature-tooltip-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .feature-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-primary, #646cff);
    border: none;
    cursor: pointer;
    animation: tooltip-pulse 2s infinite;
    padding: 0;
    flex-shrink: 0;
  }

  @keyframes tooltip-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(100, 108, 255, 0.6); }
    50% { box-shadow: 0 0 0 6px rgba(100, 108, 255, 0); }
  }

  .feature-popover {
    position: absolute;
    z-index: 500;
    background: var(--color-background, #fff);
    border: 1px solid var(--color-border, #e0e0e0);
    border-radius: 0.5rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 0.75rem 1rem;
    width: 14rem;
    font-size: 0.82rem;
  }

  .pos-bottom .feature-popover { top: calc(100% + 8px); left: 50%; transform: translateX(-50%); }
  .pos-top .feature-popover { bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); }
  .pos-right .feature-popover { left: calc(100% + 8px); top: 50%; transform: translateY(-50%); }
  .pos-left .feature-popover { right: calc(100% + 8px); top: 50%; transform: translateY(-50%); }

  .feature-popover strong {
    display: block;
    margin-bottom: 0.3rem;
    font-size: 0.85rem;
    color: var(--color-text, #1a1a1a);
  }

  .feature-popover p {
    margin: 0 0 0.5rem;
    color: var(--color-text-muted, #9ca3af);
    line-height: 1.4;
  }

  .btn-dismiss {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
    border-radius: 0.25rem;
    border: 1px solid var(--color-primary, #646cff);
    background: none;
    color: var(--color-primary, #646cff);
    cursor: pointer;
  }

  .btn-dismiss:hover {
    background: var(--color-primary, #646cff);
    color: #fff;
  }
</style>
