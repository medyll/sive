/**
 * AI Model Router
 * 
 * Routes AI requests to appropriate provider based on:
 * - Task type (coherence, style, review, suggestions)
 * - User configuration
 * - Model availability
 * - Data sensitivity (local vs cloud)
 */

import { ollamaClient, OllamaClient } from './ollama';

/**
 * AI Provider types
 */
export type AIProvider = 'ollama' | 'anthropic' | 'openai' | 'gemini';

/**
 * Model configuration
 */
export interface ModelConfig {
	provider: AIProvider;
	model: string;
	apiKey?: string;
	endpoint?: string;
	maxTokens?: number;
	temperature?: number;
}

/**
 * Task-based routing configuration
 */
export interface RoutingConfig {
	coherence: ModelConfig;
	style: ModelConfig;
	review: ModelConfig;
	suggestions: ModelConfig;
	chat: ModelConfig;
	fallback: ModelConfig;
}

/**
 * Default routing configuration
 */
const DEFAULT_ROUTING: RoutingConfig = {
	coherence: { provider: 'ollama', model: 'mistral', temperature: 0.3 },
	style: { provider: 'ollama', model: 'mistral', temperature: 0.5 },
	review: { provider: 'anthropic', model: 'claude-haiku-4-5', temperature: 0.3, maxTokens: 2048 },
	suggestions: { provider: 'anthropic', model: 'claude-haiku-4-5', temperature: 0.7, maxTokens: 512 },
	chat: { provider: 'anthropic', model: 'claude-haiku-4-5', temperature: 0.7, maxTokens: 1024 },
	fallback: { provider: 'ollama', model: 'mistral', temperature: 0.7 }
};

/**
 * AI Model Router class
 */
export class AIModelRouter {
	private routing: RoutingConfig;
	private ollamaClient: OllamaClient;
	private availabilityCache: Map<AIProvider, boolean> = new Map();

	constructor(routing?: Partial<RoutingConfig>) {
		this.routing = { ...DEFAULT_ROUTING, ...routing };
		this.ollamaClient = ollamaClient;
	}

	/**
	 * Get model config for a task type
	 */
	getConfigForTask(taskType: keyof RoutingConfig): ModelConfig {
		return this.routing[taskType] || this.routing.fallback;
	}

	/**
	 * Route a prompt to the appropriate provider
	 */
	async route(
		taskType: keyof RoutingConfig,
		prompt: string,
		systemPrompt?: string
	): Promise<string> {
		const config = this.getConfigForTask(taskType);

		try {
			switch (config.provider) {
				case 'ollama':
					return await this.callOllama(prompt, config);
				case 'anthropic':
					return await this.callAnthropic(prompt, config, systemPrompt);
				case 'openai':
					return await this.callOpenAI(prompt, config, systemPrompt);
				case 'gemini':
					return await this.callGemini(prompt, config);
				default:
					return await this.callOllama(prompt, this.routing.fallback);
			}
		} catch (err) {
			console.error(`[AI Router] ${config.provider} failed, using fallback:`, err);
			// Fallback to Ollama
			return await this.callOllama(prompt, this.routing.fallback);
		}
	}

	/**
	 * Route with streaming
	 */
	async *routeStream(
		taskType: keyof RoutingConfig,
		prompt: string,
		systemPrompt?: string
	): AsyncGenerator<string, void, unknown> {
		const config = this.getConfigForTask(taskType);

		try {
			switch (config.provider) {
				case 'ollama':
					yield* this.streamOllama(prompt, config);
					break;
				case 'anthropic':
					yield* this.streamAnthropic(prompt, config, systemPrompt);
					break;
				case 'openai':
					yield* this.streamOpenAI(prompt, config, systemPrompt);
					break;
				case 'gemini':
					yield* this.streamGemini(prompt, config);
					break;
				default:
					yield* this.streamOllama(prompt, this.routing.fallback);
			}
		} catch (err) {
			console.error(`[AI Router] ${config.provider} streaming failed, using fallback:`, err);
			// Fallback to Ollama
			yield* this.streamOllama(prompt, this.routing.fallback);
		}
	}

	/**
	 * Call Ollama
	 */
	private async callOllama(prompt: string, config: ModelConfig): Promise<string> {
		const fullPrompt = systemPrompt 
			? `${systemPrompt}\n\n${prompt}` 
			: prompt;
		
		return await this.ollamaClient.generate(fullPrompt, {
			model: config.model,
			temperature: config.temperature,
			num_predict: config.maxTokens
		});
	}

