import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		outDir: 'dist',
		minify: false
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					// Registers the afterEach cleanup hook that unmounts rendered
					// components; without it the DOM accumulates across tests in a file.
					setupFiles: ['vitest-browser-svelte'],
					// Interaction tests (locator.click()) wait for actionability. Running
					// the whole suite in parallel starves the browser enough that the
					// default 5s budget expires, which showed up as tests failing at
					// random and passing on re-run. One browser file at a time, with more
					// headroom, trades a little wall time for a deterministic result.
					fileParallelism: false,
					testTimeout: 20000,
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**', 'src/lib/elements/SummaryPanel.svelte.spec.ts']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
