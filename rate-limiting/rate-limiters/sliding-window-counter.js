const windowSize = 60 * 1000; // 1 minute
const maxRequests = 20;       // Allow 20 requests per minute
const buckets = new Map();    // Map<IP, { current, previous, lastWindowTimestamp }>

/**
 * Sliding Window Counter Rate Limiter
 * 
 * Uses two adjacent counters and weights them based on how far the current time
 * is into the window. It approximates a sliding window behavior efficiently.
 */
export const slidingWindowCounterRateLimiter = (req, res, next) => {
  const now = Date.now();
  const ip = req.ip;

  const windowStart = Math.floor(now / windowSize) * windowSize;
  const timeIntoWindow = now - windowStart;
  const weight = timeIntoWindow / windowSize;

  if (!buckets.has(ip)) {
    buckets.set(ip, {
      current: { timestamp: windowStart, count: 1 },
      previous: { timestamp: windowStart - windowSize, count: 0 }
    });
    return next();
  }

  const entry = buckets.get(ip);
  const currentWindow = entry.current;
  const previousWindow = entry.previous;

  // If we're in a new window, shift the windows
  if (currentWindow.timestamp !== windowStart) {
    const newPrevious = { ...currentWindow };
    entry.previous = newPrevious;
    entry.current = { timestamp: windowStart, count: 1 };
  } else {
    entry.current.count++;
  }

  // Weighted sum to simulate sliding window
  const totalCount = entry.current.count * (1 - weight) + entry.previous.count * weight;

  if (totalCount > maxRequests) {
    const retryAfter = Math.ceil(windowSize / 1000); // Approximate
    return res.status(429).json({
      error: "Too many requests",
      retryAfter,
    });
  }

  return next();
};
/**
 * ✅ When is Sliding Window Counter a Good Choice?
 *
 * - Ideal when you want a **balance between accuracy and performance**.
 * - Suitable for **high-traffic APIs** (doesn't store timestamps).
 * - Great for **real-time systems** where bursts must be smoothed out.
 *
 * ❌ Not ideal for:
 * - Very strict accuracy (Sliding Window Log is more precise).
 * - Simple use cases (Fixed Window is easier).
 */
