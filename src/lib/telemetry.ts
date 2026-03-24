export type TelemetryPayload = Record<string, unknown>;

export function trackEvent(name: string, payload: TelemetryPayload = {}): void {
	try {
		const body = JSON.stringify({ name, payload, timestamp: new Date().toISOString() });
		if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
			// sendBeacon prefers ArrayBufferView or Blob; use simple POST as string via fetch if unavailable
			try { (navigator as any).sendBeacon('/api/telemetry', body); return; } catch {};
		}
		// Fallback to fetch with keepalive
		if (typeof fetch !== 'undefined') {
			fetch('/api/telemetry', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body,
				keepalive: true
			}).catch(() => {});
		}
	} catch (e) {
		// non-fatal
		console.warn('trackEvent error', e);
	}
}
