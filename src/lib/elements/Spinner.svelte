<!--
Template for Spinner component
-->
<script lang="ts">
  import type { Theme } from '$lib/types/types';

  export interface SpinnerProps {
    size?: 'small' | 'medium' | 'large';
    theme?: Theme['id'];
  }

  let { size = 'medium', theme = 'light' }: SpinnerProps = $props();
</script>

<div class={"spinner " + size} data-theme={theme} role="status" aria-label="Loading"></div>

<style>
  .spinner {
    border: 4px solid var(--color-border);
    border-top: 4px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .spinner.small {
    width: 1rem;
    height: 1rem;
  }

  .spinner.medium {
    width: 2rem;
    height: 2rem;
  }

  .spinner.large {
    width: 3rem;
    height: 3rem;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>