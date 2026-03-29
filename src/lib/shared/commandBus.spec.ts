import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommandBus, commandBus, registerCommand, executeCommand } from './commandBus';

// Reset singleton for each test
vi.mock('./commandBus', async () => {
	const actual = await vi.importActual('./commandBus');
	return {
		...(actual as object),
		instance: null
	};
});

describe('CommandBus', () => {
	let bus: CommandBus;

	beforeEach(() => {
		// Get fresh instance for each test
		bus = CommandBus.getInstance();
		// Clear registry
		bus['registry'].clear();
		bus.clearHistory();
	});

	describe('singleton', () => {
		it('returns same instance on multiple calls', () => {
			const instance1 = CommandBus.getInstance();
			const instance2 = CommandBus.getInstance();
			expect(instance1).toBe(instance2);
		});
	});

	describe('register', () => {
		it('registers a command handler', () => {
			const handler = vi.fn();
			bus.register('test.command', handler, 'Test command');
			
			expect(bus.has('test.command')).toBe(true);
		});

		it('warns when overriding existing command', () => {
			const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const handler1 = vi.fn();
			const handler2 = vi.fn();
			
			bus.register('test.command', handler1, 'First');
			bus.register('test.command', handler2, 'Second');
			
			expect(consoleWarn).toHaveBeenCalledWith(
				expect.stringContaining('Overriding existing command')
			);
			
			consoleWarn.mockRestore();
		});
	});

	describe('execute', () => {
		it('executes a registered command', async () => {
			const handler = vi.fn().mockReturnValue('result');
			bus.register('test.command', handler, 'Test');
			
			const result = await bus.execute('test.command', { foo: 'bar' });
			
			expect(handler).toHaveBeenCalledWith({ foo: 'bar' });
			expect(result).toBe('result');
		});

		it('handles async handlers', async () => {
			const handler = vi.fn().mockResolvedValue('async result');
			bus.register('async.command', handler, 'Async test');
			
			const result = await bus.execute('async.command');
			
			expect(result).toBe('async result');
		});

		it('returns undefined for unknown command with ignore error mode', async () => {
			const result = await bus.execute('unknown.command', {}, 'ignore');
			expect(result).toBeUndefined();
		});

		it('logs error for unknown command with notify mode', async () => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
			
			await bus.execute('unknown.command', {}, 'notify');
			
			expect(consoleError).toHaveBeenCalledWith(
				expect.stringContaining('Unknown command')
			);
			
			consoleError.mockRestore();
		});

		it('throws error for unknown command with abort mode', async () => {
			await expect(
				bus.execute('unknown.command', {}, 'abort')
			).rejects.toThrow('Unknown command');
		});

		it('handles handler errors based on error mode', async () => {
			const handler = vi.fn().mockRejectedValue(new Error('Handler failed'));
			bus.register('failing.command', handler, 'Failing test');

			// ignore mode
			const result = await bus.execute('failing.command', {}, 'ignore');
			expect(result).toBeUndefined();

			// abort mode
			await expect(
				bus.execute('failing.command', {}, 'abort')
			).rejects.toThrow('Handler failed');
		});
	});

	describe('listCommands', () => {
		it('returns all registered commands', () => {
			bus.register('module.action1', vi.fn(), 'Action 1');
			bus.register('module.action2', vi.fn(), 'Action 2');
			
			const commands = bus.listCommands();
			
			expect(commands).toHaveLength(2);
			expect(commands.map(c => c.command)).toEqual(
				expect.arrayContaining(['module.action1', 'module.action2'])
			);
		});
	});

	describe('getCommandsByModule', () => {
		it('returns commands filtered by module', () => {
			bus.register('ui.open', vi.fn(), 'Open');
			bus.register('ui.close', vi.fn(), 'Close');
			bus.register('editor.edit', vi.fn(), 'Edit');
			
			const uiCommands = bus.getCommandsByModule('ui');
			
			expect(uiCommands).toHaveLength(2);
			expect(uiCommands.map(c => c.command)).toEqual(
				expect.arrayContaining(['ui.open', 'ui.close'])
			);
		});
	});

	describe('history', () => {
		it('logs successful command execution', async () => {
			bus.register('test.cmd', vi.fn(), 'Test');
			await bus.execute('test.cmd');
			
			const history = bus.getHistory();
			
			expect(history).toHaveLength(1);
			expect(history[0].command).toBe('test.cmd');
			expect(history[0].success).toBe(true);
			expect(history[0].timestamp).toBeInstanceOf(Date);
		});

		it('logs failed command execution', async () => {
			bus.register('failing.cmd', vi.fn().mockRejectedValue(new Error('Fail')), 'Fail');
			await bus.execute('failing.cmd', {}, 'ignore');
			
			const history = bus.getHistory();
			
			expect(history).toHaveLength(1);
			expect(history[0].success).toBe(false);
		});

		it('keeps only last 100 events', async () => {
			bus.register('test.cmd', vi.fn(), 'Test');
			
			// Execute 101 times
			for (let i = 0; i < 101; i++) {
				await bus.execute('test.cmd');
			}
			
			const history = bus.getHistory();
			expect(history).toHaveLength(100);
		});

		it('clears history', async () => {
			bus.register('test.cmd', vi.fn(), 'Test');
			await bus.execute('test.cmd');
			
			bus.clearHistory();
			
			expect(bus.getHistory()).toHaveLength(0);
		});
	});

	describe('unregister', () => {
		it('removes a command from registry', () => {
			bus.register('test.cmd', vi.fn(), 'Test');
			expect(bus.has('test.cmd')).toBe(true);
			
			bus.unregister('test.cmd');
			
			expect(bus.has('test.cmd')).toBe(false);
		});
	});

	describe('helper functions', () => {
		it('registerCommand registers via singleton', () => {
			registerCommand('helper.cmd', vi.fn(), 'Helper');
			expect(bus.has('helper.cmd')).toBe(true);
		});

		it('executeCommand executes via singleton', async () => {
			const handler = vi.fn().mockReturnValue('helper result');
			registerCommand('helper.cmd', handler, 'Helper');
			
			const result = await executeCommand('helper.cmd');
			
			expect(result).toBe('helper result');
		});
	});
});
