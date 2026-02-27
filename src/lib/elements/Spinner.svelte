<!--
Template for Spinner component
-->
<script lang="ts" module>
  const props = () => ({
    size: 'medium' as 'small' | 'medium' | 'large',
    theme: 'light',
  });
</script>

<div class="spinner {props().size}" data-theme={props().theme}></div>

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