import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import Spinner from './Spinner.svelte';

describe('Spinner', () => {
	it('renders with default medium size class', async () => {
		render(Spinner, {});
		const el = page.getByRole('status');
		await expect.element(el).toBeVisible();
		await expect.element(el).toHaveClass(/medium/);
	});

	it('renders with small size class', async () => {
		render(Spinner, { size: 'small' });
		await expect.element(page.getByRole('status')).toHaveClass(/small/);
	});

	it('renders with large size class', async () => {
		render(Spinner, { size: 'large' });
		await expect.element(page.getByRole('status')).toHaveClass(/large/);
	});

	it('applies the data-theme attribute from theme prop', async () => {
		render(Spinner, { theme: 'dark' });
		await expect.element(page.getByRole('status')).toHaveAttribute('data-theme', 'dark');
	});

	it('defaults to light theme', async () => {
		render(Spinner, {});
		await expect.element(page.getByRole('status')).toHaveAttribute('data-theme', 'light');
	});
});
