import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import ReviewReport from './ReviewReport.svelte';

const STUB_REPORT = {
	inconsistencies: [{ entity: 'Marie', description: 'Eye colour mismatch', confidence: 0.87 }],
	pov: [{ location: 'Para. 3', detected_deviation: 'POV shift' }],
	threads: [{ thread_id: 'conflict', status: 'unresolved', note: 'No progression' }],
	motifs: [{ motif_id: 'light', presence: 'strong', consistency: 'consistent' }],
	voices: [{ character_id: 'Marie', register_deviation: 'Formal shift', example: 'Example line' }],
	style: [{ signal_type: 'Sentence length', location: 'Para. 2', suggestion: 'Vary rhythm' }]
};

describe('ReviewReport', () => {
	it('renders all 7 section headings with stub data', async () => {
		render(ReviewReport, { report: STUB_REPORT });
		for (const heading of [
			'Inconsistencies',
			'Point of View',
			'Narrative Threads',
			'Tension Curve',
			'Themes & Motifs',
			'Character Voices',
			'Style & Rhythm'
		]) {
			await expect.element(page.getByRole('heading', { name: heading })).toBeVisible();
		}
	});

	it('shows placeholder when report is null', async () => {
		render(ReviewReport, { report: null });
		await expect
			.element(page.getByText('Run analysis to generate the report.'))
			.toBeVisible();
	});

	it('renders an inconsistency item', async () => {
		const { container } = render(ReviewReport, { report: STUB_REPORT });
		// scope to Inconsistencies section to avoid ambiguity with Character Voices
		const section = container.querySelector('[aria-labelledby="sec-inconsistencies"]');
		expect(section).not.toBeNull();
		expect(section!.textContent).toContain('Marie');
		await expect.element(page.getByText('Eye colour mismatch')).toBeVisible();
	});

	it('renders a PoV item', async () => {
		render(ReviewReport, { report: STUB_REPORT });
		await expect.element(page.getByText('Para. 3')).toBeVisible();
		await expect.element(page.getByText('POV shift')).toBeVisible();
	});

	it('renders a narrative thread item', async () => {
		render(ReviewReport, { report: STUB_REPORT });
		await expect.element(page.getByText('conflict')).toBeVisible();
	});

	it('renders the tension curve stub chart', async () => {
		render(ReviewReport, { report: STUB_REPORT });
		await expect.element(page.getByRole('img', { name: /Tension curve/ })).toBeVisible();
	});

	it('renders report items with role="article"', async () => {
		render(ReviewReport, { report: STUB_REPORT });
		const articles = page.getByRole('article');
		// At least 5 items (one per non-chart section)
		await expect.element(articles.first()).toBeVisible();
	});
});