	/**
	 * Stream from Ollama
	 */
	private async *streamOllama(
		prompt: string,
		config: ModelConfig
	): AsyncGenerator<string, void, unknown> {
		yield* this.ollamaClient.generateStream(prompt, {
			model: config.model,
			temperature: config.temperature,
			num_predict: config.maxTokens
		});
	}

	/**
	 * Call Anthropic (stub - implement with @anthropic-ai/sdk)
	 */
	private async callAnthropic(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): Promise<string> {
		if (!config.apiKey && !process.env.ANTHROPIC_API_KEY) {
			throw new Error('Anthropic API key not configured');
		}

		const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
		
		// Dynamic import to avoid bundling if not used
		const { default: Anthropic } = await import('@anthropic-ai/sdk');
		const client = new Anthropic({ apiKey });

		const messages: Array<{ role: string; content: string }> = [
			{ role: 'user', content: prompt }
		];

		const msg = await client.messages.create({
			model: config.model,
			max_tokens: config.maxTokens || 1024,
			system: systemPrompt || 'You are a helpful AI writing assistant.',
			messages
		});

		const block = msg.content[0];
		return block.type === 'text' ? block.text : '';
	}

	/**
	 * Stream from Anthropic (stub)
	 */
	private async *streamAnthropic(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): AsyncGenerator<string, void, unknown> {
		// For now, use non-streaming call
		// In production, use Anthropic's streaming API
		const result = await this.callAnthropic(prompt, config, systemPrompt);
		yield result;
	}

	/**
	 * Call OpenAI (stub - implement with openai package)
	 */
	private async callOpenAI(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): Promise<string> {
		if (!config.apiKey && !process.env.OPENAI_API_KEY) {
			throw new Error('OpenAI API key not configured');
		}

		// Stub implementation
		throw new Error('OpenAI integration not yet implemented');
	}

	/**
	 * Stream from OpenAI (stub)
	 */
	private async *streamOpenAI(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): AsyncGenerator<string, void, unknown> {
		throw new Error('OpenAI streaming not yet implemented');
	}

	/**
	 * Call Gemini (stub - implement with @google/generative-ai)
	 */
	private async callGemini(prompt: string, config: ModelConfig): Promise<string> {
		if (!config.apiKey && !process.env.GEMINI_API_KEY) {
			throw new Error('Gemini API key not configured');
		}

		// Stub implementation
		throw new Error('Gemini integration not yet implemented');
	}

	/**
	 * Stream from Gemini (stub)
	 */
	private async *streamGemini(
		prompt: string,
		config: ModelConfig
	): AsyncGenerator<string, void, unknown> {
		throw new Error('Gemini streaming not yet implemented');
	}

	/**
	 * Check provider availability
	 */
	async checkAvailability(provider: AIProvider): Promise<boolean> {
		// Check cache first (5 minute TTL)
		const cached = this.availabilityCache.get(provider);
		if (cached !== undefined) {
			return cached;
		}

		let available = false;

		switch (provider) {
			case 'ollama':
				available = await this.ollamaClient.isAvailable();
				break;
			case 'anthropic':
				available = !!(process.env.ANTHROPIC_API_KEY);
				break;
			case 'openai':
				available = !!(process.env.OPENAI_API_KEY);
				break;
			case 'gemini':
				available = !!(process.env.GEMINI_API_KEY);
				break;
		}

		// Cache result
		this.availabilityCache.set(provider, available);

		// Clear cache after 5 minutes
		setTimeout(() => {
			this.availabilityCache.delete(provider);
		}, 5 * 60 * 1000);

		return available;
	}

	/**
	 * Get all available providers
	 */
	async getAvailableProviders(): Promise<AIProvider[]> {
		const providers: AIProvider[] = ['ollama', 'anthropic', 'openai', 'gemini'];
		const available: AIProvider[] = [];

		for (const provider of providers) {
			if (await this.checkAvailability(provider)) {
				available.push(provider);
			}
		}

		return available;
	}

	/**
	 * Update routing configuration
	 */
	updateRouting(updates: Partial<RoutingConfig>): void {
		this.routing = { ...this.routing, ...updates };
	}

	/**
	 * Get current routing configuration
	 */
	getRouting(): RoutingConfig {
		return { ...this.routing };
	}
}

/**
 * Default AI router instance
 */
export const aiRouter = new AIModelRouter();
