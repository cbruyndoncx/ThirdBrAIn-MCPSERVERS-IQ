import { DocumentationProcessor } from '../../src/utils/DocumentationProcessor';

describe('DocumentationProcessor', () => {
    let processor: DocumentationProcessor;

    beforeEach(() => {
        processor = new DocumentationProcessor(process.env.BRAVE_API_KEY || '');
    });

    describe('processFrameworkDocumentation', () => {
        it('should process React documentation', async () => {
            const docs = await processor.processFrameworkDocumentation('react', {
                version: '18'
            });
            expect(docs.official).toBeDefined();
            expect(docs.community).toBeDefined();
            expect(docs.tutorials).toBeDefined();
        });

        it('should process Next.js documentation', async () => {
            const docs = await processor.processNextjsDocumentation('app router');
            expect(docs.official).toBeDefined();
            expect(docs.examples).toBeDefined();
        });
    });

    describe('processPythonDocumentation', () => {
        it('should process Python documentation', async () => {
            const docs = await processor.processPythonDocumentation('asyncio');
            expect(docs.standardLibrary).toBeDefined();
            expect(docs.pypi).toBeDefined();
        });
    });
});