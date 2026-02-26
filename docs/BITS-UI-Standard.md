# Bits UI Standard for Svelte 5

This document outlines the patterns and conventions for building headless, accessible component primitives in Svelte 5. It is intended for `bmad-master` components and follows the architecture and conventions used by Bits UI.

## 1. Components as Primitives

Components must be **headless** by default, providing only the logic and accessibility (WAI-ARIA) without enforcing opinionated styles.

### Root vs. Elements

- **Root**: Manages state and context for sub-components (e.g., `Accordion.Root`).
- **Elements**: Specific parts of the component (e.g., `Accordion.Item`, `Accordion.Trigger`).

## 2. Using Runes

All components must use Svelte 5 runes for state and props.

```svelte
<script lang="ts">
  // Always destructure props using $props()
  let { 
    value = $bindable(""), 
    disabled = false,
    children, 
    ...rest 
  } = $props();

  // Manage internal state with $state
  let isFocused = $state(false);
</script>
```

## 3. Snippets over Slots

Svelte 4 `<slot />` is deprecated. Use **Snippets** for content injection and the `child` snippet for the delegation pattern.

### Basic Children

```svelte
<div {...rest}>
  {@render children?.()}
</div>
```

### The `child` Snippet Pattern (formerly `asChild`)

Instead of a boolean `asChild`, use a `child` snippet to delegate rendering to a custom element.

```svelte
<script lang="ts">
  let { child, children, ...rest } = $props();
</script>

{#if child}
  {@render child({ props: rest })}
{:else}
  <button {...rest}>
    {@render children?.()}
  </button>
{/if}

```

## 4. Prop Drilling & Attribute Spread

Components must allow users to pass any standard HTML attribute to the underlying DOM element via `...rest`.

- Always apply `{...rest}` to the root element of the component.
- Ensure event handlers are passed through correctly via Svelte 5's attribute/event system.

## 5. Composition over Configuration

Avoid deep nesting of props. Use component composition to allow users to build their own structures.

```svelte
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Title</Dialog.Title>
  </Dialog.Content>
</Dialog.Root>
```

## 6. Type Safety

All components should be written in TypeScript, defining strict interfaces for props and exported types.

```ts
export interface RootProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (v: string) => void;
  children?: Snippet;
}
```

## 7. Accessibility (WAI-ARIA)

Every component must implement the appropriate ARIA roles and keyboard interactions by default.

- Use `aria-expanded`, `aria-controls`, and `role` where necessary.
- Ensure focus management (trap/restore) is handled within the logic primitives.

---

Notes:

- Generated `bmad-master` components should follow this standard and be implemented as headless primitives that can be styled by consumers.
- Prefer small, well-documented building blocks that match Bits UI patterns.
