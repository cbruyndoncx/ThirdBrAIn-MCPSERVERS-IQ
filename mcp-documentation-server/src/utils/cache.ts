import NodeCache from 'node-cache';
import { SearchParams, CodeAnalysisParams } from '../types';

class CacheManager {
    private cache: NodeCache;

    constructor(ttlSeconds: number = 3600) {
        this.cache = new NodeCache({
            stdTTL: ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones: false
        });
    }

    public getSearchResults(params: SearchParams): any {
        const key = this.generateSearchKey(params);
        return this.cache.get(key);
    }

    public setSearchResults(params: SearchParams, results: any): void {
        const key = this.generateSearchKey(params);
        this.cache.set(key, results);
    }

    public getAnalysisResults(params: CodeAnalysisParams): any {
        const key = this.generateAnalysisKey(params);
        return this.cache.get(key);
    }

    public setAnalysisResults(params: CodeAnalysisParams, results: any): void {
        const key = this.generateAnalysisKey(params);
        this.cache.set(key, results);
    }

    public invalidate(pattern: string): void {
        const keys = this.cache.keys().filter(key => key.startsWith(pattern));
        keys.forEach(key => this.cache.del(key));
    }

    private generateSearchKey(params: SearchParams): string {
        return `search:${params.query}:${params.framework || ''}:${params.version || ''}`;
    }

    private generateAnalysisKey(params: CodeAnalysisParams): string {
        return `analysis:${params.language}:${params.framework || ''}:${Buffer.from(params.code).toString('base64')}`;
    }

    public getStats(): any {
        return {
            hits: this.cache.getStats().hits,
            misses: this.cache.getStats().misses,
            keys: this.cache.keys().length
        };
    }
}

export const cacheManager = new CacheManager();