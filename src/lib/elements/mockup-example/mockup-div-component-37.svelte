<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: div
ID: 
Attributes: {"style":"position:fixed;left:50%;transform:translateX(-50%);bottom:24px;background:#fff;padding:10px 16px;border-radius:32px;box-shadow:0 10px 30px rgba(2,6,23,0.12);display:flex;gap:8px;align-items:center;"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "div",
  "id": null,
  "attrs": {
    "style": "position:fixed;left:50%;transform:translateX(-50%);bottom:24px;background:#fff;padding:10px 16px;border-radius:32px;box-shadow:0 10px 30px rgba(2,6,23,0.12);display:flex;gap:8px;align-items:center;"
  }
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: div → semantic section with class 'div' -->
<section class="div">
  {#if $$slots.default}
    <slot />
  {:else}
    <button>🎤 Voice</button>
    <button>📷 Upload</button>
    <div style="color:var(--muted);font-size:12px">Voice / image uploads (LiveKit in full app)
  {/if}
</section>
