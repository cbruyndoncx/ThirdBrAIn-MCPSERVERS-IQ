# MCP Gradio Client Proof of Concept

This repository is a proof of concept for implementing a Model Context Protocol (MCP) client using [Gradio](https://gradio.app/). It demonstrates how to interact with MCP servers using both STDIO and SSE communication methods within a Gradio interface.

The Model Context Protocol (MCP) aims to standardize the interaction between language models and tools, providing a uniform interface for communication. This proof of concept showcases the practical application of MCP in building AI assistants with tool integration.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
  - [STDIO Server Definition](#stdio-server-definition)
  - [SSE Server Definition](#sse-server-definition)
- [Usage](#usage)
- [Notes](#notes)
- [License](#license)
- [Contributing](#contributing)

## Introduction

This project implements an MCP client within a Gradio application, allowing users to interact with tools exposed via the MCP. By leveraging the MCP's standardized communication protocol, the client can seamlessly integrate with various tools, enhancing the capabilities of language models.

Key elements from the [Model Context Protocol](https://modelcontextprotocol.io/introduction):

- **Standardization**: MCP provides a standardized way for language models to interact with tools, promoting interoperability.
- **Communication Methods**: Supports multiple communication methods, including STDIO and SSE, for flexibility in tool integration.
- **Tool Integration**: Enables language models to use external tools, enhancing their functionality and applicability.

## Features

- **Gradio Interface**: User-friendly interface for interacting with the MCP client and tools.
- **STDIO and SSE Support**: Demonstrates how to connect to MCP servers using both STDIO and SSE methods.
- **Dynamic Tool Loading**: Automatically discovers and integrates tools exposed by MCP servers.
- **Debugging Support**: Optional debug mode to aid in development and troubleshooting.

## Installation

### Prerequisites

- Python 3.12 or higher
- [Node.js](https://nodejs.org/en/)
- [uvicorn](https://www.uvicorn.org/) (for UVX for STDIO servers)
- [NPX](https://www.npmjs.com/package/npx) (for NPX for STDIO servers)
- [Python](https://www.python.org/downloads/) (for Python module STDIO servers)
- OpenAI API Key (for language model interaction)

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/mcp-gradio-client.git
   cd mcp-gradio-client
   ```

2. **Create a Virtual Environment**
    Unix/macOS:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
   Windows:
   ```bash
    python -m venv .venv
    .venv\Scripts\activate
    ```

3. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set Up Environment Variables**

   Create a `.env` file in the root directory using `.env.example` as a reference and add your OpenAI API key:

   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```
5. **Running the App**

   Start the Gradio application:

   ```bash
   python gradio_ui.py
   ```

## Understanding MCP STDIO vs SSE Servers
See [stdio_versus_sse_mcp_servers.md](docs%2Fstdio_versus_sse_mcp_servers.md) for details on the differences between the two server types.


## Configuration

The application requires a `config.json` file to define MCP servers. This file should be placed in the root directory.
config.json should have the following format:

```json
{
  "mcpServers": {
    "stdio_server_name": {
      "type": "stdio",
      "command": "uvx",
      "args": [], 
      "env": {}
    },
    "sse_server_name": {
      "type": "sse",
      "url": "http://127.0.0.1:3001/sse",
      "headers": {}
    }
  }
}
```

See [Information - How to Configure the config.json file](docs%2FNotes_on_config_json.md) for details. Please note, while the file structure if very similar to what `Claude Desktop` uses, it is not exactly the same.
There are several important differences (all annotated in the other readme)
- `"type": "stdio"|"sse"` is required to specify which type of servers you are using
- `"command": "uvx"|"npx"|"python"` may need to be adjusted for windows users.  Example, `npx` will need to be `npx.cmd` for Windows


### STDIO Server Definition
- **Type**: Should be set to `"stdio"`.
- **Command**: The command to start the STDIO server (e.g., `"python"`, `"uv"`, `"uvx"`, or `"npx"`).
- **Args**: Arguments for the command (e.g., `["weather_server.py"]`).
- **Env**: Environment variables required by the server.

**Note**: STDIO servers are instantiated by Gradio and do not need to be manually started. They are typically launched via `npx`, `uvicorn`/`uvx`, or `python -m` command arguments. Some Python STDIO servers must be downloaded and installed first if they're not recognized packages.


### SSE Server Definition
- **Type**: Should be set to `"sse"`.
- **URL**: The endpoint where the SSE server is running.
- **Headers**: (Optional) Any headers required for the connection.

**Note**: SSE servers must be manually up and running for the Gradio client to connect. Ensure that the SSE server is started before running the Gradio application.


## Usage

1. **Start SSE Servers (if any)**
   Ensure any SSE servers defined in your `config.json` are running.

2. **Run the Gradio Application**
   ```bash
   python gradio_ui.py
   ```

3. **Interact with the Interface**
   Open the provided URL in your web browser (usually `http://127.0.0.1:7860`) to access the Gradio interface.

4. **Ask Questions**
   Use the chat interface to interact with the language model and the tools provided by the MCP servers.

## Notes
- **STDIO Servers**: Gradio will automatically instantiate STDIO servers as needed based on your configuration.
- **SSE Servers**: Must be started manually before running the Gradio client.
- **Debug Mode**: Enable or disable debug mode using the checkbox in the interface to view detailed logs.
- **Tool Installation**: Some tools may require additional installation steps if they are not standard packages. Ensure all necessary tools are installed and accessible.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

For more information on the Model Context Protocol and its capabilities, visit the [official MCP documentation](https://modelcontextprotocol.io/introduction).

## Contributing

<details>

<summary><h3>Open Developer Guide</h3></summary>

### Prerequisites

Gradio requires Python 3.12+ 

### Installation

Create a fork of this repository, then clone it:

```bash
git clone xxxxx
cd xxx
```

Next, create a virtual environment and install FastMCP:
Unix/macOS:
```bash
uv venv
source .venv/bin/activate
uv sync --frozen --all-extras --dev
```
Windows
```bash
venv
.venv/bin/activate
```



### Testing

Please make sure to test any new functionality. Your tests should be simple and atomic and anticipate change rather than cement complex patterns.

Run tests from the root directory:


```bash
pytest -v
```

### Formatting

This POC enforces a variety of required formats, which you can automatically enforce with pre-commit. 

Install the pre-commit hooks:

```bash
pre-commit install
```

The hooks will now run on every commit (as well as on every PR). To run them manually:

```bash
pre-commit run --all-files
```

### Opening a Pull Request

Fork the repository and create a new branch:

```bash
git checkout -b my-branch
```

Make your changes and commit them:


```bash
git add . && git commit -m "My changes"
```

Push your changes to your fork:


```bash
git push origin my-branch
```

Feel free to reach out in a GitHub issue or discussion if you have any questions!

</details>
