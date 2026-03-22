<!--
  WhatsNewBanner — dismissible "What's new" banner for version 3.1.0.
  Dismiss stored in localStorage as sive:whatsnew:3.1.0
-->
<script lang="ts">
  import { browser } from '$app/environment';

  const VERSION = '3.1.0';
  const KEY = `sive:whatsnew:${VERSION}`;

  let visible = $state(browser ? localStorage.getItem(KEY) !== 'dismissed' : false);

  function dismiss() {
    visible = false;
    if (browser) localStorage.setItem(KEY, 'dismissed');
  }
</script>

{#if visible}
  <div class="whats-new-banner" role="status" aria-label="What's new in version {VERSION}" data-testid="whats-new-banner">
    <span class="banner-badge">v{VERSION}</span>
    <span class="banner-text">
      <strong>What's new:</strong> Duplicate docs, bulk delete, feature tooltips, mobile bottom nav &amp; swipe sidebar.
    </span>
    <button
      type="button"
      class="btn-banner-dismiss"
      aria-label="Dismiss what's new banner"
      data-testid="whats-new-dismiss"
      onclick={dismiss}
    >✕</button>
  </div>
{/if}

<style>
  .whats-new-banner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    background: linear-gradient(90deg, #ebebff 0%, #f0f4ff 100%);
    border-bottom: 1px solid var(--color-border, #e0e0e0);
    font-size: 0.82rem;
    color: var(--color-text, #1a1a1a);
    flex-shrink: 0;
  }

  .banner-badge {
    background: var(--color-primary, #646cff);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.15rem 0.45rem;
    border-radius: 9999px;
    flex-shrink: 0;
  }

  .banner-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn-banner-dismiss {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.75rem;
    color: var(--color-text-muted, #9ca3af);
    padding: 0.1rem 0.25rem;
    flex-shrink: 0;
    line-height: 1;
  }

  .btn-banner-dismiss:hover { color: var(--color-text, #1a1a1a); }

  @media (max-width: 640px) {
    .banner-text { font-size: 0.75rem; }
  }
</style>
