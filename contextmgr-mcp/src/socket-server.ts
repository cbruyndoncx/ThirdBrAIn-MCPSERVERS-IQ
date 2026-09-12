// Socket-based MCP Server for Cline VS Code Extension
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
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
import { SocketServerTransport } from './transport/socket-transport.js';
import { SocketTransportAdapter } from './transport/transport-adapter.js';

// Enable debug logging if DEBUG environment variable is set
const DEBUG = process.env.DEBUG === '1';
const DEFAULT_PORT = parseInt(process.env.MCP_PORT || '44557', 10);

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

export class SocketMcpServer {
  private server: Server;
  private config: ContextConfig;
  private stateManager!: StateManager;
  private registeredTools: Map<string, Tool> = new Map();
  private socketTransport: SocketServerTransport;
  private transportAdapter: SocketTransportAdapter;
  private port: number;

  constructor(config: ContextConfig, port: number = DEFAULT_PORT) {
    this.config = config;
    this.port = port;
    log(`Creating server instance on port ${port}`);

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

    // Create socket transport and adapter
    this.socketTransport = new SocketServerTransport(this.port);
    this.transportAdapter = new SocketTransportAdapter(this.socketTransport);

    // Set up error handling
    this.server.onerror = (error) => {
      log(`Server error: ${error}`);
      debug('Error details:', error);
    };

    this.socketTransport.on('error', (error) => {
      log(`Transport error: ${error}`);
      debug('Transport error details:', error);
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

    process.on('SIGINT', async () => {
      log('Shutting down...');
      await this.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      log('Shutting down...');
      await this.shutdown();
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
    
    // Handle initialization
    this.server.setRequestHandler(InitializeRequestSchema, async (request) => {
      log(`Handling initialize request: ${JSON.stringify(request)}`);
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
      // Debug the incoming messages using the adapter
      this.transportAdapter.onmessage = (message: JSONRPCMessage) => {
        debug('Raw message received:', JSON.stringify(message));
      };
      
      // Start listening for connections via the adapter
      await this.transportAdapter.start();
      log(`Server listening on port ${this.port}`);
      
      // Connect server to transport using the adapter
      await this.server.connect(this.transportAdapter);
      log('Server connected to socket transport');
    } catch (error) {
      log(`Failed to start server: ${error}`);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    log('Shutting down server');
    try {
      await this.server.close();
      await this.transportAdapter.stop();
      log('Server closed');
    } catch (error) {
      log(`Error during shutdown: ${error}`);
    }
  }
}

if (process.argv[1] === import.meta.url) {
  log('Starting in standalone mode');
  const server = new SocketMcpServer({
    projectRoot: process.cwd()
  });
  
  server.start().catch(error => {
    log(`Fatal error: ${error}`);
    process.exit(1);
  });
}