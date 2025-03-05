import express, { Express } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import { loadConfig } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { metrics } from './utils/metrics';
import { healthChecker } from './utils/health';
import logger from './utils/logger';

export class DocumentationServer {
    private app: Express;
    private config: ReturnType<typeof loadConfig>;
    private server: any;

    constructor() {
        this.config = loadConfig();
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setupMiddleware(): void {
        // Basic middleware
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(express.json());

        // Request logging
        this.app.use((req, res, next) => {
            const startTime = Date.now();
            logger.info(`${req.method} ${req.url} started`);

            res.on('finish', () => {
                const duration = Date.now() - startTime;
                logger.info(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
                metrics.recordTiming('request_duration', duration);
            });

            next();
        });
    }

    private setupRoutes(): void {
        this.app.use(routes);

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json(healthChecker.getStatus());
        });
    }

    private setupErrorHandling(): void {
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Resource not found'
                }
            });
        });

        // Error handler
        this.app.use(errorHandler);
    }

    public async start(): Promise<void> {
        try {
            // Start cleanup interval
            this.startCleanupInterval();

            // Start server
            return new Promise((resolve) => {
                this.server = this.app.listen(this.config.port, () => {
                    logger.info(`Documentation Server started on port ${this.config.port}`);
                    resolve();
                });
            });
        } catch (error) {
            logger.error('Failed to start server:', error);
            throw error;
        }
    }

    private startCleanupInterval(): void {
        setInterval(() => {
            try {
                metrics.reset();
                const health = healthChecker.getStatus();
                logger.info('System status:', { health });
            } catch (error) {
                logger.error('Error in cleanup interval:', error);
            }
        }, this.config.updateInterval);
    }

    public async stop(): Promise<void> {
        try {
            if (this.server) {
                await new Promise((resolve) => {
                    this.server.close(resolve);
                });
                logger.info('Server stopped');
            }
        } catch (error) {
            logger.error('Error stopping server:', error);
            throw error;
        }
    }
}