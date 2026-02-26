<!--
Generated Svelte scaffold from CMAD pseudo-HTML
Tag: html
ID: 
Attributes: {"lang":"fr"}
This file is a scaffold. Implement component logic and styles during development.
-->

<script lang="ts">
export const mockup = {
  "tag": "html",
  "id": null,
  "attrs": {
    "lang": "fr"
  }
};
</script>

<style>
/* Add component styles here */
</style>

<!-- Basic structural mapping: html → semantic section with class 'html' -->
<section class="html">
  {#if $$slots.default}
    <slot />
  {:else}
    <head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>CMAD-Master — Référence pseudo-HTML → Svelte</title>
  <style>
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
  </style>
</head>
<body>
  <!-- Small reference doc: mapping pseudo-tags -> how to implement in Svelte (+page.svelte) -->
  <header>
    <div>AI-Assisted Writer — Mockup (référence)</div>
  </header>

  <main class="workspace">
    <!-- PSEUDO: <panel id="editor-panel"> → SVELTE: left editor pane (div.pane.left) -->
    <section class="left" id="editor-panel">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
        <button>Run Analysis</button>
        <div style="color:var(--muted);font-size:12px">Editor — resizable (drag the gutter)</div>
      </div>
      <!-- PSEUDO: <text-zone id="main-editor" multiline /> → SVELTE: <textarea class="editor"> -->
      <textarea style="width:100%;height:80%;background:#071028;color:#d6e6ff;border:0;padding:12px;font-family:monospace;">Start writing...</textarea>
    </section>

    <!-- PSEUDO: <resize-handle id="split-handle" /> → SVELTE: .resizer with pointer events -->
    <div class="resizer" role="separator" aria-orientation="vertical" title="Resize panels"></div>

    <!-- PSEUDO: <panel id="ai-panel"> with <tab-bar> and <tab> → SVELTE: right panel with .tabs and conditional content -->
    <aside class="right" id="ai-panel">
      <nav class="tabs" role="tablist" aria-label="AI tools tabs">
        <button class="tab">Suggestions</button>
        <button class="tab">Coherence</button>
        <button class="tab">Style</button>
        <button class="tab">History</button>
      </nav>

      <section style="background:#fbfdff;border-radius:6px;padding:8px;">
        <h3>AI Suggestions</h3>
        <p style="color:var(--muted)">Diff-based proposals, inline accept/ignore controls (mock).</p>
        <ul>
          <li><strong>Replace:</strong> "grey Peugeot" → "grey Peugeot 308"</li>
        </ul>
      </section>
    </aside>

  </main>

  <!-- PSEUDO: <overlay id="chat-bar"> → SVELTE: fixed .chat-bar element -->
  <div style="position:fixed;left:50%;transform:translateX(-50%);bottom:24px;background:#fff;padding:10px 16px;border-radius:32px;box-shadow:0 10px 30px rgba(2,6,23,0.12);display:flex;gap:8px;align-items:center;">
    <button>🎤 Voice</button>
    <button>📷 Upload</button>
    <div style="color:var(--muted);font-size:12px">Voice / image uploads (LiveKit in full app)</div>
  </div>

  <!-- PSEUDO mapping (concise) -->
  <!--
    Mapping rapide:
    - <row> → flex container (div with display:flex)
    - <column> → block vertical container (div)
    - <panel> → semantic region / aside / section
    - <toolbar> → header element, fixed height
    - <text-zone> → <textarea> or contenteditable div
    - <chat-bubble> → styled div, can be a Svelte component
    - <tab-bar>/<tab> → group of buttons with role=tablist/role=tab
    - <overlay> → position:fixed element
    - <spinner> → animated element shown conditionally (bind to store)
    - <timeline> → custom list / svg timeline, sourced from YAML
    - <diff-view> → two-column side-by-side text diff (component)
    - <badge> → small fixed indicator (positioned absolutely)
    - <resize-handle> → element capturing pointer events to change layout ratios
  -->

  <footer style="position:fixed;left:12px;bottom:12px;color:var(--muted);font-size:12px">Référence: voir <a href="../src/routes/application/+page.svelte">src/routes/application/+page.svelte</a></footer>
</body>
  {/if}
</section>
