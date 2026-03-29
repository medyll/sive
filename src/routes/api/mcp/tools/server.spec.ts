import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST, GET } from './+server';

// Mock MCP tools
vi.mock('$lib/server/mcp/tools', () => ({
	executeMCPTool: vi.fn((tool, ...args) => {
		if (tool === 'read_bible') return 'characters:\n  - name: John';
		if (tool === 'read_timeline') return 'events:\n  - date: 2024-01-01';
		if (tool === 'parse_yaml') return { parsed: true };
		throw new Error(`Unknown tool: ${tool}`);
	}),
	MCP_TOOLS: {
		read_bible: vi.fn(),
		read_timeline: vi.fn(),
		read_structure: vi.fn(),
		parse_yaml: vi.fn()
	}
}));

describe('MCP Tools API', () => {
	describe('POST /api/mcp/tools', () => {
		it('returns 400 when tool parameter is missing', async () => {
			const request = new Request('http://test.com/api/mcp/tools', {
				method: 'POST',
				body: JSON.stringify({ params: {} })
			});

			const response = await POST({ request } as never);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Missing "tool" parameter');
		});

		it('returns 404 for unknown tool', async () => {
			const request = new Request('http://test.com/api/mcp/tools', {
				method: 'POST',
				body: JSON.stringify({ tool: 'unknown_tool', params: {} })
			});

			const response = await POST({ request } as never);
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.error).toContain('Unknown tool');
			expect(data.availableTools).toBeDefined();
		});

		it('executes tool and returns parsed result', async () => {
			const request = new Request('http://test.com/api/mcp/tools', {
				method: 'POST',
				body: JSON.stringify({ 
					tool: 'read_bible', 
					params: { projectId: 'test-project' } 
				})
			});

			const response = await POST({ request } as never);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.tool).toBe('read_bible');
			expect(data.data).toBeDefined();
		});

		it('handles tool execution errors', async () => {
			const request = new Request('http://test.com/api/mcp/tools', {
				method: 'POST',
				body: JSON.stringify({ 
					tool: 'read_bible', 
					params: { projectId: 'nonexistent' } 
				})
			});

			// Simulate error by mocking executeMCPTool to throw
			const { executeMCPTool } = await import('$lib/server/mcp/tools');
			vi.mocked(executeMCPTool).mockImplementationOnce(() => {
				throw new Error('File not found');
			});

			const response = await POST({ request } as never);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.success).toBe(false);
			expect(data.error).toBe('File not found');
		});

		it('handles invalid JSON body', async () => {
			const request = new Request('http://test.com/api/mcp/tools', {
				method: 'POST',
				body: 'invalid json'
			});

			const response = await POST({ request } as never);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Invalid JSON body');
		});
	});

	describe('GET /api/mcp/tools', () => {
		it('returns list of available tools', async () => {
			const request = new Request('http://test.com/api/mcp/tools');

			const response = await GET({ request } as never);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.tools).toBeInstanceOf(Array);
			expect(data.description).toBeDefined();
			expect(data.endpoint).toBe('/api/mcp/tools');
			expect(data.method).toBe('POST');
			expect(data.example).toBeDefined();
		});
	});
});
