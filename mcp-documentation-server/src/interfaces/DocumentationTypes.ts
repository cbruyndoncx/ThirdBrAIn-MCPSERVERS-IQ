export interface Documentation {
    id: string;
    title: string;
    content: string;
    url: string;
    type: DocumentationType;
    framework?: string;
    version?: string;
    metadata: DocumentationMetadata;
}

export enum DocumentationType {
    OFFICIAL = 'official',
    COMMUNITY = 'community',
    TUTORIAL = 'tutorial',
    EXAMPLE = 'example',
    GITHUB = 'github',
    API = 'api'
}

export interface DocumentationMetadata {
    author?: string;
    lastUpdated: string;
    contributors?: string[];
    license?: string;
    tags: string[];
    category: string;
    framework?: FrameworkInfo;
    language?: LanguageInfo;
}

export interface FrameworkInfo {
    name: string;
    version: string;
    compatibility?: VersionCompatibility[];
}

export interface LanguageInfo {
    name: string;
    version: string;
    dependencies?: DependencyInfo[];
}

export interface VersionCompatibility {
    version: string;
    supported: boolean;
    notes?: string;
}

export interface DependencyInfo {
    name: string;
    version: string;
    required: boolean;
}