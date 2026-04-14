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
 * 
 * Supported providers:
 * - ollama: Local models (Mistral, Llama, etc.)
 * - anthropic: Claude models
 * - openai: GPT-4, GPT-4o, o1
 * - gemini: Google Gemini
 * - mistral: Mistral AI (French)
 * - groq: Ultra-fast inference
 * - deepseek: Code specialist (Chinese)
 * - qwen: Alibaba Cloud (Chinese)
 * - cohere: Enterprise focus
 */
export type AIProvider = 
	| 'ollama'
	| 'anthropic'
	| 'openai'
	| 'gemini'
	| 'mistral'
	| 'groq'
	| 'deepseek'
	| 'qwen'
	| 'cohere';

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
 * 
 * Strategy:
 * - Local-first: Ollama for simple tasks (coherence, style)
 * - Quality: Anthropic Claude for complex tasks (review, suggestions)
 * - Speed: Groq for real-time needs
 * - Cost-effective: DeepSeek/Qwen for bulk operations
 * - Fallback: Ollama (always available locally)
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
 * Alternative provider configurations (cost/performance optimized)
 */
const COST_OPTIMIZED_ROUTING: RoutingConfig = {
	coherence: { provider: 'deepseek', model: 'deepseek-chat', temperature: 0.3 },
	style: { provider: 'deepseek', model: 'deepseek-chat', temperature: 0.5 },
	review: { provider: 'qwen', model: 'qwen-max', temperature: 0.3, maxTokens: 2048 },
	suggestions: { provider: 'qwen', model: 'qwen-max', temperature: 0.7, maxTokens: 512 },
	chat: { provider: 'qwen', model: 'qwen-max', temperature: 0.7, maxTokens: 1024 },
	fallback: { provider: 'ollama', model: 'mistral', temperature: 0.7 }
};

const SPEED_OPTIMIZED_ROUTING: RoutingConfig = {
	coherence: { provider: 'groq', model: 'llama-3.1-70b-versatile', temperature: 0.3 },
	style: { provider: 'groq', model: 'llama-3.1-70b-versatile', temperature: 0.5 },
	review: { provider: 'groq', model: 'llama-3.1-70b-versatile', temperature: 0.3, maxTokens: 2048 },
	suggestions: { provider: 'groq', model: 'llama-3.1-70b-versatile', temperature: 0.7, maxTokens: 512 },
	chat: { provider: 'groq', model: 'llama-3.1-70b-versatile', temperature: 0.7, maxTokens: 1024 },
	fallback: { provider: 'ollama', model: 'mistral', temperature: 0.7 }
};

