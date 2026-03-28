import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Allow skipping Playwright-managed webServer when preview is started separately
const webServerConfig = process.env.PW_SKIP_WEB_SERVER === '1' ? undefined : { command: 'npm run build && npm run preview', port: 4173, timeout: 300000, env: { MOCK: 'true' } };

export default defineConfig({
	globalSetup: path.join(__dirname, 'e2e/global-setup.ts'),
	use: {
		baseURL: 'http://localhost:4173',
		storageState: 'e2e/storageState.json',
		viewport: { width: 1366, height: 900 },
		launchOptions: { args: ['--window-size=1366,900'] },
		actionTimeout: 20000,
		navigationTimeout: 30000
	},
	webServer: webServerConfig,
	timeout: 60000,
	testDir: 'e2e',
	reuseExistingServer: true
});
