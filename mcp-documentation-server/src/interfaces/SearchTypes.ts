export interface SearchOptions {
    count?: number;
    offset?: number;
    language?: string;
    country?: string;
    filters?: SearchFilters;
    context?: SearchContext;
}

export interface SearchFilters {
    fileType?: string[];
    site?: string | string[];
    timeRange?: string;
}

export interface SearchContext {
    framework?: string;
    version?: string;
    language?: string;
    level?: string;
    fileTypes?: string[];
}

export interface SearchResult {
    title: string;
    description: string;
    url: string;
    type: string;
    relevance: number;
    metadata: ResultMetadata;
}

export interface ResultMetadata {
    lastUpdated?: string;
    author?: string;
    language?: string;
    categories?: string[];
    tags?: string[];
}

export interface CodeSearchResult extends SearchResult {
    language: string;
    snippets: CodeSnippet[];
    repository?: RepositoryInfo;
    codeMetadata: CodeMetadata;
}

export interface CodeSnippet {
    code: string;
    language: string;
    startLine?: number;
    endLine?: number;
    relevance: number;
}

export interface RepositoryInfo {
    owner: string;
    repo: string;
    type: string;
    stars?: number;
    lastCommit?: string;
}

export interface CodeMetadata {
    language: string;
    fileSize?: number;
    lastModified?: string;
    license?: string;
}