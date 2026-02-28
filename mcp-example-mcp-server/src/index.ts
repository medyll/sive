#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

// Create server
const server = new McpServer({ name: "example-mcp-server", version: "1.0.0" });

// Example: tools should be registered from src/tools/*.ts
// import and register tools here when implemented

async function runStdio() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server running via stdio");
}

async function runHTTP() {
  const app = express();
  app.use(express.json());
  app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({ enableJsonResponse: true });
    res.on('close', () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });
  const port = parseInt(process.env.PORT || '3000');
  app.listen(port, () => console.error(`MCP server running on http://localhost:${port}/mcp`));
}

const transport = process.env.TRANSPORT || 'stdio';
if (transport === 'http') runHTTP().catch(err => { console.error(err); process.exit(1); });
else runStdio().catch(err => { console.error(err); process.exit(1); });
