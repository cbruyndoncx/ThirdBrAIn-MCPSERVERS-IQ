import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  InitializeRequestSchema,
  ListToolsRequestSchema,
  McpError,
  JSONRPCMessage,
} from '@modelcontextprotocol/sdk/types.js';
import { mkdir } from 'fs/promises';
import path from 'path';
import os from 'os';
import { ContextConfig, Result, Tool } from './types.js';
import { StateManager } from './state/manager.js';
import {
  CreateProjectTool,
  GetProjectTool,
  CreateProjectCheckpointTool,
  RestoreProjectCheckpointTool
} from './tools/project.js';
import {
  CreateWorkPackageTool,
  GetWorkPackageTool,
  UpdateWorkPackageProgressTool,
  UpdateWorkPackageStatusTool
} from './tools/workpackage.js';
import {
  CreateTaskTool,
  UpdateTaskStatusTool,
  RecordFileChangeTool,
  CreateTaskCheckpointTool,
  RestoreTaskCheckpointTool
} from './tools/task.js';
import {
  StartQAReviewTool,
  CompleteQAReviewTool,
  RequestFixesTool,
  AcceptWorkPackageTool
} from './tools/qa.js';

// Import socket transport and adapter for optional socket mode
import { SocketServerTransport } from './transport/socket-transport.js';
import { SocketTransportAdapter } from './transport/transport-adapter.js';

// Initial synchronous debug output
process.stderr.write('=== MCP Server Starting ===\n');
process.stderr.write(`Environment: DEBUG=${process.env.DEBUG}\n`);
process.stderr.write(`Working Directory: ${process.cwd()}\n`);
process.stderr.write(`Module URL: ${import.meta.url}\n`);
process.stderr.write(`Entry Point: ${process.argv[1]}\n`);

// Check stdin mode
process.stderr.write('Stdin Status:\n');
process.stderr.write(`  isTTY: ${process.stdin.isTTY}\n`);
process.stderr.write(`  readable: ${process.stdin.readable}\n`);
process.stderr.write(`  isPaused: ${process.stdin.isPaused()}\n`);

// Parse command line args for options
const useSocket = process.argv.includes('--socket');
const port = (() => {
  const portIndex = process.argv.indexOf('--port');
  if (portIndex !== -1 && process.argv.length > portIndex + 1) {
    return parseInt(process.argv[portIndex + 1], 10);
  }
  return parseInt(process.env.MCP_PORT || '44557', 10);
})();

if (useSocket) {
  process.stderr.write(`Socket mode enabled on port ${port}\n`);
} else {
  process.stderr.write('Stdio mode enabled\n');
  
  // Enhanced stdin data logging for stdio mode
  process.stdin.on('data', (data) => {
    process.stderr.write('=== Received stdin data ===\n');
    process.stderr.write('As string: ' + data.toString() + '\n');
    process.stderr.write('As buffer: ' + data.toString('hex') + '\n');
    process.stderr.write('Length: ' + data.length + '\n');
    process.stderr.write('========================\n');
  });
}

const DEBUG = process.env.DEBUG === '1';

// Always log important messages, debug for details
const log = (msg: string) => process.stderr.write(`[MCP] ${msg}\n`);
const debug = (msg: string, ...args: any[]) => {
  if (DEBUG) {
    process.stderr.write(`[DEBUG] ${msg}\n`);
    if (args.length > 0) {
      process.stderr.write(JSON.stringify(args, null, 2) + '\n');
    }
  }
};

