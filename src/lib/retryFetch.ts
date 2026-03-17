/**
 * retryFetch — wraps fetch with exponential back-off retry.
 *
 * Retries on network errors (fetch throws) or 5xx responses.
 * Default: up to 3 attempts, delays 300 / 600 / 1200 ms.
 */

export interface RetryOptions {
	/** Maximum number of attempts (default: 3) */
	maxAttempts?: number;
	/** Base delay in ms — doubles each retry (default: 300) */
	baseDelay?: number;
	/** Optional AbortSignal to cancel all retries */
	signal?: AbortSignal;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
		const timer = setTimeout(resolve, ms);
		signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
	});
}

export async function retryFetch(
	input: RequestInfo | URL,
	init?: RequestInit,
	options: RetryOptions = {}
): Promise<Response> {
	const { maxAttempts = 3, baseDelay = 300, signal } = options;

	let lastError: unknown;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

		try {
			const res = await fetch(input, { ...init, signal });
			// Retry on server errors
			if (res.status >= 500 && attempt < maxAttempts) {
				await delay(baseDelay * Math.pow(2, attempt - 1), signal);
				continue;
			}
			return res;
		} catch (err) {
			// Don't retry aborts
			if (err instanceof DOMException && err.name === 'AbortError') throw err;
			lastError = err;
			if (attempt < maxAttempts) {
				await delay(baseDelay * Math.pow(2, attempt - 1), signal);
			}
		}
	}

	throw lastError ?? new Error('retryFetch: all attempts failed');
}
