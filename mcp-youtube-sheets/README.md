# YouTube to Google Sheets MCP Server

This MCP server provides functionality to search YouTube videos and automatically save the results to Google Sheets. It's designed to work with Claude and other AI assistants that support the Model Context Protocol.

[English](README.md) | [日本語](README.ja.md)

## Features

- Search YouTube videos using the YouTube Data API v3
- Save search results to Google Sheets automatically
- Configurable search parameters (query, max results)
- Results include video title, URL, channel name, and publish date

## Installation

```bash
npm install @rikukawa/youtube-sheets-server
```

## Prerequisites

1. YouTube Data API v3 Setup:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable YouTube Data API v3
   - Create an API key

2. Google Sheets API Setup:
   - In the same project, enable Google Sheets API
   - Create a service account
   - Download the service account key (JSON format)
   - Share your target Google Sheet with the service account email

## Configuration

Add the server to your MCP settings file:

```json
{
  "mcpServers": {
    "youtube-sheets": {
      "command": "node",
      "args": ["path/to/youtube-sheets-server/build/index.js"],
      "env": {
        "YOUTUBE_API_KEY": "your-youtube-api-key",
        "SPREADSHEET_ID": "your-spreadsheet-id"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

## Usage

“Ask the AI assistant to ‘search for YouTube videos with “ChatGPT usage” and retrieve 10 videos’ and try using it in that way.”

## Output Format

The tool will save the following information to your Google Sheet:
- Video Title
- Video URL
- Channel Name
- Publish Date

## License

MIT

## Author

Riku Kawashima

## Repository

[GitHub Repository](https://github.com/Rickyyy1116/mcp-youtube-sheets)

## NPM Package

[@rikukawa/youtube-sheets-server](https://www.npmjs.com/package/@rikukawa/youtube-sheets-server)
