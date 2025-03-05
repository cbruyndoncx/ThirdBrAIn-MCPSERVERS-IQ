        if (context.fileTypes) {
            filters.fileType = context.fileTypes;
        }

        return filters;
    }

    // Specialized documentation handlers
    public async searchApiDocumentation(api: string): Promise<any> {
        return this.searchDocumentation(`${api} API documentation`, {
            filters: {
                fileType: ['json', 'yaml', 'md']
            }
        });
    }

    public async searchErrorSolutions(error: string, context: any): Promise<any> {
        const enhancedQuery = `${error} solution ${context.framework || ''} ${context.language || ''}`;
        return this.searchDocumentation(enhancedQuery, {
            filters: {
                site: ['stackoverflow.com', 'github.com']
            }
        });
    }

    public async searchTutorials(topic: string, context: any): Promise<any> {
        const enhancedQuery = `${topic} tutorial ${context.framework || ''} ${context.level || 'beginner'}`;
        return this.searchDocumentation(enhancedQuery, {
            filters: {
                timeRange: 'year' // Only recent tutorials
            }
        });
    }
}