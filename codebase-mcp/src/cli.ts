#!/usr/bin/env node
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * Entry point for the codebase-mcp CLI
 */

// Get the equivalent of __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The first arg after node executable and script name
const command = process.argv[2];

if (!command) {
  console.log('Usage: codebase-mcp <command>');
  console.log('Commands:');
  console.log('  start - Start the MCP server');
  console.log('  install - Install Repomix globally');
  console.log('  version - Show version information');
  process.exit(1);
}

switch (command.toLowerCase()) {
  case 'start':
    console.log('Starting Codebase MCP Server...');
    try {
      // Use dynamic import instead of require
      import('./tools/codebase.js').catch((err) => {
        console.error('Failed to import MCP server:', err);
        process.exit(1);
      });
    } catch (err) {
      console.error('Failed to start MCP server:', err);
      process.exit(1);
    }
    break;

  case 'install':
    console.log('Installing Repomix globally...');
    try {
      execSync('npm install -g repomix', { stdio: 'inherit' });
      console.log('Repomix installed successfully!');
    } catch (err) {
      console.error('Failed to install Repomix:', err);
      process.exit(1);
    }
    break;

  case 'version':
    try {
      // Read package.json using fs instead of require
      const packageJsonPath = join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      console.log(`codebase-mcp version: ${packageJson.version}`);
      
      try {
        const repomixVersion = execSync('npx repomix --version').toString().trim();
        console.log(`Repomix version: ${repomixVersion}`);
      } catch {
        // Ignore error and just show Repomix is not available
        console.log('Repomix is not installed or not available in PATH');
      }
    } catch (err) {
      console.error('Failed to get version information:', err);
      process.exit(1);
    }
    break;

  default:
    console.log(`Unknown command: ${command}`);
    console.log('Usage: codebase-mcp <command>');
    console.log('Commands:');
    console.log('  start - Start the MCP server');
    console.log('  install - Install Repomix globally');
    console.log('  version - Show version information');
    process.exit(1);
}
