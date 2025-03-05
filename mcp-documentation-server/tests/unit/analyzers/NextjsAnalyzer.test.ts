import { NextjsAnalyzer } from '../../../src/analyzers/NextjsAnalyzer';

describe('NextjsAnalyzer', () => {
    let analyzer: NextjsAnalyzer;

    beforeEach(() => {
        analyzer = new NextjsAnalyzer();
    });

    it('should analyze Next.js app router code', () => {
        const code = `
            export default function Page() {
                return <div>Hello</div>;
            }
        `;
        const analysis = analyzer.analyze(code);
        expect(analysis.routing).toBeDefined();
        expect(analysis.serverComponents).toBeDefined();
    });

    it('should detect server components', () => {
        const code = `
            async function getData() {
                const res = await fetch('...');
                return res.json();
            }

            export default async function Page() {
                const data = await getData();
                return <div>{data}</div>;
            }
        `;
        const analysis = analyzer.analyze(code);
        expect(analysis.serverComponents.serverComponents.length).toBeGreaterThan(0);
    });
});