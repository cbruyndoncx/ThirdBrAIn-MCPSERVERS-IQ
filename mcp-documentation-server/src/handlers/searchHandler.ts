import { SearchParams, SearchResult } from '../types';
import axios from 'axios';

export async function searchDocumentation(params: SearchParams): Promise<SearchResult[]> {
    const { query, framework, version } = params;
    
    try {
        // Build search query
        let searchQuery = query;
        if (framework) {
            searchQuery += ` ${framework}`;
            if (version) {
                searchQuery += ` version ${version}`;
            }
        }

        // Make API request to Brave Search
        const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
            headers: {
                'X-Subscription-Token': process.env.BRAVE_API_KEY || ''
            },
            params: {
                q: searchQuery,
                format: 'json'
            }
        });

        // Process results
        return response.data.results.map((result: any) => ({
            title: result.title,
            url: result.url,
            description: result.description,
            type: determineResultType(result),
            relevance: calculateRelevance(result, params)
        }));
    } catch (error) {
        console.error('Error searching documentation:', error);
        throw error;
    }
}

function determineResultType(result: any): string {
    const url = result.url.toLowerCase();
    if (url.includes('github.com')) return 'github';
    if (url.includes('docs.')) return 'documentation';
    if (url.includes('blog')) return 'blog';
    return 'general';
}

function calculateRelevance(result: any, params: SearchParams): number {
    let score = 0;
    
    // URL relevance
    if (result.url.includes('github.com')) score += 10;
    if (result.url.includes('docs.')) score += 8;
    if (result.url.includes('official')) score += 5;

    // Framework relevance
    if (params.framework && 
        result.url.toLowerCase().includes(params.framework.toLowerCase())) {
        score += 10;
    }

    // Version relevance
    if (params.version && 
        result.description.toLowerCase().includes(params.version.toLowerCase())) {
        score += 5;
    }

    return Math.min(score, 100);
}