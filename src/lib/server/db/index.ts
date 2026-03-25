import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Try to load native better-sqlite3 and drizzle adapter. If it fails
// (common on fresh dev environments without build tools / node ABI mismatch),
// export a lightweight stub that allows the app to run in a degraded mode.
let db: unknown = null;
let isMock = false;

// Force mock mode for e2e tests (set via MOCK=true env var in playwright.config.ts)
if (env.MOCK === 'true' || process.env.MOCK === 'true') {
	isMock = true;
}

if (!isMock) {
	// Prefer an explicit DB URL; if missing use an in-memory DB so preview/build can run locally
	const dbUrl = env.DATABASE_URL ?? ':memory:';
	try {
		// dynamic require to avoid early failures during Vite SSR
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const Database = require('better-sqlite3');
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { drizzle } = require('drizzle-orm/better-sqlite3');
		const client = new Database(dbUrl as string);
		db = drizzle(client, { schema });
	} catch (err) {
		// native module failed to load or DB creation failed — fall back to mock
		// eslint-disable-next-line no-console
		console.warn('better-sqlite3 failed to load or init, running with a mocked DB for dev:', (err as Error)?.message || err);
		isMock = true;
	}
}

export { db, isMock };
