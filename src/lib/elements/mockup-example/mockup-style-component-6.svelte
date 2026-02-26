<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: style
ID: 
Attributes: {}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "style",
  "id": null,
  "attrs": {}
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: style → semantic section with class 'style' -->
<section class="style">
  {#if $$slots.default}
    <slot />
  {:else}
    /* Very small visual helper to preview the mockup */
    :root{--dark:#0b1220;--muted:#64748b;--panel:#071028;--accent:#6366f1}
    body{font-family:Inter, system-ui, sans-serif;margin:0;background:#f8fafc;color:#0b1220}
    header{height:48px;background:var(--dark);color:#fff;display:flex;align-items:center;padding:0 16px}
    .workspace{display:flex;height:calc(100vh - 48px)}
    .left{background:#071028;color:#d6e6ff;padding:12px;width:55%}
    .resizer{width:8px;background:linear-gradient(90deg,transparent,#0f172a33,transparent)}
    .right{background:#fff;padding:12px;width:45%;min-width:280px}
    .tabs{display:flex;gap:8px;margin-bottom:8px}
    .tab{padding:8px 12px;border-radius:6px;background:#f1f5f9}
    .badge{position:fixed;right:28px;top:72px;background:var(--dark);color:#e6eef8;padding:8px 12px;border-radius:999px}
  {/if}
</section>
