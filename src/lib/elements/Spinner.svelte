<!--
Template for Spinner component
-->
<script lang="ts">
  import type { Theme } from '$lib/types/types';

  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let theme: Theme['id'] = 'light';
</script>

<div class="spinner {size}" data-theme={theme}></div>

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