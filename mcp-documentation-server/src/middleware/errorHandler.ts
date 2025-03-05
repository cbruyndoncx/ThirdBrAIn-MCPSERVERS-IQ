import { McpError } from '../errors';

export function handleError(error: Error) {
    if (error instanceof McpError) {
        return {
            success: false,
            error: {
                code: error.code,
                message: error.message
            },
            statusCode: error.statusCode
        };
    }

    // Handle unknown errors
    console.error('Unexpected error:', error);
    return {
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred'
        },
        statusCode: 500
    };
}