export class McpError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500
    ) {
        super(message);
        this.name = 'McpError';
    }
}

export class ValidationError extends McpError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR', 400);
        this.name = 'ValidationError';
    }
}

export class SearchError extends McpError {
    constructor(message: string) {
        super(message, 'SEARCH_ERROR', 500);
        this.name = 'SearchError';
    }
}

export class AnalysisError extends McpError {
    constructor(message: string) {
        super(message, 'ANALYSIS_ERROR', 500);
        this.name = 'AnalysisError';
    }
}

export class ConfigurationError extends McpError {
    constructor(message: string) {
        super(message, 'CONFIG_ERROR', 500);
        this.name = 'ConfigurationError';
    }
}