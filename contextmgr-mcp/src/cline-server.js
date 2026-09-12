#!/usr/bin/env node
// Cline VS Code Extension MCP Server Launcher
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { SocketMcpServer } from './socket-server.js';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
let port = parseInt(process.env.MCP_PORT || '44557', 10);
let projectRoot = process.cwd();

// Process arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && i + 1 < args.length) {
    const portArg = parseInt(args[i + 1], 10);
    if (!isNaN(portArg)) {
      port = portArg;
      i++; // Skip the next arg since we already processed it
    }
  } else if (args[i] === '--project' && i + 1 < args.length) {
    projectRoot = args[i + 1];
    i++; // Skip the next arg
  } else if (args[i] === '--debug') {
    process.env.DEBUG = '1';
  }
}

// Log startup info
console.error(`Starting Cline MCP Server...`);
console.error(`Project root: ${projectRoot}`);
console.error(`Port: ${port}`);
console.error(`Debug mode: ${process.env.DEBUG === '1' ? 'enabled' : 'disabled'}`);

// Start the server
const server = new SocketMcpServer({
  projectRoot,
  contextDir: 'contextmgr'
}, port);

server.start().catch(error => {
  console.error(`Fatal error: ${error}`);
  process.exit(1);
});

// Handle termination signals
process.on('SIGINT', async () => {
  console.error('Received SIGINT, shutting down...');
  await server.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Received SIGTERM, shutting down...');
  await server.shutdown();
  process.exit(0);
});