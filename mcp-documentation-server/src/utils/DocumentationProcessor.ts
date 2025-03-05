import { BraveSearchIntegration } from './BraveSearchIntegration';

export class DocumentationProcessor {
    private braveSearch: BraveSearchIntegration;

    constructor(apiKey: string) {
        this.braveSearch = new BraveSearchIntegration(apiKey);
    }

    public async processFrameworkDocumentation(framework: string, options: any = {}): Promise<any> {
        try {
            const docs = await this.braveSearch.searchFrameworkDocs(framework, options.version);
            return this.organizeDocs(docs, framework);
        } catch (error) {
            console.error(`Error processing ${framework} documentation:`, error);
            throw error;
        }
    }

    public async processPythonDocumentation(topic: string, options: any = {}): Promise<any> {
        try {
            const docs = await this.braveSearch.searchWithContext(topic, {
                framework: 'python',
                version: options.version || '3.x',
                language: 'python'
            });
            return this.organizePythonDocs(docs, topic);
        } catch (error) {
            console.error('Error processing Python documentation:', error);
            throw error;
        }
    }

    public async processNextjsDocumentation(topic: string, options: any = {}): Promise<any> {
        try {
            const docs = await this.braveSearch.searchWithContext(topic, {
                framework: 'nextjs',
                version: options.version || 'latest',
                language: 'javascript'
            });
            return this.organizeNextjsDocs(docs, topic);
        } catch (error) {
            console.error('Error processing Next.js documentation:', error);
            throw error;
        }
    }

    private organizeDocs(docs: any, framework: string): any {
        const organized = {
            official: [],
            community: [],
            tutorials: [],
            examples: [],
            github: []
        };

        docs.results.forEach((doc: any) => {
            if (doc.url.includes(this.getOfficialDomain(framework))) {
                organized.official.push(doc);
            } else if (doc.type === 'tutorial') {
                organized.tutorials.push(doc);
            } else if (doc.url.includes('github.com')) {
                organized.github.push(doc);
            } else if (doc.type === 'example') {
                organized.examples.push(doc);
            } else {
                organized.community.push(doc);
            }
        });

        return organized;
    }

    private organizePythonDocs(docs: any, topic: string): any {
        return {
            standardLibrary: docs.results.filter((doc: any) => 
                doc.url.includes('docs.python.org')
            ),
            pypi: docs.results.filter((doc: any) => 
                doc.url.includes('pypi.org')
            ),
            tutorials: docs.results.filter((doc: any) => 
                doc.type === 'tutorial'
            ),
            community: docs.results.filter((doc: any) => 
                !doc.url.includes('docs.python.org') && 
                !doc.url.includes('pypi.org')
            )
        };
    }

    private organizeNextjsDocs(docs: any, topic: string): any {
        return {
            official: docs.results.filter((doc: any) => 
                doc.url.includes('nextjs.org')
            ),
            vercel: docs.results.filter((doc: any) => 
                doc.url.includes('vercel.com')
            ),
            examples: docs.results.filter((doc: any) => 
                doc.url.includes('github.com/vercel/next.js/tree/canary/examples')
            ),
            community: docs.results.filter((doc: any) => 
                !doc.url.includes('nextjs.org') && 
                !doc.url.includes('vercel.com')
            )
        };
    }

    private getOfficialDomain(framework: string): string {
        const domains: { [key: string]: string } = {
            react: 'reactjs.org',
            vue: 'vuejs.org',
            angular: 'angular.io',
            nextjs: 'nextjs.org',
            python: 'python.org'
        };
        return domains[framework.toLowerCase()] || '';
    }
}