const EUROPEAN_ROUTING: RoutingConfig = {
	coherence: { provider: 'mistral', model: 'mistral-small', temperature: 0.3 },
	style: { provider: 'mistral', model: 'mistral-small', temperature: 0.5 },
	review: { provider: 'mistral', model: 'mistral-large', temperature: 0.3, maxTokens: 2048 },
	suggestions: { provider: 'mistral', model: 'mistral-large', temperature: 0.7, maxTokens: 512 },
	chat: { provider: 'mistral', model: 'mistral-medium', temperature: 0.7, maxTokens: 1024 },
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
				case 'mistral':
					return await this.callMistral(prompt, config, systemPrompt);
				case 'groq':
					return await this.callGroq(prompt, config, systemPrompt);
				case 'deepseek':
					return await this.callDeepSeek(prompt, config, systemPrompt);
				case 'qwen':
					return await this.callQwen(prompt, config, systemPrompt);
				case 'cohere':
					return await this.callCohere(prompt, config, systemPrompt);
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
	private async callOllama(prompt: string, config: ModelConfig, systemPrompt?: string): Promise<string> {
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
	 * Call OpenAI
	 */
	private async callOpenAI(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): Promise<string> {
		if (!config.apiKey && !process.env.OPENAI_API_KEY) {
			throw new Error('OpenAI API key not configured');
		}

		const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
		const { default: OpenAI } = await import('openai');
		const client = new OpenAI({ apiKey });

		const messages: Array<{ role: string; content: string }> = [
			{ role: 'system', content: systemPrompt || 'You are a helpful AI writing assistant.' },
			{ role: 'user', content: prompt }
		];

		const completion = await client.chat.completions.create({
			model: config.model || 'gpt-4o',
			messages,
			max_tokens: config.maxTokens || 1024,
			temperature: config.temperature || 0.7
		});

		return completion.choices[0]?.message?.content || '';
	}

	/**
	 * Stream from OpenAI
	 */
	private async *streamOpenAI(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): AsyncGenerator<string, void, unknown> {
		const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
		const { default: OpenAI } = await import('openai');
		const client = new OpenAI({ apiKey });

		const messages: Array<{ role: string; content: string }> = [
			{ role: 'system', content: systemPrompt || 'You are a helpful AI writing assistant.' },
			{ role: 'user', content: prompt }
		];

		const stream = await client.chat.completions.create({
			model: config.model || 'gpt-4o',
			messages,
			max_tokens: config.maxTokens || 1024,
			temperature: config.temperature || 0.7,
			stream: true
		});

		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta?.content;
			if (content) yield content;
		}
	}

	/**
	 * Call Gemini (Google)
	 */
	private async callGemini(prompt: string, config: ModelConfig): Promise<string> {
		if (!config.apiKey && !process.env.GEMINI_API_KEY) {
			throw new Error('Gemini API key not configured');
		}

		const apiKey = config.apiKey || process.env.GEMINI_API_KEY;
		const { GoogleGenerativeAI } = await import('@google/generative-ai');
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: config.model || 'gemini-pro' });

		const result = await model.generateContent({
			contents: [{ role: 'user', parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt }] }],
			generationConfig: {
				maxOutputTokens: config.maxTokens || 1024,
				temperature: config.temperature || 0.7
			}
		});

		return result.response.text();
	}

	/**
	 * Stream from Gemini
	 */
	private async *streamGemini(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): AsyncGenerator<string, void, unknown> {
		const apiKey = config.apiKey || process.env.GEMINI_API_KEY;
		const { GoogleGenerativeAI } = await import('@google/generative-ai');
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: config.model || 'gemini-pro' });

		const result = await model.generateContentStream({
			contents: [{ role: 'user', parts: [{ text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt }] }],
			generationConfig: {
				maxOutputTokens: config.maxTokens || 1024,
				temperature: config.temperature || 0.7
			}
		});

		for await (const chunk of result.stream) {
			yield chunk.text();
		}
	}

	/**
	 * Call Mistral AI (French)
	 */
	private async callMistral(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): Promise<string> {
		if (!config.apiKey && !process.env.MISTRAL_API_KEY) {
			throw new Error('Mistral API key not configured');
		}

		const apiKey = config.apiKey || process.env.MISTRAL_API_KEY;
		const { MistralClient } = await import('@mistralai/mistralai');
		const client = new MistralClient(apiKey);

		const messages: Array<{ role: string; content: string }> = [
			{ role: 'system', content: systemPrompt || 'You are a helpful AI writing assistant.' },
			{ role: 'user', content: prompt }
		];

		const response = await client.chat({
			model: config.model || 'mistral-large',
			messages,
			maxTokens: config.maxTokens || 1024,
			temperature: config.temperature || 0.7
		});

		return response.choices[0]?.message?.content || '';
	}

	/**
	 * Stream from Mistral AI
	 */
	private async *streamMistral(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): AsyncGenerator<string, void, unknown> {
		const apiKey = config.apiKey || process.env.MISTRAL_API_KEY;
		const { MistralClient } = await import('@mistralai/mistralai');
		const client = new MistralClient(apiKey);

		const messages: Array<{ role: string; content: string }> = [
			{ role: 'system', content: systemPrompt || 'You are a helpful AI writing assistant.' },
			{ role: 'user', content: prompt }
		];

		const stream = await client.chatStream({
			model: config.model || 'mistral-large',
			messages,
			maxTokens: config.maxTokens || 1024,
			temperature: config.temperature || 0.7
		});

		for await (const chunk of stream) {
			if (chunk.choices[0]?.delta?.content) {
				yield chunk.choices[0].delta.content;
			}
		}
	}

	/**
	 * Call Groq (Ultra-fast inference)
	 */
	private async callGroq(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): Promise<string> {
		if (!config.apiKey && !process.env.GROQ_API_KEY) {
			throw new Error('Groq API key not configured');
		}

		const apiKey = config.apiKey || process.env.GROQ_API_KEY;
		const { Groq } = await import('groq-sdk');
		const client = new Groq({ apiKey });

		const messages: Array<{ role: string; content: string }> = [
			{ role: 'system', content: systemPrompt || 'You are a helpful AI writing assistant.' },
			{ role: 'user', content: prompt }
		];

		const completion = await client.chat.completions.create({
			model: config.model || 'llama-3.1-70b-versatile',
			messages,
			max_tokens: config.maxTokens || 1024,
			temperature: config.temperature || 0.7
		});

		return completion.choices[0]?.message?.content || '';
	}

	/**
	 * Stream from Groq
	 */
	private async *streamGroq(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): AsyncGenerator<string, void, unknown> {
		const apiKey = config.apiKey || process.env.GROQ_API_KEY;
		const { Groq } = await import('groq-sdk');
		const client = new Groq({ apiKey });

		const messages: Array<{ role: string; content: string }> = [
			{ role: 'system', content: systemPrompt || 'You are a helpful AI writing assistant.' },
			{ role: 'user', content: prompt }
		];

		const stream = await client.chat.completions.create({
			model: config.model || 'llama-3.1-70b-versatile',
			messages,
			max_tokens: config.maxTokens || 1024,
			temperature: config.temperature || 0.7,
			stream: true
		});

		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta?.content;
			if (content) yield content;
		}
	}

	/**
	 * Call DeepSeek (Chinese, code specialist)
	 */
	private async callDeepSeek(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): Promise<string> {
		if (!config.apiKey && !process.env.DEEPSEEK_API_KEY) {
			throw new Error('DeepSeek API key not configured');
		}

		const apiKey = config.apiKey || process.env.DEEPSEEK_API_KEY;
		// DeepSeek uses OpenAI-compatible API
		const { default: OpenAI } = await import('openai');
		const client = new OpenAI({ 
			apiKey, 
			baseURL: 'https://api.deepseek.com/v1' 
		});

		const messages: Array<{ role: string; content: string }> = [
			{ role: 'system', content: systemPrompt || 'You are a helpful AI writing assistant.' },
			{ role: 'user', content: prompt }
		];

		const completion = await client.chat.completions.create({
			model: config.model || 'deepseek-chat',
			messages,
			max_tokens: config.maxTokens || 1024,
			temperature: config.temperature || 0.7
		});

		return completion.choices[0]?.message?.content || '';
	}

	/**
	 * Call Qwen (Alibaba Cloud)
	 */
	private async callQwen(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): Promise<string> {
		if (!config.apiKey && !process.env.DASHSCOPE_API_KEY) {
			throw new Error('DashScope (Qwen) API key not configured');
		}

		const apiKey = config.apiKey || process.env.DASHSCOPE_API_KEY;
		// Qwen uses OpenAI-compatible API via DashScope
		const { default: OpenAI } = await import('openai');
		const client = new OpenAI({ 
			apiKey, 
			baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1' 
		});

		const messages: Array<{ role: string; content: string }> = [
			{ role: 'system', content: systemPrompt || 'You are a helpful AI writing assistant.' },
			{ role: 'user', content: prompt }
		];

		const completion = await client.chat.completions.create({
			model: config.model || 'qwen-max',
			messages,
			max_tokens: config.maxTokens || 1024,
			temperature: config.temperature || 0.7
		});

		return completion.choices[0]?.message?.content || '';
	}

	/**
	 * Call Cohere (Enterprise focus)
	 */
	private async callCohere(
		prompt: string,
		config: ModelConfig,
		systemPrompt?: string
	): Promise<string> {
		if (!config.apiKey && !process.env.COHERE_API_KEY) {
			throw new Error('Cohere API key not configured');
		}

		const apiKey = config.apiKey || process.env.COHERE_API_KEY;
		const { CohereClient } = await import('cohere-ai');
		const cohere = new CohereClient({ token: apiKey });

		const response = await cohere.chat({
			message: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
			model: config.model || 'command-r-plus',
			maxTokens: config.maxTokens || 1024,
			temperature: config.temperature || 0.7
		});

		return response.text || '';
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
			case 'mistral':
				available = !!(process.env.MISTRAL_API_KEY);
				break;
			case 'groq':
				available = !!(process.env.GROQ_API_KEY);
				break;
			case 'deepseek':
				available = !!(process.env.DEEPSEEK_API_KEY);
				break;
			case 'qwen':
				available = !!(process.env.DASHSCOPE_API_KEY);
				break;
			case 'cohere':
				available = !!(process.env.COHERE_API_KEY);
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
		const providers: AIProvider[] = [
			'ollama', 'anthropic', 'openai', 'gemini',
			'mistral', 'groq', 'deepseek', 'qwen', 'cohere'
		];
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
