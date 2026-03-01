<script lang="ts">
  import type { StyleValues } from '$lib/styleStore.svelte.js';

  interface StyleSlidersProps {
    values: StyleValues;
    onChange?: (key: keyof StyleValues, value: number) => void;
  }

  let { values, onChange }: StyleSlidersProps = $props();

  const SLIDERS: { key: keyof StyleValues; label: string }[] = [
    { key: 'cynicism',   label: 'Cynicism' },
    { key: 'complexity', label: 'Syntactic complexity' },
    { key: 'rhythm',     label: 'Rhythm' },
    { key: 'density',    label: 'Narrative density' }
  ];
</script>

<div class="style-sliders" role="region" aria-label="Style settings">
  {#each SLIDERS as slider (slider.key)}
    <div class="slider-row">
      <label for="slider-{slider.key}" class="slider-label">{slider.label}</label>
      <div class="slider-control">
        <input
          id="slider-{slider.key}"
          type="range"
          min="0"
          max="100"
          step="1"
          value={values[slider.key]}
          oninput={(e) => onChange?.(slider.key, Number((e.target as HTMLInputElement).value))}
        />
        <span class="slider-value" aria-label="{slider.label} value">{values[slider.key]}</span>
      </div>
    </div>
  {/each}
</div>

<style>
  .style-sliders {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem 0;
  }

  .slider-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .slider-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-text, #333);
  }

  .slider-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .slider-control input[type='range'] {
    flex: 1;
    accent-color: var(--color-primary, #6366f1);
  }

  .slider-value {
    min-width: 2.5rem;
    text-align: right;
    font-size: 0.8rem;
    color: var(--color-text-muted, #666);
    font-variant-numeric: tabular-nums;
  }
</style>
