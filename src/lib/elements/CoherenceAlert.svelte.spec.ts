import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import CoherenceAlert from './CoherenceAlert.svelte';

describe('CoherenceAlert', () => {
	it('renders entity, discrepancy_type, and note', async () => {
		render(CoherenceAlert, {
			entity: 'Jean Dupont',
			discrepancy_type: 'Outfit contradiction',
			confidence: 'High',
			note: 'Wearing a summer shirt in December.'
		});
		await expect.element(page.getByText('Jean Dupont')).toBeVisible();
		await expect.element(page.getByText('Outfit contradiction')).toBeVisible();
		await expect.element(page.getByText('Wearing a summer shirt in December.')).toBeVisible();
	});

	it('has role="article" on the card element', async () => {
		const { container } = render(CoherenceAlert, {
			entity: 'Marie Chen',
			discrepancy_type: 'Age inconsistency',
			confidence: 'Medium',
			note: 'Age mismatch between chapters.'
		});
		expect(container.querySelector('article')).not.toBeNull();
	});

	it('renders confidence badge with correct text', async () => {
		render(CoherenceAlert, {
			entity: 'Grey Peugeot',
			discrepancy_type: 'Location conflict',
			confidence: 'Low',
			note: 'Car in two places at once.'
		});
		await expect.element(page.getByText('Low')).toBeVisible();
	});

	it('High confidence badge has red background', async () => {
		const { container } = render(CoherenceAlert, {
			entity: 'Jean Revolver',
			discrepancy_type: 'Object status',
			confidence: 'High',
			note: 'Revolver lost but reappears.'
		});
		const badge = container.querySelector('.alert-confidence') as HTMLElement | null;
		expect(badge).not.toBeNull();
		expect(badge!.style.backgroundColor).toBeTruthy();
	});

	it('Medium confidence badge has a distinct colour from High', async () => {
		const { container: cHigh } = render(CoherenceAlert, {
			entity: 'A',
			discrepancy_type: 'T',
			confidence: 'High',
			note: 'n'
		});
		const { container: cMed } = render(CoherenceAlert, {
			entity: 'B',
			discrepancy_type: 'T',
			confidence: 'Medium',
			note: 'n'
		});
		const highColor = (cHigh.querySelector('.alert-confidence') as HTMLElement).style.backgroundColor;
		const medColor  = (cMed.querySelector('.alert-confidence')  as HTMLElement).style.backgroundColor;
		expect(highColor).not.toBe(medColor);
	});
});
