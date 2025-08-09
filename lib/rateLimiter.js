export class TokenBucketRateLimiter {
  constructor({ capacity, refillIntervalMs }) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.queue = [];
    this.refillIntervalMs = refillIntervalMs;

    this._interval = setInterval(() => {
      this.tokens = this.capacity;
      this._drainQueue();
    }, this.refillIntervalMs);

    // Best effort clean exit in dev
    if (typeof this._interval.unref === "function") {
      this._interval.unref();
    }
  }

  _drainQueue() {
    while (this.tokens > 0 && this.queue.length > 0) {
      this.tokens -= 1;
      const resolve = this.queue.shift();
      resolve();
    }
  }

  async acquire() {
    if (this.tokens > 0) {
      this.tokens -= 1;
      return;
    }

    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  }
}

// Ensure a single global limiter instance across hot reloads
const globalKey = "__yarsya_ai_rate_limiter__";

export function getGlobalLimiter() {
  if (!globalThis[globalKey]) {
    globalThis[globalKey] = new TokenBucketRateLimiter({
      capacity: 3, // 3 requests per second
      refillIntervalMs: 1000,
    });
  }
  return globalThis[globalKey];
}