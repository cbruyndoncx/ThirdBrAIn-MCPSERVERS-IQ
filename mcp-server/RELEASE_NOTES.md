## Release Notes - Version 0.2.0

Moved from [La Rebelion Repo](https://github.com/la-rebelion/mcp-server) to better reflect the project's purpose. This tool helps developers quickly scaffold new MCP (Model Context Protocol) servers, but using the Agentico's MCPServer, an open-source server `facade` implementation for the MCP to simplify servers development and integration.

### New Features
- **Tool Registration Validation**: Added type assertions and runtime checks to ensure that only valid `Tool` instances are registered.
- **Enhanced Error Handling**: Improved error messages for better debugging and user experience. "Local MCP servers should not log messages to stdout (standard out), as this will interfere with protocol operation." - https://modelcontextprotocol.io/docs/tools/debugging#server-side-logging

### Improvements
- **TypeScript Configuration**: Updated `tsconfig.json` to include declaration file generation.
- **Build Process**: Enhanced build scripts to ensure proper file permissions and output directory structure.

### Bug Fixes
- **Service Registration**: Fixed issues with tool registration.
- **File Permissions**: Corrected file permission settings post-build to avoid runtime errors.

### Breaking Changes
- **Module Exports**: Added [`exports`](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#exports) field to `package.json` to ensure proper module resolution. Fixing: Avoid `ERR_PACKAGE_PATH_NOT_EXPORTED` when importing `MCPServer` in external libraries, i.e.: `mcp-tools`.

### Documentation
- **README**: Updated with usage instructions, UML diagram, and contribution guidelines.

Go Rebels! ✊🏻

For more details, visit the [GitHub repository](https://github.com/agentico-dev/mcp-server) or [npm package page](https://www.npmjs.com/package/@agentico/mcp-server).

With ❤️ from [La Rebelion Labs](https://rebelion.la). 🚀
