import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	globalSetup: path.join(__dirname, 'e2e/global-setup.ts'),
	webServer: { command: 'npm run build && npm run preview', port: 5174, timeout: 120000, env: { MOCK: 'true' } },
	use: {
		baseURL: 'http://localhost:5174',
		actionTimeout: 10000,
		navigationTimeout: 15000
	},
	timeout: 30000,
	testDir: 'e2e'
});
