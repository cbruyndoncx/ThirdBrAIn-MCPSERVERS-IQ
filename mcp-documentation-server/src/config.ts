import { ConfigurationError } from './errors';

export interface ServerConfig {
    port?: number;
    braveApiKey: string;
    updateInterval?: number;
    cacheDuration?: number;
    debugMode?: boolean;
}

export function loadConfig(): ServerConfig {
    const config: ServerConfig = {
        port: parseInt(process.env.PORT || '3000', 10),
        braveApiKey: process.env.BRAVE_API_KEY || '',
        updateInterval: parseInt(process.env.UPDATE_INTERVAL || '3600000', 10),
        cacheDuration: parseInt(process.env.CACHE_DURATION || '86400000', 10),
        debugMode: process.env.DEBUG === 'true'
    };

    validateConfig(config);
    return config;
}

function validateConfig(config: ServerConfig): void {
    if (!config.braveApiKey) {
        throw new ConfigurationError('BRAVE_API_KEY is required');
    }

    if (isNaN(config.port!) || config.port! < 0 || config.port! > 65535) {
        throw new ConfigurationError('Invalid port number');
    }

    if (config.updateInterval! < 0) {
        throw new ConfigurationError('UPDATE_INTERVAL must be positive');
    }

    if (config.cacheDuration! < 0) {
        throw new ConfigurationError('CACHE_DURATION must be positive');
    }
}