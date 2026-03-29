/**
 * Multi-Provider AI Service
 * 
 * Unified interface for AI completions across multiple providers.
 * Handles provider selection, fallback, and streaming.
 */

import { aiRouter, AIProvider, ModelConfig } from './router';
import { ollamaClient } from './ollama';

/**
 * AI Service configuration
 */
export interface AIServiceConfig {
	defaultProvider: AIProvider;
	enableFallback: boolean;
	streamingEnabled: boolean;
	maxRetries: number;
}

/**
 * AI Service request
 */
export interface AIRequest {
	prompt: string;
	systemPrompt?: string;
	taskType?: 'coherence' | 'style' | 'review' | 'suggestions' | 'chat' | 'custom';
	provider?: AIProvider;
	config?: Partial<ModelConfig>;
}

/**
 * AI Service response
 */
export interface AIResponse {
	content: string;
	provider: AIProvider;
	model: string;
	duration_ms: number;
	tokens?: {
		prompt: number;
		completion: number;
		total: number;
	};
}

/**
 * AI Service class
 */
export class AIService {
	private config: AIServiceConfig;

	constructor(config?: Partial<AIServiceConfig>) {
		this.config = {
			defaultProvider: 'ollama',
			enableFallback: true,
			streamingEnabled: true,
			maxRetries: 2,
			...config
		};
	}

	/**
	 * Generate a completion
	 */
	async generate(request: AIRequest): Promise<AIResponse> {
		const startTime = Date.now();
		const provider = request.provider || this.config.defaultProvider;
		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
			try {
				const content = await aiRouter.route(
					request.taskType || 'chat',
					request.prompt,
					request.systemPrompt
				);

				return {
					content,
					provider,
					model: aiRouter.getConfigForTask(request.taskType || 'chat').model,
					duration_ms: Date.now() - startTime
				};
			} catch (err) {
				lastError = err instanceof Error ? err : new Error('AI request failed');
				console.error(`[AI Service] Attempt ${attempt + 1} failed:`, lastError.message);

				if (this.config.enableFallback && provider !== 'ollama') {
					console.log('[AI Service] Falling back to Ollama...');
					try {
						const content = await ollamaClient.generate(request.prompt);
						return {
							content,
							provider: 'ollama',
							model: 'mistral',
							duration_ms: Date.now() - startTime
						};
					} catch (fallbackErr) {
						lastError = fallbackErr instanceof Error ? fallbackErr : lastError;
					}
				}
			}
		}

		throw lastError || new Error('AI request failed after all retries');
	}

	/**
	 * Generate with streaming
	 */
	async *generateStream(request: AIRequest): AsyncGenerator<string, void, unknown> {
		const provider = request.provider || this.config.defaultProvider;

		if (!this.config.streamingEnabled) {
			// Non-streaming fallback
			const response = await this.generate(request);
			yield response.content;
			return;
		}

		try {
			yield* aiRouter.routeStream(
				request.taskType || 'chat',
				request.prompt,
				request.systemPrompt
			);
		} catch (err) {
			console.error(`[AI Service] Streaming failed:`, err);

			if (this.config.enableFallback && provider !== 'ollama') {
				console.log('[AI Service] Falling back to Ollama streaming...');
				yield* ollamaClient.generateStream(request.prompt);
			} else {
				throw err;
			}
		}
	}

	/**
	 * Chat completion (multi-turn)
	 */
	async chat(
		messages: Array<{ role: string; content: string }>,
		options?: { provider?: AIProvider; taskType?: string }
	): Promise<AIResponse> {
		const startTime = Date.now();
		const provider = options?.provider || this.config.defaultProvider;

		// Convert messages to prompt
		const systemMessage = messages.find((m) => m.role === 'system');
		const userMessages = messages.filter((m) => m.role !== 'system');
		const prompt = userMessages.map((m) => `${m.role}: ${m.content}`).join('\n\n');

		const content = await aiRouter.route(
			(options?.taskType as keyof typeof aiRouter.routing) || 'chat',
			prompt,
			systemMessage?.content
		);

		return {
			content,
			provider,
			model: aiRouter.getConfigForTask(options?.taskType || 'chat').model,
			duration_ms: Date.now() - startTime
		};
	}

	/**
	 * Chat with streaming
	 */
	async *chatStream(
		messages: Array<{ role: string; content: string }>,
		options?: { provider?: AIProvider; taskType?: string }
	): AsyncGenerator<string, void, unknown> {
		const systemMessage = messages.find((m) => m.role === 'system');
		const userMessages = messages.filter((m) => m.role !== 'system');
		const prompt = userMessages.map((m) => `${m.role}: ${m.content}`).join('\n\n');

		yield* aiRouter.routeStream(
			(options?.taskType as keyof typeof aiRouter.routing) || 'chat',
			prompt,
			systemMessage?.content
		);
	}

	/**
	 * Check if a provider is available
	 */
	async isProviderAvailable(provider: AIProvider): Promise<boolean> {
		return await aiRouter.checkAvailability(provider);
	}

	/**
	 * Get all available providers
	 */
	async getAvailableProviders(): Promise<AIProvider[]> {
		return await aiRouter.getAvailableProviders();
	}

	/**
	 * Get recommended provider for a task
	 */
	async getRecommendedProvider(
		taskType: 'coherence' | 'style' | 'review' | 'suggestions' | 'chat'
	): Promise<AIProvider> {
		const config = aiRouter.getConfigForTask(taskType);
		
		// Check if preferred provider is available
		if (await this.isProviderAvailable(config.provider)) {
			return config.provider;
		}

		// Fall back to first available provider
		const available = await this.getAvailableProviders();
		return available[0] || 'ollama';
	}

	/**
	 * Update service configuration
	 */
	updateConfig(updates: Partial<AIServiceConfig>): void {
		this.config = { ...this.config, ...updates };
	}

	/**
	 * Get current configuration
	 */
	getConfig(): AIServiceConfig {
		return { ...this.config };
	}
}

/**
 * Default AI service instance
 */
export const aiService = new AIService();
