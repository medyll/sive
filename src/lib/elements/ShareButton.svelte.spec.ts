import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ShareButton from './ShareButton.svelte';
import { toastStore } from '$lib/toastStore.svelte';

describe('ShareButton.svelte', () => {
  beforeEach(() => {
    // reset spies
    (toastStore.success as unknown) && (toastStore.success = (toastStore.success as any));
  });

  it('renders the share button', async () => {
    const { container } = render(ShareButton, { props: { title: 'My doc' } });
    const btn = container.querySelector('.btn-share');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain('Share');
  });

  it('opens dropdown on click', async () => {
    const { container } = render(ShareButton, { props: {} });
    const btn = container.querySelector<HTMLButtonElement>('.btn-share')!;
    btn.click();
    await new Promise((r) => setTimeout(r, 20));
    const menu = container.querySelector('.share-menu');
    expect(menu).not.toBeNull();
  });

  it('copies link and shows toast', async () => {
    const mockWrite = vi.fn().mockResolvedValue(undefined);
    // Attach or spy clipboard.writeText in a safe way (browser env may prevent reassigning navigator)
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).clipboard && typeof (navigator as any).clipboard.writeText === 'function') {
        vi.spyOn((navigator as any).clipboard, 'writeText').mockImplementation(mockWrite);
      } else if (typeof navigator !== 'undefined') {
        Object.defineProperty(navigator, 'clipboard', { value: { writeText: mockWrite }, configurable: true });
      } else {
        // fallback for Node-like globals
        // @ts-ignore
        globalThis.navigator = { clipboard: { writeText: mockWrite } };
      }
    } catch (e) {
      // ignore errors setting clipboard mock
    }

    const toastSpy = vi.spyOn(toastStore, 'success');

    const { container } = render(ShareButton, { props: { url: 'https://example.com/doc/1' } });
    container.querySelector<HTMLButtonElement>('.btn-share')!.click();
    await new Promise((r) => setTimeout(r, 20));
    const copyBtn = container.querySelector<HTMLButtonElement>('.share-menu button')!;
    expect(copyBtn.textContent).toContain('Copy');
    copyBtn.click();
    await new Promise((r) => setTimeout(r, 20));

    expect(mockWrite).toHaveBeenCalledWith('https://example.com/doc/1');
    expect(toastSpy).toHaveBeenCalledWith('Link copied to clipboard');
  });

  it('opens twitter and facebook in new window', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null as any);

    const { container } = render(ShareButton, { props: { url: 'https://example.com/doc/2', title: 'Doc 2' } });
    container.querySelector<HTMLButtonElement>('.btn-share')!.click();
    await new Promise((r) => setTimeout(r, 20));
    const buttons = container.querySelectorAll<HTMLButtonElement>('.share-menu button');
    // [Copy, Twitter, Facebook]
    const twitterBtn = buttons[1];
    const fbBtn = buttons[2];

    twitterBtn.click();
    fbBtn.click();
    await new Promise((r) => setTimeout(r, 20));

    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });
});
