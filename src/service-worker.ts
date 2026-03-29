/**
 * Service Worker for PWA Offline Support
 * 
 * Caches app shell and documents for offline access.
 * Handles network-first and cache-first strategies.
 */

const CACHE_NAME = 'sive-v1';
const STATIC_CACHE = 'sive-static-v1';
const DOCUMENTS_CACHE = 'sive-docs-v1';

// App shell files to cache immediately
const APP_SHELL = [
	'/',
	'/offline',
	'/_app/immutable/entry/start.js',
	'/_app/immutable/nodes/0.js',
	'/_app/immutable/nodes/1.js'
];

// Install event - cache app shell
self.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.open(STATIC_CACHE).then((cache) => {
			return cache.addAll(APP_SHELL);
		})
	);
	self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys
					.filter((key) => key !== STATIC_CACHE && key !== DOCUMENTS_CACHE)
					.map((key) => caches.delete(key))
			);
		})
	);
	self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event: FetchEvent) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== 'GET') return;

	// Skip cross-origin requests
	if (url.origin !== self.location.origin) return;

	// API requests - network first
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(networkFirst(request));
		return;
	}

	// Document requests - cache first with network fallback
	if (url.pathname.startsWith('/api/export/') || url.pathname.includes('document')) {
		event.respondWith(cacheFirst(request));
		return;
	}

	// App shell - cache first with network fallback
	event.respondWith(cacheFirst(request, true));
});

/**
 * Network first strategy (for API)
 */
async function networkFirst(request: Request): Promise<Response> {
	try {
		const response = await fetch(request);
		if (response.ok) {
			const cache = await caches.open(DOCUMENTS_CACHE);
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		const cached = await caches.match(request);
		if (cached) return cached;
		
		// Return offline error for API
		return new Response(JSON.stringify({ error: 'Offline' }), {
			status: 503,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

/**
 * Cache first strategy (for app shell and documents)
 */
async function cacheFirst(request: Request, fallbackToNetwork = false): Promise<Response> {
	const cached = await caches.match(request);
	if (cached) return cached;

	if (fallbackToNetwork) {
		try {
			const response = await fetch(request);
			if (response.ok) {
				const cache = await caches.open(STATIC_CACHE);
				cache.put(request, response.clone());
			}
			return response;
		} catch {
			// Return offline page
			return caches.match('/offline');
		}
	}

	return new Response('Not found in cache', { status: 404 });
}

/**
 * Message handler for manual cache updates
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
	
	if (event.data && event.data.type === 'CACHE_DOCUMENT') {
		const { docId, content } = event.data;
		event.waitUntil(
			caches.open(DOCUMENTS_CACHE).then((cache) => {
				return cache.put(
					new Request(`/api/documents/${docId}`),
					new Response(JSON.stringify({ id: docId, content }))
				);
			})
		);
	}
});

// TypeScript for service workers
export {};
