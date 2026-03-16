import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'npm run build && npm run preview', port: 4173, timeout: 120000 },
	use: {
		baseURL: 'http://localhost:4173',
		actionTimeout: 10000,
		navigationTimeout: 15000
	},
	timeout: 30000,
	testDir: 'e2e'
});
