import { DocumentationServer } from './server';
import logger from './utils/logger';

async function main() {
    const server = new DocumentationServer();

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('Received SIGTERM signal');
        await server.stop();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        logger.info('Received SIGINT signal');
        await server.stop();
        process.exit(0);
    });

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught exception:', error);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
        logger.error('Unhandled rejection:', reason);
        process.exit(1);
    });

    try {
        await server.start();
        logger.info('Server started successfully');
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
main();