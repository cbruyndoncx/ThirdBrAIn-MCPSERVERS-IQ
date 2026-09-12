# Cline VS Code Extension MCP Server Integration

This document describes how to integrate the Model Context Protocol (MCP) server with the Cline VS Code Extension.

## Overview

The MCP server provides context management capabilities for AI-assisted development workflows. It offers tools for:

- Project management
- Work package management
- Task management
- Checkpoint and restore functionality
- QA review workflows
- File change tracking

The Cline VS Code Extension can connect to this server to maintain development context across sessions.

## Architecture

The integration uses a socket-based transport for reliable bidirectional communication:

1. The VS Code Extension spawns the MCP server as a child process
2. The server listens on a TCP socket (default port 44557)
3. The extension connects to this socket as a client
4. JSON-RPC 2.0 messages are exchanged using Content-Length headers for framing

## Server Implementation

The MCP server has been implemented with two options:

1. **Stdio-based transport** (original implementation in `index.ts`/`mcp-entry.ts`)
2. **Socket-based transport** (new implementation in `socket-server.ts`/`cline-server.js`)

Based on testing results, the socket-based transport is more reliable for bidirectional communication with VS Code extensions, so it's the recommended approach.

## Starting the Server

The VS Code extension can start the server using:

```javascript
import { spawn } from 'child_process';
import path from 'path';

// Function to start the MCP server
function startMcpServer(options = {}) {
  const serverPath = path.resolve(__dirname, '../node_modules/.bin/cline-mcp-server');
  const args = [];
  
  // Add port if specified, otherwise uses default (44557)
  if (options.port) {
    args.push('--port', options.port.toString());
  }
  
  // Add project root path
  if (options.projectRoot) {
    args.push('--project', options.projectRoot);
  }
  
  // Enable debug mode if needed
  if (options.debug) {
    args.push('--debug');
  }
  
  // Spawn server process
  const serverProcess = spawn(serverPath, args, {
    stdio: ['ignore', 'pipe', 'pipe'] // Redirect stdout and stderr
  });
  
  // Log server output for debugging
  serverProcess.stderr.on('data', (data) => {
    console.log(`[MCP Server] ${data}`);
  });
  
  serverProcess.on('error', (error) => {
    console.error('Failed to start MCP server:', error);
  });
  
  return serverProcess;
}
```

## Connecting to the Server

The VS Code extension can connect to the server using the provided client:

```javascript
import { ClineMcpClient } from 'contextmgr-mcp/dist/cline-client.js';

async function connectToMcpServer(options = {}) {
  const client = new ClineMcpClient({
    host: options.host || 'localhost',
    port: options.port || 44557
  });
  
  await client.connect();
  return client;
}
```

## Available Tools

Once connected, the extension can list available tools:

```javascript
const tools = await client.listTools();
console.log('Available tools:', tools);
```

And call specific tools:

```javascript
// Example: Create a project
const result = await client.callTool('create_project', {
  name: 'My Project',
  description: 'A sample project'
});
```

## Integration Points

The Cline VS Code Extension should integrate with the MCP server at these points:

1. **Extension Activation**: Start the MCP server
2. **Extension Deactivation**: Shutdown the server gracefully
3. **Project Open**: Initialize project context
4. **Status Bar**: Show current project/workpackage/task status
5. **Command Palette**: Expose MCP tools as commands
6. **File Operations**: Track file changes through `RecordFileChangeTool`
7. **Session End**: Create checkpoints before ending sessions
8. **Session Start**: Restore context when restarting sessions

## Error Handling

The server and client have comprehensive error handling. The extension should:

1. Monitor server process for crashes and restart if needed
2. Handle connection errors gracefully with appropriate user feedback
3. Log detailed diagnostics when debug mode is enabled

## Development Workflow

The MCP server enhances the development workflow by:

1. Providing structured project management
2. Tracking changes and progress
3. Maintaining context across sessions
4. Supporting QA review processes
5. Allowing checkpoint/restore operations

## Performance Considerations

For optimal performance in the VS Code extension:

1. Start the server during extension activation to avoid startup delays
2. Consider lazy initialization of tools
3. Cache frequently used tool results
4. Use connection pooling for multiple extension features

## Troubleshooting

Common issues and solutions:

1. **Connection Refused**: Ensure server is running and port is correct
2. **Tool Not Found**: Check tool registration and server initialization
3. **Message Parsing Errors**: Check for protocol compliance
4. **Performance Issues**: Enable debug mode to identify bottlenecks

## Example: Full Integration

Here's a complete example of integrating the MCP server with a VS Code extension:

```javascript
import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { ClineMcpClient } from 'contextmgr-mcp/dist/cline-client.js';

export function activate(context: vscode.ExtensionContext) {
  // Start the server
  const serverProcess = startMcpServer({
    projectRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
    debug: true
  });
  
  // Create client
  const client = new ClineMcpClient();
  
  // Track whether client is connected
  let connected = false;
  
  // Connect to server
  client.connect()
    .then(async () => {
      connected = true;
      
      // Register commands that use the client
      context.subscriptions.push(
        vscode.commands.registerCommand('cline.createProject', async () => {
          const name = await vscode.window.showInputBox({ 
            prompt: 'Enter project name' 
          });
          
          if (name) {
            const result = await client.callTool('create_project', { name });
            vscode.window.showInformationMessage(`Project created: ${name}`);
          }
        })
      );
      
      // More command registrations...
    })
    .catch(error => {
      vscode.window.showErrorMessage(`Failed to connect to MCP server: ${error.message}`);
    });
  
  // Clean up on deactivation
  context.subscriptions.push({
    dispose: async () => {
      if (connected) {
        await client.close();
      }
      
      // Kill server process
      serverProcess.kill();
    }
  });
}

function startMcpServer(options = {}) {
  // Implementation as shown earlier
}
```

## Conclusion

By using the socket-based MCP server implementation, the Cline VS Code Extension can reliably maintain development context, provide structured workflow guidance, and enhance the AI-assisted development experience.