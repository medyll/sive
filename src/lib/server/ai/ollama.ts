/**
 * Ollama Integration
 * 
 * Local AI model support via Ollama API.
 * Provides streaming and non-streaming completions.
 */

interface OllamaMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

interface OllamaOptions {
	model: string;
	temperature?: number;
	top_p?: number;
	num_predict?: number;
	stream?: boolean;
}

interface OllamaResponse {
	model: string;
	created_at: string;
	message: OllamaMessage;
	done: boolean;
	total_duration?: number;
	load_duration?: number;
	prompt_eval_count?: number;
	eval_count?: number;
	eval_duration?: number;
}

interface OllamaStreamResponse {
	model: string;
	created_at: string;
	message: OllamaMessage;
	done: boolean;
}

/**
 * Ollama client class
 */
export class OllamaClient {
	private baseUrl: string;
	private defaultModel: string;

	constructor(baseUrl = 'http://localhost:11434', defaultModel = 'mistral') {
		this.baseUrl = baseUrl;
		this.defaultModel = defaultModel;
	}

	/**
	 * Generate a completion
	 */
	async generate(
		prompt: string,
		options: OllamaOptions = {}
	): Promise<string> {
		const url = `${this.baseUrl}/api/generate`;
		const payload = {
			model: options.model || this.defaultModel,
			prompt,
			stream: false,
			options: {
				temperature: options.temperature ?? 0.7,
				top_p: options.top_p ?? 0.9,
				num_predict: options.num_predict ?? 2048
			}
		};

		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json() as OllamaResponse;
		return data.message?.content || '';
	}

	/**
	 * Generate a completion with streaming
	 */
	async *generateStream(
		prompt: string,
		options: OllamaOptions = {}
	): AsyncGenerator<string, void, unknown> {
		const url = `${this.baseUrl}/api/generate`;
		const payload = {
			model: options.model || this.defaultModel,
			prompt,
			stream: true,
			options: {
				temperature: options.temperature ?? 0.7,
				top_p: options.top_p ?? 0.9,
				num_predict: options.num_predict ?? 2048
			}
		};

		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
		}

		if (!response.body) {
			throw new Error('No response body');
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n').filter((line) => line.trim());

				for (const line of lines) {
					try {
						const data = JSON.parse(line) as OllamaStreamResponse;
						if (data.message?.content) {
							yield data.message.content;
						}
					} catch {
						// Skip invalid JSON lines
					}
				}
			}
		} finally {
			reader.releaseLock();
		}
	}

	/**
	 * Chat completion (multi-turn conversation)
	 */
	async chat(
		messages: OllamaMessage[],
		options: OllamaOptions = {}
	): Promise<string> {
		const url = `${this.baseUrl}/api/chat`;
		const payload = {
			model: options.model || this.defaultModel,
			messages,
			stream: false,
			options: {
				temperature: options.temperature ?? 0.7,
				top_p: options.top_p ?? 0.9,
				num_predict: options.num_predict ?? 2048
			}
		};

		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json() as OllamaResponse;
		return data.message?.content || '';
	}

	/**
	 * Chat completion with streaming
	 */
	async *chatStream(
		messages: OllamaMessage[],
		options: OllamaOptions = {}
	): AsyncGenerator<string, void, unknown> {
		const url = `${this.baseUrl}/api/chat`;
		const payload = {
			model: options.model || this.defaultModel,
			messages,
			stream: true,
			options: {
				temperature: options.temperature ?? 0.7,
				top_p: options.top_p ?? 0.9,
				num_predict: options.num_predict ?? 2048
			}
		};

		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
		}

		if (!response.body) {
			throw new Error('No response body');
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n').filter((line) => line.trim());

				for (const line of lines) {
					try {
						const data = JSON.parse(line) as OllamaStreamResponse;
						if (data.message?.content) {
							yield data.message.content;
						}
					} catch {
						// Skip invalid JSON lines
					}
				}
			}
		} finally {
			reader.releaseLock();
		}
	}

	/**
	 * List available models
	 */
	async listModels(): Promise<string[]> {
		const url = `${this.baseUrl}/api/tags`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json() as { models: Array<{ name: string }> };
		return data.models.map((m) => m.name);
	}

	/**
	 * Check if Ollama is available
	 */
	async isAvailable(): Promise<boolean> {
		try {
			const url = `${this.baseUrl}/api/tags`;
			const response = await fetch(url, { method: 'GET' });
			return response.ok;
		} catch {
			return false;
		}
	}
}

/**
 * Default Ollama client instance
 */
export const ollamaClient = new OllamaClient();
