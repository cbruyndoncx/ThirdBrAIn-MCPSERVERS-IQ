#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

if (!YOUTUBE_API_KEY) {
  throw new Error('YOUTUBE_API_KEY environment variable is required');
}

if (!SPREADSHEET_ID) {
  throw new Error('SPREADSHEET_ID environment variable is required');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

class YouTubeSheetsServer {
  private server: Server;
  private youtube;
  private sheets;

  constructor() {
    this.server = new Server(
      {
        name: 'youtube-sheets-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // YouTube API初期化
    this.youtube = google.youtube({
      version: 'v3',
      auth: YOUTUBE_API_KEY,
    });

    // Google Sheets API初期化
    const credentials = JSON.parse(
      readFileSync(join(__dirname, '../credentials.json'), 'utf-8')
    );
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    this.sheets = google.sheets({ version: 'v4', auth });

    this.setupToolHandlers();
    
    // エラーハンドリング
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    // ツール一覧を定義
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_and_save',
          description: 'Search YouTube videos and save results to Google Sheets',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query for YouTube videos',
              },
              maxResults: {
                type: 'number',
                description: 'Maximum number of results to return (1-50)',
                minimum: 1,
                maximum: 50,
                default: 10,
              },
            },
            required: ['query'],
          },
        },
      ],
    }));

    // ツールの実装
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'search_and_save') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      const { query, maxResults = 10 } = request.params.arguments as {
        query: string;
        maxResults?: number;
      };

      try {
        // YouTube検索を実行
        const searchResponse = await this.youtube.search.list({
          part: ['snippet'],
          q: query,
          maxResults,
          type: ['video'],
        });

        const videos = searchResponse.data.items?.map((item) => ({
          title: item.snippet?.title || '',
          url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
          channelTitle: item.snippet?.channelTitle || '',
          publishedAt: item.snippet?.publishedAt || '',
        })) || [];

        // スプレッドシートに結果を書き込み
        const values = videos.map((video) => [
          video.title,
          video.url,
          video.channelTitle,
          video.publishedAt,
        ]);

        // データを追加
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: 'A:D',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [
              ['タイトル', 'URL', 'チャンネル名', '公開日時'],
              ...values,
            ],
          },
        });

        return {
          _meta: {},
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  message: 'Successfully saved search results to Google Sheets',
                  videos,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        console.error('Error:', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to search videos or save to sheets: ${error}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('YouTube Sheets MCP server running on stdio');
  }
}

new YouTubeSheetsServer().run().catch(console.error);
