/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />
import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// In dev mode, be a no-op SW — avoids Vite HMR interference
if (DEV) {
	self.addEventListener('install', () => self.skipWaiting());
	self.addEventListener('activate', () => self.clients.claim());
} else {
	const CACHE = `sive-${version}`;
	const ASSETS = [...build, ...files];

	self.addEventListener('install', (e) => {
		e.waitUntil(
			caches.open(CACHE).then((c) =>
				Promise.allSettled(ASSETS.map((asset) => c.add(asset)))
			).then(() => self.skipWaiting())
		);
	});

	self.addEventListener('activate', (e) => {
		e.waitUntil(
			caches.keys()
				.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
				.then(() => self.clients.claim())
		);
	});

	self.addEventListener('fetch', (e) => {
		if (e.request.method !== 'GET') return;
		const url = new URL(e.request.url);
		if (!url.protocol.startsWith('http')) return;

		if (url.pathname.startsWith('/api/')) {
			e.respondWith(
				fetch(e.request).catch(() =>
					new Response(JSON.stringify({ error: 'offline' }), {
						headers: { 'Content-Type': 'application/json' }
					})
				)
			);
			return;
		}

		const isAsset = ASSETS.includes(url.pathname);
		e.respondWith(
			isAsset
				? caches.match(e.request).then((cached) => cached ?? fetch(e.request))
				: fetch(e.request)
						.then((res) => {
							if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
							return res;
						})
						.catch(() => caches.match(e.request) ?? caches.match('/offline'))
		);
	});

	self.addEventListener('push', (e) => {
		const data = e.data?.json() ?? {};
		e.waitUntil(
			self.registration.showNotification(data.title ?? 'Sive', {
				body: data.body ?? '',
				icon: '/icons/icon-192.png',
				badge: '/icons/icon-192.png',
				data: { url: data.url ?? '/' }
			})
		);
	});

	self.addEventListener('notificationclick', (e) => {
		e.notification.close();
		e.waitUntil(self.clients.openWindow(e.notification.data?.url ?? '/'));
	});
}
