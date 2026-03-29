import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { executeMCPTool, MCP_TOOLS, parseYaml } from '$lib/server/mcp/tools';

/**
 * MCP Tools API Endpoint
 * 
 * Provides HTTP access to MCP (Model Context Protocol) tools.
 * Used by the Skill Engine to execute read/write operations on project files.
 * 
 * Request format:
 * {
 *   "tool": "read_bible" | "read_timeline" | ...,
 *   "params": { "projectId": "...", "chapterId": "..." }
 * }
 * 
 * Response format:
 * {
 *   "success": true,
 *   "data": { ... tool result ... }
 * }
 */

export const POST: RequestHandler = async ({ request }) => {
	let body: { tool?: string; params?: Record<string, unknown> };
	
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { tool, params = {} } = body;

	if (!tool) {
		return json({ error: 'Missing "tool" parameter' }, { status: 400 });
	}

	// Check if tool exists in registry
	if (!(tool in MCP_TOOLS)) {
		return json({ 
			error: `Unknown tool: ${tool}`,
			availableTools: Object.keys(MCP_TOOLS)
		}, { status: 404 });
	}

	try {
		// Execute the tool with provided params
		// @ts-expect-error - Dynamic tool execution
		const result = executeMCPTool(tool as keyof typeof MCP_TOOLS, ...Object.values(params));
		
		// Parse YAML results if applicable
		const parsedResult = typeof result === 'string' && 
			(tool.includes('read_') || tool === 'parse_yaml') 
			? parseYaml(result)
			: result;

		return json({
			success: true,
			tool,
			data: parsedResult
		});
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		console.error(`[MCP Tool ${tool}] Error:`, errorMessage);
		
		return json({
			success: false,
			error: errorMessage,
			tool
		}, { status: 500 });
	}
};

/**
 * GET endpoint - lists available MCP tools
 */
export const GET: RequestHandler = async () => {
	return json({
		tools: Object.keys(MCP_TOOLS),
		description: 'MCP (Model Context Protocol) Tools for AI access to project data',
		endpoint: '/api/mcp/tools',
		method: 'POST',
		example: {
			tool: 'read_bible',
			params: { projectId: 'my-novel' }
		}
	});
};
