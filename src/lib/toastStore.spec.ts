import { describe, it, expect, beforeEach } from 'vitest';
import { toastStore } from '$lib/toastStore.svelte';

describe('toastStore', () => {
	beforeEach(() => {
		for (const t of [...toastStore.items]) toastStore.dismiss(t.id);
	});

	it('starts empty', () => {
		expect(toastStore.items.length).toBe(0);
	});

	it('success() adds a success toast', () => {
		toastStore.success('ok');
		expect(toastStore.items.length).toBe(1);
		expect(toastStore.items[0].type).toBe('success');
		expect(toastStore.items[0].message).toBe('ok');
	});

	it('error() adds an error toast', () => {
		toastStore.error('oops');
		expect(toastStore.items[0].type).toBe('error');
	});

	it('info() adds an info toast', () => {
		toastStore.info('hey');
		expect(toastStore.items[0].type).toBe('info');
	});

	it('dismiss() removes the toast by id', () => {
		toastStore.info('test');
		const id = toastStore.items[0].id;
		toastStore.dismiss(id);
		expect(toastStore.items.length).toBe(0);
	});

	it('multiple toasts stack', () => {
		toastStore.success('a');
		toastStore.error('b');
		toastStore.info('c');
		expect(toastStore.items.length).toBe(3);
	});
});
