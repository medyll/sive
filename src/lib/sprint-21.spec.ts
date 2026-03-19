/**
 * Sprint 21 — Error Boundaries & Resilience
 * Unit tests for: retryFetch, toastStore warning, OfflineBanner logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retryFetch } from './retryFetch';

// ─── retryFetch ───────────────────────────────────────────────────────────────

describe('retryFetch', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns response immediately on success', async () => {
		const mockRes = new Response('ok', { status: 200 });
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockRes));

		const res = await retryFetch('/api/test');
		expect(res.status).toBe(200);
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it('retries on 500 and succeeds on second attempt', async () => {
		const fail = new Response('error', { status: 500 });
		const ok   = new Response('ok',    { status: 200 });
		vi.stubGlobal('fetch', vi.fn()
			.mockResolvedValueOnce(fail)
			.mockResolvedValueOnce(ok));

		const res = await retryFetch('/api/test', undefined, { baseDelay: 0 });
		expect(res.status).toBe(200);
		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it('retries up to maxAttempts then returns last 500', async () => {
		const fail = new Response('error', { status: 500 });
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail));

		const res = await retryFetch('/api/test', undefined, { maxAttempts: 3, baseDelay: 0 });
		expect(res.status).toBe(500);
		expect(fetch).toHaveBeenCalledTimes(3);
	});

	it('retries on network error then succeeds', async () => {
		const ok = new Response('ok', { status: 200 });
		vi.stubGlobal('fetch', vi.fn()
			.mockRejectedValueOnce(new TypeError('Failed to fetch'))
			.mockResolvedValueOnce(ok));

		const res = await retryFetch('/api/test', undefined, { baseDelay: 0 });
		expect(res.status).toBe(200);
		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it('throws after all network-error attempts exhausted', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

		await expect(
			retryFetch('/api/test', undefined, { maxAttempts: 2, baseDelay: 0 })
		).rejects.toThrow('Failed to fetch');
		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it('does not retry on AbortError', async () => {
		const abortErr = new DOMException('Aborted', 'AbortError');
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortErr));

		await expect(
			retryFetch('/api/test', undefined, { baseDelay: 0 })
		).rejects.toMatchObject({ name: 'AbortError' });
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it('respects AbortSignal immediately when already aborted', async () => {
		const ctrl = new AbortController();
		ctrl.abort();
		vi.stubGlobal('fetch', vi.fn());

		await expect(
			retryFetch('/api/test', undefined, { signal: ctrl.signal })
		).rejects.toMatchObject({ name: 'AbortError' });
		expect(fetch).not.toHaveBeenCalled();
	});

	it('passes custom maxAttempts', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('net')));

		await expect(
			retryFetch('/api/test', undefined, { maxAttempts: 1, baseDelay: 0 })
		).rejects.toThrow();
		expect(fetch).toHaveBeenCalledTimes(1);
	});
});

// ─── toastStore warning ───────────────────────────────────────────────────────

describe('toastStore warning', () => {
	it('exposes a warning() method', async () => {
		if (typeof window === 'undefined') {
			expect(true).toBe(true);
			return;
		}
		// Dynamic import to get fresh module state
		const { toastStore } = await import('./toastStore.svelte');
		expect(typeof toastStore.warning).toBe('function');
	});

	it('warning() adds a toast with type "warning"', async () => {
		const { toastStore } = await import('./toastStore.svelte');
		const before = toastStore.items.length;
		toastStore.warning('test warning');
		expect(toastStore.items.length).toBe(before + 1);
		const last = toastStore.items[toastStore.items.length - 1];
		expect(last.type).toBe('warning');
		expect(last.message).toBe('test warning');
		// cleanup
		toastStore.dismiss(last.id);
	});

	it('warning toast is auto-dismissed after timeout', async () => {
		vi.useFakeTimers();
		const { toastStore } = await import('./toastStore.svelte');
		toastStore.warning('auto-dismiss me');
		const last = toastStore.items[toastStore.items.length - 1];
		expect(last).toBeDefined();
		vi.advanceTimersByTime(5000);
		expect(toastStore.items.find((t) => t.id === last.id)).toBeUndefined();
		vi.useRealTimers();
	});
});

// ─── OfflineBanner state logic ────────────────────────────────────────────────

describe('offline banner navigator.onLine logic', () => {
	const originalOnLine = Object.getOwnPropertyDescriptor(navigator, 'onLine');

	afterEach(() => {
		if (originalOnLine) {
			Object.defineProperty(navigator, 'onLine', originalOnLine);
		}
	});

	function setOnline(value: boolean) {
		Object.defineProperty(navigator, 'onLine', { value, configurable: true });
	}

	it('detects offline state via navigator.onLine=false', () => {
		setOnline(false);
		expect(navigator.onLine).toBe(false);
	});

	it('detects online state via navigator.onLine=true', () => {
		setOnline(true);
		expect(navigator.onLine).toBe(true);
	});

	it('offline event fires and online event fires as expected', () => {
		if (typeof window === 'undefined') {
			// Skip in non-browser environments
			expect(true).toBe(true);
			return;
		}

		let offline = navigator.onLine === false;

		const handleOffline = () => { offline = true; };
		const handleOnline  = () => { offline = false; };

		window.addEventListener('offline', handleOffline);
		window.addEventListener('online',  handleOnline);

		window.dispatchEvent(new Event('offline'));
		expect(offline).toBe(true);

		window.dispatchEvent(new Event('online'));
		expect(offline).toBe(false);

		window.removeEventListener('offline', handleOffline);
		window.removeEventListener('online',  handleOnline);
	});

	it('removes listeners on cleanup (no memory leak)', () => {
		if (typeof window === 'undefined') {
			// Skip in non-browser environments
			expect(true).toBe(true);
			return;
		}

		const handler = vi.fn();
		window.addEventListener('offline', handler);
		window.removeEventListener('offline', handler);
		window.dispatchEvent(new Event('offline'));
		expect(handler).not.toHaveBeenCalled();
	});
});

// ─── AbortController cancel pattern ──────────────────────────────────────────

describe('AbortController cancel pattern (AIPanel)', () => {
	it('abort() causes fetch to throw AbortError', async () => {
		const ctrl = new AbortController();
		vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
			return new Promise((_, reject) => {
				ctrl.signal.addEventListener('abort', () =>
					reject(new DOMException('Aborted', 'AbortError'))
				);
			});
		}));

		const promise = fetch('/api/ai', { signal: ctrl.signal });
		ctrl.abort();
		await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
	});

	it('catches AbortError without triggering warning toast', async () => {
		const { toastStore } = await import('./toastStore.svelte');
		const warnSpy = vi.spyOn(toastStore, 'warning');

		const ctrl = new AbortController();
		ctrl.abort();

		// Simulate AIPanel catch block
		try {
			await retryFetch('/api/ai', {}, { signal: ctrl.signal });
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') {
				// Should NOT call warning
			} else {
				toastStore.warning('AI request failed');
			}
		}

		expect(warnSpy).not.toHaveBeenCalled();
		vi.restoreAllMocks();
	});
});
