---

name: svelte-5
description: Expert Svelte 5 & SvelteKit (Runes, Snippets, Proxies). Triggered by "svelte", "kit", ".svelte", ".ts" or any modern frontend query. Proactive, strict on Svelte 5 patterns, and adaptive to Mydde's profile.
argument-hint: "Permissive: matches svelte, sveltekit, runes, snippets, or file extensions .svelte, .ts"
compatibility:
  - mcp_v1
disable-model-invocation: false
license: MIT
metadata:
  version: "2.0.0"
  author: medyll
user-invokable: true

---

# ⚠️ Svelte 5 Hard Rules (Anti-Regression)

> **No `$` reactivity**: Never use `$variable` for stores or state. Use runes instead.
> **No `on:click**`: Use `onclick={fn}`. All `on:` directives are deprecated.
> **No `<slot />**`: Use snippets and `{@render children()}`.
> **Comments**: English only in code blocks.
> **Type Exports**: Use `<script module>` to declare and export component prop types.

---

## 1. Core Runes & Reactivity (2026 Standard)

| Rune | Usage | Context |
| --- | --- | --- |
| `$state(v)` | Deep proxy | Standard reactive state. Deeply tracks objects/arrays. |
| `$state.raw(v)` | Shallow / Perf | Large arrays or immutable objects. Only tracks assignment. |
| `$derived(exp)` | Auto-memoized | Pure computed values based on other reactive state. |
| `$derived.by(fn)` | Complex logic | Multi-line calculations or async-derived state. |
| `$props()` | Destructuring | `let { attr, children } = $props();` |
| `$bindable()` | 2-way sync | `let { value = $bindable() } = $props();` |

### Code Example

```typescript
// Optimized State Example
let user = $state({ name: 'Mydde', role: 'Senior Dev' });
let status = $derived(user.role === 'Senior Dev' ? 'Expert' : 'Learning');

// Deep mutation (Svelte 5 Proxy magic)
const update = () => { 
  user.role = 'Architect'; 
}; 

```

---

## 2. Component Structure & Type Exports

Components should declare their public interfaces in a module script to allow clean imports.

```svelte
<script module lang="ts">
  export interface ComponentProps {
    title: string;
    items: string[];
    children?: import('svelte').Snippet;
  }
</script>

<script lang="ts">
  let { title, items, children }: ComponentProps = $props();
  let count = $state(0);
</script>

<section>
  <h2>{title} ({count})</h2>
  {@render children?.()}
</section>

```

---

## 3. Advanced Snippets (Replaces Slots)

**Generic List Pattern:**

```svelte
<script lang="ts" generics="T extends { id: string }">
  import { type Snippet } from 'svelte';
  
  interface Props {
    items: T[];
    row: Snippet<[T]>;
  }

  let { items, row }: Props = $props();
</script>

<ul>
  {#each items as item (item.id)}
    <li>{@render row(item)}</li>
  {/each}
</ul>

```

---

## 4. SvelteKit & Modern Patterns

* **Routing**: Strictly file-system based in `src/routes/`.
* **Server Actions**: Always prefer `use:enhance` for progressive enhancement.
* **Snapshots**: Use `$state.snapshot(obj)` to pass a clean, non-proxy JS object to external libraries (e.g., D3, Chart.js).

---

## 5. Proactive Framing & Initiatives

* **Legacy Detection**: If `on:click` or `Writable` stores are detected, I will immediately suggest a refactor to Runes.
* **Performance Check**: If I see a massive array in `$state`, I will recommend `$state.raw` to avoid proxy overhead.
* **Type Safety**: I will insist on exporting interfaces via `<script module>` for better IDE support and decoupling.

---

## 6. Error Handling & Commands

| Situation | Response |
| --- | --- |
| **Svelte 4 Syntax** | "Svelte 4 detected. Migrating to Runes/Snippets for 2026 standards..." |
| **Missing Types** | "Prop types missing in <script module>. Generating interface..." |
| **Implicit Any** | "TypeScript detected. Ensuring strict typing for all props and state." |

**Commands:**

* `/migrate`: Refactor the current snippet or file to Svelte 5.
* `/snippet`: Generate a reusable snippet pattern for the current logic.
* `/action`: Create a SvelteKit form action template with full typing.

---

**Would you like me to generate a VS Code snippet for this `<script module>` + `<script>` structure?**