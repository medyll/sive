import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';
import StyleSliders from './StyleSliders.svelte';

const defaultValues = { cynicism: 50, complexity: 50, rhythm: 50, density: 50 };

describe('StyleSliders', () => {
	it('renders 4 sliders', async () => {
		render(StyleSliders, { values: { ...defaultValues }, onChange: vi.fn() });
		const inputs = document.querySelectorAll('input[type="range"]');
		expect(inputs).toHaveLength(4);
	});

	it('shows all 4 labels', async () => {
		render(StyleSliders, { values: { ...defaultValues }, onChange: vi.fn() });
		await expect.element(page.getByText('Cynicism')).toBeVisible();
		await expect.element(page.getByText('Syntactic complexity')).toBeVisible();
		await expect.element(page.getByText('Rhythm')).toBeVisible();
		await expect.element(page.getByText('Narrative density')).toBeVisible();
	});

	it('sliders default to value 50', async () => {
		render(StyleSliders, { values: { ...defaultValues }, onChange: vi.fn() });
		const inputs = document.querySelectorAll<HTMLInputElement>('input[type="range"]');
		for (const input of inputs) {
			expect(input.value).toBe('50');
		}
	});

	it('value badges display the current value', async () => {
		render(StyleSliders, { values: { ...defaultValues }, onChange: vi.fn() });
		const badges = document.querySelectorAll('.slider-value');
		expect(badges).toHaveLength(4);
		for (const badge of badges) {
			expect(badge.textContent).toBe('50');
		}
	});

	it('onChange is called with correct key and number when slider changes', async () => {
		const onChange = vi.fn();
		render(StyleSliders, { values: { ...defaultValues }, onChange });
		const input = document.querySelector<HTMLInputElement>('#slider-cynicism')!;
		Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set?.call(input, '75');
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(onChange).toHaveBeenCalledWith('cynicism', 75);
	});
});
