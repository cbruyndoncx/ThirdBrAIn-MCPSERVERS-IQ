# Codebase MCP

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server implementation that provides tools to retrieve and analyze entire codebases using [RepoMix](https://repomix.com/).

This MCP allows AI Agents like Cursor's Composer Agent to automatically read and understand entire codebases at once, making it easier for developers to work with large codebases and for AI assistants to have comprehensive context of a project.

## Features

- 📚 **Codebase Retrieval**: Retrieve the entire codebase as a single text output in different formats (XML, Markdown, Plain)
- 🌐 **Remote Repository Support**: Process remote GitHub repositories directly
- 💾 **File Saving**: Save the processed codebase to a file
- 🔧 **Customizable Options**: Control how the codebase is processed with various options (comments, line numbers, file summaries, etc.)

## Installation

### From NPM (Recommended)

```bash
# Install the package globally
npm install -g codebase-mcp

# Install RepoMix (required dependency)
codebase-mcp install
```

### From GitHub

```bash
# Clone the repository
git clone https://github.com/DeDeveloper23/codebase-mcp.git

# Navigate to the project directory
cd codebase-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .

# Install RepoMix (required dependency)
codebase-mcp install
```

## Integration with Cursor

To use this MCP with Cursor's Composer Agent:

1. Open Cursor IDE
2. Click the Composer icon in the sidebar
3. Click the "MCP Servers" button at the top
4. Click "Add new MCP server"
5. Fill in the details:
   - Name: `Codebase MCP` (or any name you prefer)
   - Type: `command`
   - Command: `codebase-mcp start`
6. Click "Add" to save

Once added, the MCP will provide three powerful tools to the Composer Agent:

### Available Tools

1. **getCodebase**
   - Purpose: Analyzes your current workspace/project
   - Use when: You want the AI to understand your entire codebase
   - Example prompt: "Please analyze my codebase to understand its structure"

2. **getRemoteCodebase**
   - Purpose: Fetches and analyzes any public GitHub repository
   - Use when: You want to explore or understand other projects
   - Example prompt: "Can you analyze the repository at github.com/username/repo?"

3. **saveCodebase**
   - Purpose: Saves the codebase analysis to a file for later use
   - Use when: You want to preserve the codebase snapshot or share it
   - Example prompt: "Save an analysis of this codebase to review later"

### Example Usage in Cursor

Here are some example prompts you can use with the Composer Agent:

```
"Analyze my current project and explain its main components."

"Can you look at the tensorflow/tensorflow repository and explain how their testing framework works?"

"Save an analysis of my project to 'codebase-analysis.md' in markdown format."
```

The Composer Agent will automatically use the appropriate tool based on your request.

## Usage Outside Cursor

### Starting the MCP Server

```bash
codebase-mcp start
```

This will start the MCP server in stdio mode, which can be used by any MCP-compatible clients.

## License

MIT
