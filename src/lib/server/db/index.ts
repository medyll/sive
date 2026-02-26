import * as schema from './schema';
import { env } from '$env/dynamic/private';

// Try to load native better-sqlite3 and drizzle adapter. If it fails
// (common on fresh dev environments without build tools / node ABI mismatch),
// export a lightweight stub that allows the app to run in a degraded mode.
let db: unknown = null;
let isMock = false;

if (!env.DATABASE_URL) {
	// For local UI work we allow missing DATABASE_URL — export mock
	isMock = true;
} else {
	try {
		// dynamic require to avoid early failures during Vite SSR
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const Database = require('better-sqlite3');
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { drizzle } = require('drizzle-orm/better-sqlite3');
		const client = new Database(env.DATABASE_URL as string);
		db = drizzle(client, { schema });
	} catch (err) {
		// native module failed to load — fall back to mock
		// Log a clear message so devs can see why DB is mocked.
		// Note: avoid console during SSR in production; this is for developer convenience.
		// eslint-disable-next-line no-console
		console.warn('better-sqlite3 failed to load, running with a mocked DB for dev:', err?.message || err);
		isMock = true;
	}
}

export { db, isMock };
