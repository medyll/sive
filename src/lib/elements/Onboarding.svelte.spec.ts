import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Onboarding from './Onboarding.svelte';
import { toastStore } from '$lib/toastStore.svelte';

describe('Onboarding.svelte', () => {
  beforeEach(() => {
    try { localStorage.removeItem('sive:onboarding_seen'); } catch (e) {}
    for (const t of [...toastStore.items]) toastStore.dismiss(t.id);
  });

  it('shows onboarding when not seen', async () => {
    const { container } = render(Onboarding);
    const overlay = container.querySelector('.onboard-overlay');
    expect(overlay).not.toBeNull();
  });

  it('completes and sets localStorage and emits a toast', async () => {
    const { container } = render(Onboarding);
    const next = () => container.querySelector<HTMLButtonElement>('.btn.btn-primary');
    // Click through steps until completion
    for (let i = 0; i < 4; i++) {
      const btn = next();
      expect(btn).not.toBeNull();
      btn!.click();
      await new Promise((r) => setTimeout(r, 10));
    }

    expect(localStorage.getItem('sive:onboarding_seen')).toBe('1');
    expect([...toastStore.items].length).toBeGreaterThan(0);
  });
});
