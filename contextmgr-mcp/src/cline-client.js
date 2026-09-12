// Cline MCP Client for testing and reference
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SocketClientTransport } from './transport/socket-transport.js';
import { fileURLToPath } from 'url';

// Enable debug logging if DEBUG environment variable is set
const DEBUG = process.env.DEBUG === '1';
const DEFAULT_PORT = parseInt(process.env.MCP_PORT || '44557', 10);

// Logging utilities
const log = (msg) => console.error(`[CLIENT] ${msg}`);
const debug = (msg, ...args) => {
  if (DEBUG) {
    console.error(`[CLIENT:DEBUG] ${msg}`);
    if (args.length > 0) {
      console.error(JSON.stringify(args, null, 2));
    }
  }
};

export class ClineMcpClient {
  constructor(options = {}) {
    this.host = options.host || 'localhost';
    this.port = options.port || DEFAULT_PORT;
    this.connected = false;
    this.client = null;
    this.transport = null;
    
    log(`Client created for ${this.host}:${this.port}`);
  }
  
  async connect() {
    if (this.connected) {
      return;
    }
    
    log('Connecting to MCP server...');
    try {
      this.transport = new SocketClientTransport(this.host, this.port);
      
      // Set up transport handlers
      this.transport.on('connect', () => {
        log('Transport connected');
      });
      
      this.transport.on('disconnect', () => {
        log('Transport disconnected');
        this.connected = false;
      });
      
      this.transport.on('error', (error) => {
        log(`Transport error: ${error}`);
        debug('Error details:', error);
      });
      
      // Create client with transport
      this.client = new Client(this.transport);
      
      // Connect to server
      await this.transport.connect();
      await this.client.initialize();
      
      this.connected = true;
      log('Client initialized successfully');
    } catch (error) {
      log(`Connection failed: ${error.message}`);
      debug('Connection error details:', error);
      throw error;
    }
  }
  
  async listTools() {
    if (!this.connected) {
      await this.connect();
    }
    
    log('Requesting available tools...');
    try {
      const tools = await this.client.listTools();
      log(`Received ${tools.length} tools`);
      return tools;
    } catch (error) {
      log(`Failed to list tools: ${error.message}`);
      debug('Error details:', error);
      throw error;
    }
  }
  
  async callTool(toolName, args = {}) {
    if (!this.connected) {
      await this.connect();
    }
    
    log(`Calling tool: ${toolName}`);
    debug('Tool arguments:', args);
    
    try {
      const result = await this.client.callTool(toolName, args);
      log('Tool call succeeded');
      debug('Tool result:', result);
      return result;
    } catch (error) {
      log(`Tool call failed: ${error.message}`);
      debug('Error details:', error);
      throw error;
    }
  }
  
  async shutdown() {
    if (!this.connected || !this.client) {
      return;
    }
    
    log('Shutting down client...');
    try {
      await this.client.shutdown();
      log('Client shut down successfully');
      this.connected = false;
    } catch (error) {
      log(`Error during shutdown: ${error.message}`);
      debug('Shutdown error details:', error);
    }
  }
  
  async close() {
    if (!this.transport) {
      return;
    }
    
    try {
      await this.shutdown();
      await this.transport.close();
      log('Transport closed');
    } catch (error) {
      log(`Error closing transport: ${error.message}`);
      debug('Close error details:', error);
    }
  }
}

// Run a simple test if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  async function runTest() {
    const client = new ClineMcpClient();
    
    try {
      // Connect to server
      await client.connect();
      console.log('Connected to MCP server');
      
      // List available tools
      const tools = await client.listTools();
      console.log('Available tools:');
      tools.forEach(tool => {
        console.log(`- ${tool.name}: ${tool.description}`);
      });
      
      // Example: Call a tool if available
      if (tools.length > 0) {
        const firstTool = tools[0];
        console.log(`\nCalling tool: ${firstTool.name}...`);
        try {
          const result = await client.callTool(firstTool.name, {});
          console.log('Tool result:');
          console.log(result);
        } catch (error) {
          console.error(`Error calling tool: ${error.message}`);
        }
      }
    } catch (error) {
      console.error(`Test failed: ${error.message}`);
    } finally {
      // Clean up
      await client.close();
    }
  }
  
  runTest().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}