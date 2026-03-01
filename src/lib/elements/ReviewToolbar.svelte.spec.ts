import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';
import ReviewToolbar from './ReviewToolbar.svelte';

describe('ReviewToolbar', () => {
	it('renders the Review Mode label', async () => {
		render(ReviewToolbar, {});
		await expect.element(page.getByText('Review Mode')).toBeVisible();
	});

	it('renders the scope selector with 3 options', async () => {
		render(ReviewToolbar, {});
		const select = page.getByRole('combobox', { name: 'Review scope' });
		await expect.element(select).toBeVisible();
		const options = page.getByRole('option');
		// 3 options
		await expect.element(options.nth(0)).toHaveTextContent('Selected passage');
		await expect.element(options.nth(1)).toHaveTextContent('Current chapter');
		await expect.element(options.nth(2)).toHaveTextContent('Entire volume');
	});

	it('default scope is "current chapter"', async () => {
		render(ReviewToolbar, {});
		const select = page.getByRole('combobox', { name: 'Review scope' });
		await expect.element(select).toHaveValue('current chapter');
	});

	it('renders the Run analysis button', async () => {
		render(ReviewToolbar, {});
		await expect.element(page.getByRole('button', { name: 'Run analysis' })).toBeVisible();
	});

	it('clicking Run analysis calls onRunAnalysis', async () => {
		const onRunAnalysis = vi.fn();
		render(ReviewToolbar, { onRunAnalysis });
		await page.getByRole('button', { name: 'Run analysis' }).click();
		expect(onRunAnalysis).toHaveBeenCalledOnce();
	});

	it('renders the Back to writing button', async () => {
		render(ReviewToolbar, {});
		await expect.element(page.getByRole('button', { name: /Back to writing/ })).toBeVisible();
	});

	it('clicking Back to writing calls onExitReview', async () => {
		const onExitReview = vi.fn();
		render(ReviewToolbar, { onExitReview });
		await page.getByRole('button', { name: /Back to writing/ }).click();
		expect(onExitReview).toHaveBeenCalledOnce();
	});

	it('Run analysis button is disabled when analysisRunning=true', async () => {
		render(ReviewToolbar, { analysisRunning: true });
		await expect.element(page.getByRole('button', { name: /Analysing/ })).toBeDisabled();
	});

	it('shows loading text when analysisRunning=true', async () => {
		render(ReviewToolbar, { analysisRunning: true });
		await expect.element(page.getByText('Analysing…')).toBeVisible();
	});
});
