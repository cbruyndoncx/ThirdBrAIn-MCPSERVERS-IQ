import { BraveSearchIntegration } from '../../src/utils/BraveSearchIntegration';

describe('BraveSearchIntegration', () => {
    let braveSearch: BraveSearchIntegration;

    beforeEach(() => {
        braveSearch = new BraveSearchIntegration(process.env.BRAVE_API_KEY || '');
    });

    describe('searchDocumentation', () => {
        it('should return documentation search results', async () => {
            const results = await braveSearch.searchDocumentation('React hooks guide');
            expect(results).toBeDefined();
            expect(results.results.length).toBeGreaterThan(0);
            expect(results.results[0]).toHaveProperty('title');
            expect(results.results[0]).toHaveProperty('url');
        });

        it('should handle framework-specific searches', async () => {
            const results = await braveSearch.searchFrameworkDocs('react', '18');
            expect(results).toBeDefined();
            expect(results.results.some((r: any) => r.url.includes('reactjs.org'))).toBeTruthy();
        });
    });

    describe('searchCode', () => {
        it('should return code examples', async () => {
            const results = await braveSearch.searchCode('React useEffect example');
            expect(results).toBeDefined();
            expect(results.some((r: any) => r.language === 'javascript')).toBeTruthy();
        });
    });
});