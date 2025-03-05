export interface SearchParams {
    query: string;
    framework?: string;
    version?: string;
}

export interface SearchResult {
    title: string;
    url: string;
    description: string;
    type: string;
    relevance: number;
}

export interface CodeAnalysisParams {
    code: string;
    language: string;
    framework?: string;
}

export interface CodeAnalysisResult {
    suggestions: Suggestion[];
    patterns: Pattern[];
    metrics: Metrics;
}

export interface Suggestion {
    type: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    code?: string;
}

export interface Pattern {
    type: string;
    location: Location;
    description: string;
}

export interface Location {
    start: number;
    end: number;
    line: number;
}

export interface Metrics {
    complexity: number;
    maintainability: number;
    testability: number;
}