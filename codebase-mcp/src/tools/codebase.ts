#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

// Create MCP server
const server = new McpServer({
  name: "codebase-mcp",
  version: "1.0.0",
});

// Define the 'getCodebase' tool
server.tool(
  "getCodebase",
  "Retrieve the entire codebase as a single text output using RepoMix",
  {
    cwd: z.string().describe("Current working directory of the codebase (defaults to current dir)").optional(),
    format: z.enum(["xml", "markdown", "plain"]).describe("Output format (xml, markdown, or plain)").default("xml").optional(),
    includeFileSummary: z.boolean().describe("Include summary of each file").default(true).optional(),
    includeDirectoryStructure: z.boolean().describe("Include directory structure").default(true).optional(),
    removeComments: z.boolean().describe("Remove comments from the code").default(false).optional(),
    removeEmptyLines: z.boolean().describe("Remove empty lines from the code").default(false).optional(),
    showLineNumbers: z.boolean().describe("Show line numbers").default(true).optional(),
    includePatterns: z.string().describe("Include patterns (using glob patterns, comma-separated)").optional(),
    ignorePatterns: z.string().describe("Ignore patterns (using glob patterns, comma-separated)").optional(),
  },
  async ({ cwd, format, includeFileSummary, includeDirectoryStructure, removeComments, removeEmptyLines, showLineNumbers, includePatterns, ignorePatterns }) => {
    try {
      // Prepare options for Repomix
      const workingDir = cwd || process.cwd();
      
      let command = "npx repomix --output stdout";
      
      // Add formatting options
      if (format) {
        command += ` --style ${format}`;
      }
      
      if (includeFileSummary === true) {
        command += ` --include-file-summary`;
      } else if (includeFileSummary === false) {
        command += ` --no-include-file-summary`;
      }
      
      if (includeDirectoryStructure === true) {
        command += ` --include-directory-structure`;
      } else if (includeDirectoryStructure === false) {
        command += ` --no-include-directory-structure`;
      }
      
      if (removeComments === true) {
        command += ` --remove-comments`;
      } else if (removeComments === false) {
        command += ` --no-remove-comments`;
      }
      
      if (removeEmptyLines === true) {
        command += ` --remove-empty-lines`;
      } else if (removeEmptyLines === false) {
        command += ` --no-remove-empty-lines`;
      }
      
      if (showLineNumbers === true) {
        command += ` --show-line-numbers`;
      } else if (showLineNumbers === false) {
        command += ` --no-show-line-numbers`;
      }
      
      if (includePatterns) {
        command += ` --include "${includePatterns}"`;
      }
      
      if (ignorePatterns) {
        command += ` --ignore "${ignorePatterns}"`;
      }

      console.error(`Running command: ${command}`);
      
      // Run Repomix to dump the codebase
      const output = execSync(command, {
        cwd: workingDir,
        maxBuffer: 1024 * 1024 * 50, // 50MB buffer for large codebases
      }).toString();

      return {
        content: [
          {
            type: "text",
            text: output,
          },
        ],
      };
    } catch (error: unknown) {
      console.error("Error running Repomix:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving codebase: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

// Define the 'getRemoteCodebase' tool for processing remote repositories
server.tool(
  "getRemoteCodebase",
  "Retrieve a remote repository's codebase as a single text output using RepoMix",
  {
    repo: z.string().describe("GitHub repository URL or shorthand format (e.g., 'username/repo')"),
    format: z.enum(["xml", "markdown", "plain"]).describe("Output format (xml, markdown, or plain)").default("xml").optional(),
    includeFileSummary: z.boolean().describe("Include summary of each file").default(true).optional(),
    includeDirectoryStructure: z.boolean().describe("Include directory structure").default(true).optional(),
    removeComments: z.boolean().describe("Remove comments from the code").default(false).optional(),
    removeEmptyLines: z.boolean().describe("Remove empty lines from the code").default(false).optional(),
    showLineNumbers: z.boolean().describe("Show line numbers").default(true).optional(),
    includePatterns: z.string().describe("Include patterns (using glob patterns, comma-separated)").optional(),
    ignorePatterns: z.string().describe("Ignore patterns (using glob patterns, comma-separated)").optional(),
  },
  async ({ repo, format, includeFileSummary, includeDirectoryStructure, removeComments, removeEmptyLines, showLineNumbers, includePatterns, ignorePatterns }) => {
    try {
      let command = `npx repomix --remote ${repo} --output stdout`;
      
      // Add formatting options
      if (format) {
        command += ` --style ${format}`;
      }
      
      if (includeFileSummary === true) {
        command += ` --include-file-summary`;
      } else if (includeFileSummary === false) {
        command += ` --no-include-file-summary`;
      }
      
      if (includeDirectoryStructure === true) {
        command += ` --include-directory-structure`;
      } else if (includeDirectoryStructure === false) {
        command += ` --no-include-directory-structure`;
      }
      
      if (removeComments === true) {
        command += ` --remove-comments`;
      } else if (removeComments === false) {
        command += ` --no-remove-comments`;
      }
      
      if (removeEmptyLines === true) {
        command += ` --remove-empty-lines`;
      } else if (removeEmptyLines === false) {
        command += ` --no-remove-empty-lines`;
      }
      
      if (showLineNumbers === true) {
        command += ` --show-line-numbers`;
      } else if (showLineNumbers === false) {
        command += ` --no-show-line-numbers`;
      }
      
      if (includePatterns) {
        command += ` --include "${includePatterns}"`;
      }
      
      if (ignorePatterns) {
        command += ` --ignore "${ignorePatterns}"`;
      }

      console.error(`Running command: ${command}`);
      
      // Run Repomix to dump the codebase
      const output = execSync(command, {
        maxBuffer: 1024 * 1024 * 50, // 50MB buffer for large codebases
      }).toString();

      return {
        content: [
          {
            type: "text",
            text: output,
          },
        ],
      };
    } catch (error: unknown) {
      console.error("Error running Repomix on remote repository:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving remote codebase: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

// Define the 'saveCodebase' tool for saving the codebase to a file
server.tool(
  "saveCodebase",
  "Save the codebase to a file using RepoMix",
  {
    cwd: z.string().describe("Current working directory of the codebase (defaults to current dir)").optional(),
    outputFile: z.string().describe("Output file path").default("repomix-output.txt"),
    format: z.enum(["xml", "markdown", "plain"]).describe("Output format (xml, markdown, or plain)").default("xml").optional(),
    includeFileSummary: z.boolean().describe("Include summary of each file").default(true).optional(),
    includeDirectoryStructure: z.boolean().describe("Include directory structure").default(true).optional(),
    removeComments: z.boolean().describe("Remove comments from the code").default(false).optional(),
    removeEmptyLines: z.boolean().describe("Remove empty lines from the code").default(false).optional(),
    showLineNumbers: z.boolean().describe("Show line numbers").default(true).optional(),
    includePatterns: z.string().describe("Include patterns (using glob patterns, comma-separated)").optional(),
    ignorePatterns: z.string().describe("Ignore patterns (using glob patterns, comma-separated)").optional(),
  },
  async ({ cwd, outputFile, format, includeFileSummary, includeDirectoryStructure, removeComments, removeEmptyLines, showLineNumbers, includePatterns, ignorePatterns }) => {
    try {
      // Prepare options for Repomix
      const workingDir = cwd || process.cwd();
      const outputPath = path.isAbsolute(outputFile) ? outputFile : path.join(workingDir, outputFile);
      
      let command = `npx repomix --output "${outputPath}"`;
      
      // Add formatting options
      if (format) {
        command += ` --style ${format}`;
      }
      
      if (includeFileSummary === true) {
        command += ` --include-file-summary`;
      } else if (includeFileSummary === false) {
        command += ` --no-include-file-summary`;
      }
      
      if (includeDirectoryStructure === true) {
        command += ` --include-directory-structure`;
      } else if (includeDirectoryStructure === false) {
        command += ` --no-include-directory-structure`;
      }
      
      if (removeComments === true) {
        command += ` --remove-comments`;
      } else if (removeComments === false) {
        command += ` --no-remove-comments`;
      }
      
      if (removeEmptyLines === true) {
        command += ` --remove-empty-lines`;
      } else if (removeEmptyLines === false) {
        command += ` --no-remove-empty-lines`;
      }
      
      if (showLineNumbers === true) {
        command += ` --show-line-numbers`;
      } else if (showLineNumbers === false) {
        command += ` --no-show-line-numbers`;
      }
      
      if (includePatterns) {
        command += ` --include "${includePatterns}"`;
      }
      
      if (ignorePatterns) {
        command += ` --ignore "${ignorePatterns}"`;
      }

      console.error(`Running command: ${command}`);
      
      // Run Repomix to save the codebase to a file
      execSync(command, {
        cwd: workingDir,
        maxBuffer: 1024 * 1024 * 50, // 50MB buffer for large codebases
      });

      // Check if the file was created successfully
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        
        return {
          content: [
            {
              type: "text",
              text: `Codebase saved successfully to ${outputPath} (${fileSizeInMB.toFixed(2)} MB)`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `Failed to save codebase to ${outputPath}. File was not created.`,
            },
          ],
        };
      }
    } catch (error: unknown) {
      console.error("Error saving codebase:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error saving codebase: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Codebase MCP Server running on stdio");
}

main().catch(console.error); 
