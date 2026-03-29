/**
 * Command Bus — Core Implementation
 * 
 * Central event bus for skill-to-app communication.
 * Skills emit commands, app modules register handlers.
 * 
 * @module commandBus
 */

/**
 * Command event structure
 */
export interface CommandEvent<T = unknown> {
	/** Command name in format: module.action */
	command: string;
	/** Command parameters */
	params: T;
	/** Error handling behavior */
	on_error?: 'ignore' | 'abort' | 'notify';
	/** Resolve callback with result */
	resolve: (result: unknown) => void;
	/** Reject callback with error */
	reject: (error: Error) => void;
}

/**
 * Command handler function type
 */
export type CommandHandler<T = unknown, R = unknown> = (params: T) => Promise<R> | R;

/**
 * Command registry entry
 */
interface CommandRegistryEntry {
	handler: CommandHandler;
	description: string;
	module: string;
}

/**
 * Command Bus class
 * 
 * Singleton pattern - one bus per application instance
 */
export class CommandBus {
	private static instance: CommandBus;
	private registry: Map<string, CommandRegistryEntry> = new Map();
	private eventHistory: Array<{ command: string; timestamp: Date; success: boolean }> = [];

	private constructor() {}

	/**
	 * Get singleton instance
	 */
	static getInstance(): CommandBus {
		if (!CommandBus.instance) {
			CommandBus.instance = new CommandBus();
		}
		return CommandBus.instance;
	}

	/**
	 * Register a command handler
	 * @param command - Command name (e.g., 'ui.open_tab')
	 * @param handler - Handler function
	 * @param description - Human-readable description
	 */
	register<T = unknown, R = unknown>(
		command: string,
		handler: CommandHandler<T, R>,
		description: string = ''
	): void {
		const [module] = command.split('.');
		
		if (this.registry.has(command)) {
			console.warn(`[CommandBus] Overriding existing command: ${command}`);
		}

		this.registry.set(command, { handler: handler as CommandHandler, description, module });
		console.log(`[CommandBus] Registered: ${command} - ${description || 'No description'}`);
	}

	/**
	 * Execute a command
	 * @param command - Command name
	 * @param params - Command parameters
	 * @returns Promise resolving to command result
	 */
	async execute<T = unknown, R = unknown>(
		command: string,
		params?: T,
		on_error: 'ignore' | 'abort' | 'notify' = 'notify'
	): Promise<R> {
		const entry = this.registry.get(command);

		if (!entry) {
			const error = new Error(`Unknown command: ${command}`);
			this.logEvent(command, false);
			
			if (on_error === 'abort') {
				throw error;
			} else if (on_error === 'notify') {
				console.error(`[CommandBus] ${error.message}`);
				// In app context, would trigger UI notification
			}
			// 'ignore' falls through silently
			return undefined as R;
		}

		try {
			const result = await entry.handler(params as T);
			this.logEvent(command, true);
			return result as R;
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Command execution failed');
			this.logEvent(command, false);

			if (on_error === 'abort') {
				throw error;
			} else if (on_error === 'notify') {
				console.error(`[CommandBus] Command failed: ${command} - ${error.message}`);
			}
			// 'ignore' falls through silently
			return undefined as R;
		}
	}

	/**
	 * Check if a command is registered
	 */
	has(command: string): boolean {
		return this.registry.has(command);
	}

	/**
	 * List all registered commands
	 */
	listCommands(): Array<{ command: string; description: string; module: string }> {
		return Array.from(this.registry.entries()).map(([command, entry]) => ({
			command,
			description: entry.description,
			module: entry.module
		}));
	}

	/**
	 * Get commands by module
	 */
	getCommandsByModule(module: string): Array<{ command: string; description: string }> {
		return Array.from(this.registry.entries())
			.filter(([_, entry]) => entry.module === module)
			.map(([command, entry]) => ({ command, description: entry.description }));
	}

	/**
	 * Get execution history
	 */
	getHistory(): typeof this.eventHistory {
		return [...this.eventHistory];
	}

	/**
	 * Clear execution history
	 */
	clearHistory(): void {
		this.eventHistory = [];
	}

	/**
	 * Unregister a command
	 */
	unregister(command: string): void {
		this.registry.delete(command);
		console.log(`[CommandBus] Unregistered: ${command}`);
	}

	/**
	 * Log command execution
	 */
	private logEvent(command: string, success: boolean): void {
		this.eventHistory.push({
			command,
			timestamp: new Date(),
			success
		});

		// Keep last 100 events
		if (this.eventHistory.length > 100) {
			this.eventHistory.shift();
		}
	}
}

/**
 * Default bus instance export
 */
export const commandBus = CommandBus.getInstance();

/**
 * Helper to register commands with type safety
 */
export function registerCommand<T = unknown, R = unknown>(
	command: string,
	handler: CommandHandler<T, R>,
	description: string
): void {
	commandBus.register(command, handler, description);
}

/**
 * Helper to execute commands with type safety
 */
export async function executeCommand<T = unknown, R = unknown>(
	command: string,
	params?: T,
	on_error?: 'ignore' | 'abort' | 'notify'
): Promise<R> {
	return commandBus.execute(command, params, on_error);
}
