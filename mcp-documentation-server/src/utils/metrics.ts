class MetricsCollector {
    private metrics: Map<string, number>;
    private intervals: Map<string, number[]>;

    constructor() {
        this.metrics = new Map();
        this.intervals = new Map();
    }

    public increment(metric: string, value: number = 1): void {
        const current = this.metrics.get(metric) || 0;
        this.metrics.set(metric, current + value);
    }

    public recordTiming(metric: string, duration: number): void {
        const timings = this.intervals.get(metric) || [];
        timings.push(duration);
        this.intervals.set(metric, timings);
    }

    public getMetrics(): any {
        const result: any = {};
        
        // Add counters
        for (const [key, value] of this.metrics.entries()) {
            result[key] = value;
        }

        // Add timings
        for (const [key, timings] of this.intervals.entries()) {
            if (timings.length > 0) {
                result[`${key}_avg`] = this.average(timings);
                result[`${key}_p95`] = this.percentile(timings, 95);
                result[`${key}_max`] = Math.max(...timings);
            }
        }

        return result;
    }

    private average(numbers: number[]): number {
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }

    private percentile(numbers: number[], p: number): number {
        const sorted = numbers.slice().sort((a, b) => a - b);
        const pos = ((sorted.length - 1) * p) / 100;
        const base = Math.floor(pos);
        const rest = pos - base;
        
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    }

    public reset(): void {
        this.metrics.clear();
        this.intervals.clear();
    }
}

export const metrics = new MetricsCollector();