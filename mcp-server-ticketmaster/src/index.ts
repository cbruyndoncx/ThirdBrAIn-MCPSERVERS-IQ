#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { TicketmasterClient } from './TicketmasterClient.js';
import { SearchType } from './types.js';
import { formatResults } from './formatters.js';

const API_KEY = process.env.TICKETMASTER_API_KEY;
if (!API_KEY) {
    throw new Error('TICKETMASTER_API_KEY environment variable is required');
}

const client = new TicketmasterClient(API_KEY);

class TicketmasterServer {
    private server: Server;
    private client: TicketmasterClient;

    constructor() {
        this.client = client;
        this.server = new Server(
            {
                name: 'ticketmaster',
                version: '0.2.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();
        
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'search_ticketmaster',
                    description: 'Search for events, venues, or attractions on Ticketmaster',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                enum: ['event', 'venue', 'attraction'],
                                description: 'Type of search to perform'
                            },
                            keyword: {
                                type: 'string',
                                description: 'Search keyword or term'
                            },
                            startDate: {
                                type: 'string',
                                description: 'Start date in YYYY-MM-DD format'
                            },
                            endDate: {
                                type: 'string',
                                description: 'End date in YYYY-MM-DD format'
                            },
                            city: {
                                type: 'string',
                                description: 'City name'
                            },
                            stateCode: {
                                type: 'string',
                                description: 'State code (e.g., NY, CA)'
                            },
                            countryCode: {
                                type: 'string',
                                description: 'Country code (e.g., US, CA)'
                            },
                            venueId: {
                                type: 'string',
                                description: 'Specific venue ID to search'
                            },
                            attractionId: {
                                type: 'string',
                                description: 'Specific attraction ID to search'
                            },
                            classificationName: {
                                type: 'string',
                                description: 'Event classification/category (e.g., "Sports", "Music")'
                            },
                            format: {
                                type: 'string',
                                enum: ['json', 'text'],
                                description: 'Output format (defaults to json)',
                                default: 'json'
                            }
                        },
                        required: ['type'],
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (request.params.name !== 'search_ticketmaster') {
                throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Unknown tool: ${request.params.name}`
                );
            }

            const {
                type,
                format = 'json',
                keyword,
                startDate,
                endDate,
                ...otherParams
            } = request.params.arguments as {
                type: SearchType;
                format?: 'json' | 'text';
                keyword?: string;
                startDate?: string;
                endDate?: string;
                city?: string;
                stateCode?: string;
                countryCode?: string;
                venueId?: string;
                attractionId?: string;
                classificationName?: string;
            };

            try {
                const query = {
                    keyword,
                    startDateTime: startDate ? new Date(startDate) : undefined,
                    endDateTime: endDate ? new Date(endDate) : undefined,
                    ...otherParams
                };

                let results;
                switch (type) {
                    case 'event':
                        results = await this.client.searchEvents(query);
                        break;
                    case 'venue':
                        results = await this.client.searchVenues(query);
                        break;
                    case 'attraction':
                        results = await this.client.searchAttractions(query);
                        break;
                    default:
                        throw new McpError(
                            ErrorCode.InvalidParams,
                            `Invalid search type: ${type}`
                        );
                }

                const content = format === 'json' 
                    ? JSON.stringify(results, null, 2)
                    : formatResults(type, results, format !== 'text');

                return {
                    content: [
                        {
                            type: 'text',
                            text: content,
                        },
                    ],
                };
            } catch (error) {
                if (error instanceof Error) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error: ${error.message}`,
                            },
                        ],
                        isError: true,
                    };
                }
                throw error;
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Ticketmaster MCP server running on stdio');
    }
}

const server = new TicketmasterServer();
server.run().catch(console.error);