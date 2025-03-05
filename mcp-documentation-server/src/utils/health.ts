import { metrics } from './metrics';
import logger from './logger';

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    uptime: number;
    metrics: any;
    lastError?: string;
}

export class HealthChecker {
    private startTime: number;
    private lastError?: string;

    constructor() {
        this.startTime = Date.now();
    }

    public getStatus(): HealthStatus {
        const currentMetrics = metrics.getMetrics();
        const errorRate = this.calculateErrorRate(currentMetrics);

        return {
            status: this.determineStatus(errorRate),
            version: process.env.npm_package_version || '1.0.0',
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            metrics: currentMetrics,
            lastError: this.lastError
        };
    }

    public recordError(error: Error): void {
        this.lastError = error.message;
        logger.error('Service error:', { error: error.message, stack: error.stack });
    }

    private calculateErrorRate(metrics: any): number {
        const totalRequests = metrics.total_requests || 0;
        const totalErrors = metrics.total_errors || 0;
        return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    }

    private determineStatus(errorRate: number): 'healthy' | 'degraded' | 'unhealthy' {
        if (errorRate >= 25) return 'unhealthy';
        if (errorRate >= 10) return 'degraded';
        return 'healthy';
    }
}

export const healthChecker = new HealthChecker();