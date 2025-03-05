import { DocumentationServer } from '../src/server';
import { McpServer } from '@modelcontextprotocol/server';

jest.mock('@modelcontextprotocol/server');

describe('DocumentationServer', () => {
    let server: DocumentationServer;

    beforeEach(() => {
        jest.clearAllMocks();
        server = new DocumentationServer();
    });

    afterEach(async () => {
        await server.stop();
    });

    describe('initialization', () => {
        it('should create an MCP server instance', () => {
            expect(McpServer).toHaveBeenCalledWith({
                name: 'mcp-documentation-server',
                version: '1.0.0'
            });
        });

        it('should register all required functions', () => {
            const mockAddFunction = McpServer.prototype.addFunction;
            expect(mockAddFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'search_documentation'
                })
            );
            expect(mockAddFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'analyze_code'
                })
            );
            expect(mockAddFunction).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'get_status'
                })
            );
        });
    });

    describe('search_documentation', () => {
        it('should handle valid search requests', async () => {
            const mockHandler = jest.fn();
            McpServer.prototype.addFunction.mockImplementation(({ handler }) => {
                if (handler) mockHandler.mockImplementation(handler);
            });

            const result = await mockHandler({
                query: 'test query',
                framework: 'react'
            });

            expect(result.success).toBe(true);
            expect(result.results).toBeDefined();
        });

        it('should handle rate limiting', async () => {
            const mockHandler = jest.fn();
            McpServer.prototype.addFunction.mockImplementation(({ handler }) => {
                if (handler) mockHandler.mockImplementation(handler);
            });

            // Make multiple requests
            for (let i = 0; i < 105; i++) {
                await mockHandler({ query: 'test' });
            }

            const result = await mockHandler({ query: 'test' });
            expect(result.success).toBe(false);
            expect(result.error.message).toContain('Rate limit exceeded');
        });
    });

    describe('analyze_code', () => {
        it('should handle valid analysis requests', async () => {
            const mockHandler = jest.fn();
            McpServer.prototype.addFunction.mockImplementation(({ handler }) => {
                if (handler) mockHandler.mockImplementation(handler);
            });

            const result = await mockHandler({
                code: 'function test() { }',
                language: 'javascript'
            });

            expect(result.success).toBe(true);
            expect(result.analysis).toBeDefined();
        });

        it('should validate language support', async () => {
            const mockHandler = jest.fn();
            McpServer.prototype.addFunction.mockImplementation(({ handler }) => {
                if (handler) mockHandler.mockImplementation(handler);
            });

            const result = await mockHandler({
                code: 'test',
                language: 'unsupported'
            });

            expect(result.success).toBe(false);
            expect(result.error.message).toContain('not supported');
        });
    });

    describe('system monitoring', () => {
        it('should provide system metrics', async () => {
            const mockHandler = jest.fn();
            McpServer.prototype.addFunction.mockImplementation(({ handler }) => {
                if (handler) mockHandler.mockImplementation(handler);
            });

            const result = await mockHandler({});
            expect(result.process).toBeDefined();
            expect(result.metrics).toBeDefined();
            expect(result.health).toBeDefined();
            expect(result.cache).toBeDefined();
        });

        it('should track performance metrics', async () => {
            const mockHandler = jest.fn();
            McpServer.prototype.addFunction.mockImplementation(({ handler }) => {
                if (handler) mockHandler.mockImplementation(handler);
            });

            // Make some requests
            await mockHandler({ query: 'test' });
            await mockHandler({
                code: 'function test() { }',
                language: 'javascript'
            });

            const metrics = await mockHandler({});
            expect(metrics.metrics.searches).toBe(1);
            expect(metrics.metrics.analyses).toBe(1);
        });
    });
});