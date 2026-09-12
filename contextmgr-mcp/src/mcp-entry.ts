#!/usr/bin/env node
// MCP Server Entry Point for Cline VS Code Extension
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  JSONRPCMessage, 
  InitializeRequestSchema, 
  ListToolsRequestSchema, 
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { mkdir } from 'fs/promises';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { z } from 'zod';

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup debug logging
process.stderr.write('=== MCP Server Starting ===\n');
process.stderr.write(`Environment: DEBUG=${process.env.DEBUG}\n`);
process.stderr.write(`Working Directory: ${process.cwd()}\n`);
process.stderr.write(`Script Directory: ${__dirname}\n`);
process.stderr.write(`Module URL: ${import.meta.url}\n`);
process.stderr.write(`Entry Point: ${process.argv[1]}\n`);

// Log stdin status
process.stderr.write('Stdin Status:\n');
process.stderr.write(`  isTTY: ${process.stdin.isTTY}\n`);
process.stderr.write(`  readable: ${process.stdin.readable}\n`);
process.stderr.write(`  isPaused: ${process.stdin.isPaused()}\n`);

// Enhanced message logging
process.stdin.on('data', (data) => {
  process.stderr.write('=== Received stdin data ===\n');
  process.stderr.write('As string: ' + data.toString());
  process.stderr.write('Length: ' + data.length + '\n');
  process.stderr.write('========================\n');
});

// Server info
const serverInfo = {
  name: 'contextmgr-mcp',
  version: '1.0.0'
};

// Define schemas for resource requests
const ResourcesListRequestSchema = {
  method: z.literal('resources/list'),
  params: z.object({}).optional()
};

const ResourcesTemplatesListRequestSchema = {
  method: z.literal('resources/templates/list'),
  params: z.object({}).optional()
};

// Determine project root (use parent of script directory or current working directory)
const projectRoot = (() => {
  // Try to identify project root - typically, script is in dist/ which is one level below project root
  const scriptParentDir = path.resolve(__dirname, '..');
  
  // Check if we're in the right structure by looking for package.json
  try {
    const packageJsonPath = path.join(scriptParentDir, 'package.json');
    // Just checking if we can access it
    require('fs').accessSync(packageJsonPath);
    process.stderr.write(`Using detected project root: ${scriptParentDir}\n`);
    return scriptParentDir;
  } catch (e) {
    // Fallback to current working directory
    process.stderr.write(`Falling back to current working directory: ${process.cwd()}\n`);
    return process.cwd();
  }
})();

// Create and start the server immediately
async function startServer() {
  try {
    process.stderr.write('Creating MCP server for Cline...\n');
    
    // Create server with minimal capabilities first
    const server = new Server(
      serverInfo,
      { capabilities: { tools: {} } }
    );
    
    // Log errors
    server.onerror = (error) => {
      process.stderr.write(`Server error: ${error}\n`);
    };
    
    // Create transport
    const transport = new StdioServerTransport();
    transport.onmessage = (message: JSONRPCMessage) => {
      process.stderr.write(`Received message: ${JSON.stringify(message)}\n`);
    };
    
    // Handle initialize request with immediate response
    server.setRequestHandler(InitializeRequestSchema, async (request) => {
      process.stderr.write(`Handling initialize request from ${request.params?.clientInfo?.name || 'unknown client'}\n`);
      
      // Return response with required fields to avoid validation errors
      const response = {
        serverInfo: serverInfo,
        protocolVersion: request.params?.protocolVersion || '2024-11-05',
        capabilities: {
          tools: {}
        }
      };
      
      process.stderr.write(`Sending immediate initialize response: ${JSON.stringify(response)}\n`);
      
      // Initialize tools and state in the background
      setImmediate(async () => {
        process.stderr.write('Starting background initialization...\n');
        try {
          // Create context directory relative to project root
          const contextDir = path.join(projectRoot, 'contextmgr');
          process.stderr.write(`Creating context directory: ${contextDir}\n`);
          
          await mkdir(contextDir, { recursive: true });
          await mkdir(path.join(contextDir, 'checkpoints'), { recursive: true });
          await mkdir(path.join(contextDir, 'temp'), { recursive: true });
          
          process.stderr.write('Created context directories\n');
          
          // In a real implementation, we would initialize state and register tools here
          // For now, we'll just log that initialization is complete
          process.stderr.write('Background initialization complete\n');
        } catch (error) {
          process.stderr.write(`Background initialization error: ${error}\n`);
          if (error instanceof Error) {
            process.stderr.write(`Error stack: ${error.stack}\n`);
          }
        }
      });
      
      return response;
    });
    
    // Handle list_tools request
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      process.stderr.write('Handling list_tools request\n');
      
      // Return empty tools list for now
      return { tools: [] };
    });
    
    // Handle unsupported resource requests to avoid errors
    server.setRequestHandler(ResourcesListRequestSchema, async () => {
      process.stderr.write('Handling resources/list request\n');
      return { resources: [] };
    });
    
    server.setRequestHandler(ResourcesTemplatesListRequestSchema, async () => {
      process.stderr.write('Handling resources/templates/list request\n');
      return { templates: [] };
    });
    
    // Handle call_tool request
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      process.stderr.write(`Tool execution request for: ${request.params.name}\n`);
      
      // Return a placeholder response
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ message: 'Tool execution not yet implemented' })
        }]
      };
    });
    
    // Connect to transport
    await server.connect(transport);
    process.stderr.write('Server connected and ready\n');
    
  } catch (error) {
    process.stderr.write(`Failed to start server: ${error}\n`);
    if (error instanceof Error) {
      process.stderr.write(`Error stack: ${error.stack}\n`);
    }
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  process.stderr.write(`Uncaught exception: ${error}\n`);
  if (error instanceof Error) {
    process.stderr.write(`Error stack: ${error.stack}\n`);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  process.stderr.write(`Unhandled rejection: ${reason}\n`);
  if (reason instanceof Error) {
    process.stderr.write(`Error stack: ${reason.stack}\n`);
  }
});

// Start server
startServer().catch(error => {
  process.stderr.write(`Fatal error: ${error}\n`);
  if (error instanceof Error) {
    process.stderr.write(`Error stack: ${error.stack}\n`);
  }
  process.exit(1);
});
