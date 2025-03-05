class RateLimiter {
    private requests: Map<string, number[]>;
    private limit: number;
    private window: number;

    constructor(limit: number = 100, windowMs: number = 60000) {
        this.requests = new Map();
        this.limit = limit;
        this.window = windowMs;
    }

    public isAllowed(key: string): boolean {
        const now = Date.now();
        const windowStart = now - this.window;

        // Get existing requests for this key
        let timestamps = this.requests.get(key) || [];

        // Remove old timestamps
        timestamps = timestamps.filter(time => time > windowStart);

        // Check if under limit
        if (timestamps.length < this.limit) {
            timestamps.push(now);
            this.requests.set(key, timestamps);
            return true;
        }

        return false;
    }

    public getRemainingRequests(key: string): number {
        const timestamps = this.requests.get(key) || [];
        const windowStart = Date.now() - this.window;
        const recent = timestamps.filter(time => time > windowStart);
        return Math.max(0, this.limit - recent.length);
    }

    public reset(key: string): void {
        this.requests.delete(key);
    }
}

export const rateLimiter = new RateLimiter();