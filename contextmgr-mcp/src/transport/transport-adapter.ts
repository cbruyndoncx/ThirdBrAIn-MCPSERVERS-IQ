import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';
import { SocketServerTransport } from './socket-transport.js';

/**
 * Adapter to make SocketServerTransport compatible with the SDK's Transport interface
 */
export class SocketTransportAdapter implements Transport {
  private socketTransport: SocketServerTransport;
  
  constructor(socketTransport: SocketServerTransport) {
    this.socketTransport = socketTransport;
    
    // Forward the onmessage handler
    this.socketTransport.onmessage = (message: any) => {
      if (this.onmessage) {
        // The message types are compatible in structure even though TypeScript sees them differently
        this.onmessage(message as JSONRPCMessage);
      }
    };
  }
  
  public onmessage?: (message: JSONRPCMessage) => void;
  
  public async send(message: JSONRPCMessage): Promise<void> {
    this.socketTransport.send(message as any);
  }
  
  public async start(): Promise<void> {
    await this.socketTransport.listen();
  }
  
  public async stop(): Promise<void> {
    await this.socketTransport.close();
  }
  
  // Add the close() method required by the SDK interface
  public async close(): Promise<void> {
    await this.stop();
  }
}