// Log uncaught errors
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`);
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log(`Unhandled Rejection: ${reason}`);
  console.error(reason);
  process.exit(1);
});

export class ContextmgrServer {
  private server: Server;
  private config: ContextConfig;
  private stateManager!: StateManager;
  private registeredTools: Map<string, Tool> = new Map();
  private useSocketMode: boolean;
  private port: number;
  private socketTransport?: SocketServerTransport;
  private transportAdapter?: SocketTransportAdapter;

  constructor(config: ContextConfig, useSocketMode: boolean = false, port: number = 44557) {
    this.config = config;
    this.useSocketMode = useSocketMode;
    this.port = port;
    
    log(`Creating server instance (mode: ${useSocketMode ? 'socket' : 'stdio'})`);

    log('Setting up server capabilities');
    this.server = new Server(
      {
        name: 'contextmgr-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {}  // Will be populated during initialization
        },
      }
    );

    this.server.onerror = (error) => {
      log(`Error: ${error}`);
      debug('Error details:', error);
    };
    
    // Socket mode setup if enabled
    if (this.useSocketMode) {
      log(`Setting up socket transport on port ${this.port}`);
      this.socketTransport = new SocketServerTransport(this.port);
      this.transportAdapter = new SocketTransportAdapter(this.socketTransport);
      
      this.socketTransport.on('error', (error) => {
        log(`Transport error: ${error}`);
      });
      
      this.socketTransport.on('connect', () => {
        log('Client connected');
      });
      
      this.socketTransport.on('disconnect', () => {
        log('Client disconnected');
      });
      
      this.socketTransport.on('ready', (port) => {
        log(`Socket transport listening on port ${port}`);
      });
    } else {
      // Debug pipe status for stdio mode
      process.stdout.on('error', (error) => {
        log(`Stdout error: ${error}`);
        debug('Stdout error details:', error);
      });

      process.stdout.on('close', () => {
        log('Stdout closed');
      });

      process.stdin.on('close', () => {
        log('Stdin closed');
      });
    }

    process.on('SIGINT', async () => {
      log('Shutting down...');
      await this.server.close();
      if (this.socketTransport) {
        await this.socketTransport.close();
      }
      process.exit(0);
    });

    log('Server instance created');
  }

  private async ensureContextDir(): Promise<string> {
    const contextDir = path.join(
      this.config.projectRoot,
      this.config.contextDir || 'contextmgr'
    );
    log(`Ensuring context directory: ${contextDir}`);
    await mkdir(contextDir, { recursive: true });
    
    await Promise.all([
      mkdir(path.join(contextDir, 'checkpoints'), { recursive: true }),
      mkdir(path.join(contextDir, 'temp'), { recursive: true })
    ]);

    return contextDir;
  }

  private async registerTools(): Promise<void> {
    log('Registering tools with state manager');
    
    const toolClasses = [
      CreateProjectTool,
      GetProjectTool,
      CreateProjectCheckpointTool,
      RestoreProjectCheckpointTool,
      CreateWorkPackageTool,
      GetWorkPackageTool,
      UpdateWorkPackageProgressTool,
      UpdateWorkPackageStatusTool,
      CreateTaskTool,
      UpdateTaskStatusTool,
      RecordFileChangeTool,
      CreateTaskCheckpointTool,
      RestoreTaskCheckpointTool,
      StartQAReviewTool,
      CompleteQAReviewTool,
      RequestFixesTool,
      AcceptWorkPackageTool
    ];

    log('Initializing tools');
    debug('Tool classes:', toolClasses.map(tc => tc.name));

    for (const ToolClass of toolClasses) {
      const tool = new ToolClass(this.stateManager);
      this.registerTool(tool);
      debug('Registered tool:', tool.name);
    }

    log(`Registered ${this.registeredTools.size} tools`);
  }

  private registerTool(tool: Tool): void {
    debug('Registering tool:', tool.name);
    this.registeredTools.set(tool.name, tool);
  }

  private setupRequestHandlers(): void {
    log('Setting up request handlers');
    
    // Handle initialization - ensure we respond quickly to avoid timeouts
    this.server.setRequestHandler(InitializeRequestSchema, async (request) => {
      log(`Handling initialize request: ${JSON.stringify(request)}`);
      
      // Create response with current tools (may be empty initially)
      const response = {
        version: '1.0.0',
        capabilities: {
          tools: Object.fromEntries(
            Array.from(this.registeredTools.entries()).map(([name, tool]) => [
              name,
              {
                description: tool.description,
                inputSchema: tool.inputSchema
              }
            ])
          )
        }
      };
      
      log(`Sending initialize response: ${JSON.stringify(response)}`);

      // For Cline compatibility - initialize tools in background after sending response
      if (request.params?.clientInfo?.name === 'Cline') {
        log('Cline client detected, scheduling background initialization');
        
        // Return response immediately to prevent timeout
        setImmediate(async () => {
          try {
            log('Starting background initialization');
            await this.ensureContextDir();
            await this.stateManager.initialize();
            await this.registerTools();
            log('Background initialization complete');
          } catch (error) {
            log(`Background initialization error: ${error}`);
          }
        });
      }
      
      return response;
    });

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      log('Handling list_tools request');
      const tools = Array.from(this.registeredTools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }));
      
      log(`Returning ${tools.length} tools`);
      debug('Tools response:', tools);
      return { tools };
    });

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        log(`Executing tool: ${request.params.name}`);
        try {
          const tool = this.registeredTools.get(request.params.name);
          if (!tool) {
            log(`Tool not found: ${request.params.name}`);
            throw new McpError(
              ErrorCode.InvalidParams, 
              `Tool ${request.params.name} not found`
            );
          }

          const result = await tool.handler(request.params.arguments);

          if (!result.success) {
            log(`Tool execution failed: ${result.error}`);
            throw new McpError(ErrorCode.InternalError, result.error || 'Unknown error');
          }

          log('Tool execution succeeded');
          debug('Tool result:', result.data);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result.data, null, 2)
            }]
          };
        } catch (error) {
          log(`Tool execution error: ${error}`);
          if (error instanceof McpError) {
            throw error;
          }
          throw new McpError(
            ErrorCode.InternalError,
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }
    );

    log('Request handlers configured');
  }

  public async initialize(): Promise<void> {
    log('Initializing server');
    const contextDir = await this.ensureContextDir();
    log('Context directory ready');
    
    this.stateManager = new StateManager(contextDir);
    await this.stateManager.initialize();
    log('State manager initialized');
    
    await this.registerTools();
    this.setupRequestHandlers();

    log('Server initialization complete');
  }

  public async start(): Promise<void> {
    log('Starting server');
    await this.initialize();
    
    try {
      if (this.useSocketMode && this.transportAdapter) {
        // Socket mode
        log('Using socket transport');
        
        // Debug the incoming messages
        this.transportAdapter.onmessage = (message: JSONRPCMessage) => {
          debug('Raw message received:', JSON.stringify(message));
        };
        
        // Start listening for connections
        await this.transportAdapter.start();
        log(`Server listening on port ${this.port}`);
        
        // Connect server to transport
        await this.server.connect(this.transportAdapter);
        log('Server connected to socket transport');
      } else {
        // Stdio mode
        log('Using stdio transport');
        const transport = new StdioServerTransport();
        
        // Debug the incoming messages
        transport.onmessage = (message: JSONRPCMessage) => {
          debug('Raw message received:', JSON.stringify(message));
        };
        
        await this.server.connect(transport);
        log('Server running on stdio');
      }
    } catch (error) {
      log(`Failed to start server: ${error}`);
      process.exit(1);
    }
  }
}

if (process.argv[1] === import.meta.url) {
  log('Starting in standalone mode');
  const server = new ContextmgrServer({
    projectRoot: process.cwd()
  }, useSocket, port);
  
  server.start().catch(error => {
    log(`Fatal error: ${error}`);
    process.exit(1);
  });
}
