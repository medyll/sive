import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import StyleSignal from './StyleSignal.svelte';

describe('StyleSignal', () => {
	it('renders location, signal, and suggestion', async () => {
		render(StyleSignal, {
			location: 'Para. 2',
			signal: 'Repetition',
			suggestion: 'The word "dark" appears 3 times.'
		});
		await expect.element(page.getByText('Para. 2')).toBeVisible();
		await expect.element(page.getByText('Repetition')).toBeVisible();
		await expect.element(page.getByText('The word "dark" appears 3 times.')).toBeVisible();
	});

	it('has role="article" on the card', async () => {
		const { container } = render(StyleSignal, {
			location: 'Para. 1',
			signal: 'Rhythm break',
			suggestion: 'Consider varying sentence length.'
		});
		const article = container.querySelector('article');
		expect(article).not.toBeNull();
	});

	it('renders a coloured badge for the signal type', async () => {
		const { container } = render(StyleSignal, {
			location: 'Para. 4',
			signal: 'Lexical density',
			suggestion: 'Reduce noun clusters.'
		});
		const badge = container.querySelector('.signal-badge') as HTMLElement | null;
		expect(badge).not.toBeNull();
		expect(badge!.style.backgroundColor).toBeTruthy();
	});

	it('uses a fallback badge colour for unknown signal types', async () => {
		const { container } = render(StyleSignal, {
			location: 'Para. 7',
			signal: 'Unknown type',
			suggestion: 'Some suggestion.'
		});
		const badge = container.querySelector('.signal-badge') as HTMLElement | null;
		expect(badge!.style.backgroundColor).toBeTruthy();
	});
});
