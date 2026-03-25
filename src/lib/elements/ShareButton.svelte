<script lang="ts">
  import { toastStore } from '$lib/toastStore.svelte';

  export interface ShareButtonProps {
    url?: string;
    title?: string;
  }

  let { url = '', title = '' }: ShareButtonProps = $props();

  let open = $state(false);

  const shareUrl = () => url || location.href;

  async function copyLink() {
    const u = shareUrl();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(u);
      } else {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = u;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toastStore.success('Link copied to clipboard');
    } catch (err) {
      toastStore.error('Failed to copy link');
    } finally {
      open = false;
    }
  }

  function shareToTwitter() {
    const u = encodeURIComponent(shareUrl());
    const text = title ? encodeURIComponent(title) : '';
    const tw = `https://twitter.com/intent/tweet?text=${text}&url=${u}`;
    window.open(tw, '_blank', 'noopener');
    open = false;
  }

  function shareToFacebook() {
    const u = encodeURIComponent(shareUrl());
    const fb = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    window.open(fb, '_blank', 'noopener');
    open = false;
  }
</script>

<div class="share-wrap">
  <button
    type="button"
    class="btn-share"
    aria-label="Share"
    aria-haspopup="true"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    🔗 Share
  </button>

  {#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="share-backdrop" onclick={() => (open = false)} onkeydown={(e) => e.key === 'Escape' && (open = false)}></div>

    <div class="share-menu" role="menu">
      <button role="menuitem" type="button" onclick={copyLink}>Copy link</button>
      <button role="menuitem" type="button" onclick={shareToTwitter}>Share on Twitter</button>
      <button role="menuitem" type="button" onclick={shareToFacebook}>Share on Facebook</button>
    </div>
  {/if}
</div>

<style>
  .share-wrap { position: relative; display: inline-flex; }
  .btn-share {
    padding: 0.35rem 0.65rem;
    font-size: 0.82rem;
    background: var(--color-surface, #f4f4f4);
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 0.375rem;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
  }
  .btn-share:hover { background: var(--color-hover, #e9e9e9); }

  .share-backdrop { position: fixed; inset: 0; z-index: 100; }

  .share-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: #fff;
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 0.375rem;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    z-index: 101;
    min-width: 12rem;
    overflow: hidden;
  }

  .share-menu button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.55rem 1rem;
    font-size: 0.88rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text, #1a1a1a);
  }

  .share-menu button:hover { background: var(--color-hover, #f4f4f4); }
</style>
