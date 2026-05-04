/**
 * Command Bus
 * 
 * The communication channel between skills and the application engine.
 * Allows skills to emit named commands that trigger actions in the UI or
 * business modules without skills needing to know the app's internal implementation.
 * 
 * Follows the architecture described in BMAD: 
 * bmad/references/project/5-ai-architecture-mcp-skills.md
 */

import type {
  CommandEvent,
  CommandHandler,
  CommandResult,
  ModuleHandler,
  CommandBusConfig
} from './types';

const DEFAULT_CONFIG: CommandBusConfig = {
  maxHandlerRetries: 2,
  defaultOnError: 'notify',
  logCommands: true
};

/**
 * Command Bus - Core class for command routing
 */
export class CommandBus {
  private handlers: Map<string, CommandHandler[]> = new Map();
  private moduleHandlers: Map<string, ModuleHandler> = new Map();
  private config: CommandBusConfig;

  constructor(config: Partial<CommandBusConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Emit a command to the bus
   * Routes to all registered handlers for that command
   */
  async emit(event: CommandEvent): Promise<unknown> {
    const command = event.command;
    const handlers = this.handlers.get(command);

    if (!handlers || handlers.length === 0) {
      if (this.config.logCommands) {
        console.warn(`[CommandBus] No handlers for command: ${command}`);
      }
      return undefined;
    }

    let lastResult: unknown;
    let lastError: Error | undefined;

    for (const handler of handlers) {
      try {
        const result = await this.executeHandler(handler, event);
        lastResult = result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Command handler error');

        const onError = event.on_error || this.config.defaultOnError;

        if (onError === 'abort') {
          throw lastError;
        } else if (onError === 'notify') {
          if (this.config.logCommands) {
            console.error(`[CommandBus] Command ${command} failed:`, lastError);
          }
        }
        // 'ignore' or undefined: continue to next handler
      }
    }

    if (lastError && event.on_error === 'abort') {
      throw lastError;
    }

    return lastResult;
  }

  /**
   * Execute a single handler with retry logic
   */
  private async executeHandler(
    handler: CommandHandler,
    event: CommandEvent
  ): Promise<unknown> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxHandlerRetries; attempt++) {
      try {
        return await handler(event);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Command handler error');
        
        if (attempt < this.config.maxHandlerRetries) {
          if (this.config.logCommands) {
            console.warn(
              `[CommandBus] Retry ${attempt + 1}/${this.config.maxHandlerRetries} ` +
              `for command: ${event.command}`
            );
          }
          await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
        }
      }
    }

    throw lastError;
  }

  /**
   * Subscribe to a command
   * Handler will be called every time the command is emitted
   */
  on(command: string, handler: CommandHandler): void {
    if (!this.handlers.has(command)) {
      this.handlers.set(command, []);
    }
    this.handlers.get(command)!.push(handler);

    if (this.config.logCommands) {
      console.log(`[CommandBus] Handler registered for: ${command}`);
    }
  }

  /**
   * Subscribe to a command once
   * Handler will be called once and then automatically unsubscribed
   */
  once(command: string, handler: CommandHandler): void {
    const wrapped: CommandHandler = async (event) => {
      try {
        return await handler(event);
      } finally {
        this.off(command, wrapped);
      }
    };
    this.on(command, wrapped);
  }

  /**
   * Unsubscribe from a command
   */
  off(command: string, handler: CommandHandler): void {
    const handlers = this.handlers.get(command);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index >= 0) {
        handlers.splice(index, 1);
        if (this.config.logCommands) {
          console.log(`[CommandBus] Handler unregistered from: ${command}`);
        }
      }
    }
  }

  /**
   * Register a module with multiple command handlers
   * All handlers are prefixed with the module name
   */
  registerModule(module: string, handlers: ModuleHandler): void {
    this.moduleHandlers.set(module, handlers);

    for (const [command, handler] of Object.entries(handlers)) {
      const fullCommand = `${module}.${command}`;
      this.on(fullCommand, handler);
      
      if (this.config.logCommands) {
        console.log(`[CommandBus] Module handler registered: ${fullCommand}`);
      }
    }
  }

  /**
   * Unregister a module and all its handlers
   */
  unregisterModule(module: string): void {
    const handlers = this.moduleHandlers.get(module);
    if (!handlers) return;

    for (const command of Object.keys(handlers)) {
      const fullCommand = `${module}.${command}`;
      this.off(fullCommand, handlers[command]);
    }

    this.moduleHandlers.delete(module);

    if (this.config.logCommands) {
      console.log(`[CommandBus] Module unregistered: ${module}`);
    }
  }

  /**
   * Get list of all registered commands
   */
  listCommands(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Check if a command has any handlers
   */
  hasHandler(command: string): boolean {
    return this.handlers.has(command) && this.handlers.get(command)!.length > 0;
  }

  /**
   * Get number of handlers for a command
   */
  handlerCount(command: string): number {
    return this.handlers.get(command)?.length || 0;
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.moduleHandlers.clear();

    if (this.config.logCommands) {
      console.log('[CommandBus] All handlers cleared');
    }
  }

  /**
   * Update bus configuration
   */
  updateConfig(updates: Partial<CommandBusConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): CommandBusConfig {
    return { ...this.config };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Default Command Bus instance
 * Can be imported and used throughout the application
 */
export const commandBus = new CommandBus();
