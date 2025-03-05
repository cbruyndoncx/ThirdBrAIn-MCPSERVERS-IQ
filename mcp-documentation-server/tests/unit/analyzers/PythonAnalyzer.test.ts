import { PythonAnalyzer } from '../../../src/analyzers/PythonAnalyzer';

describe('PythonAnalyzer', () => {
    let analyzer: PythonAnalyzer;

    beforeEach(() => {
        analyzer = new PythonAnalyzer();
    });

    it('should analyze Python code', () => {
        const code = `
            async def process_data(data: List[Dict]) -> List[Dict]:
                results = []
                for item in data:
                    processed = await process_item(item)
                    results.append(processed)
                return results
        `;
        const analysis = analyzer.analyze(code);
        expect(analysis.async).toBeDefined();
        expect(analysis.typing).toBeDefined();
    });

    it('should detect type hints', () => {
        const code = `
            from typing import Optional

            def get_user(user_id: int) -> Optional[Dict]:
                return {'id': user_id} if user_id else None
        `;
        const analysis = analyzer.analyze(code);
        expect(analysis.typing.typeHints.length).toBeGreaterThan(0);
    });
});