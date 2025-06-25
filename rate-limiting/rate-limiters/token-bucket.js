const bucketCapacity = 10; // Max burst size
const refillRate = 1;      // 1 token per second
const tokenBuckets = new Map();

/**
 * Token Bucket Rate Limiter
 * 
 * Allows bursty traffic but refills tokens at a steady rate.
 * Each request consumes 1 token. If no tokens, request is rejected.
 */
export const tokenBucketRateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  // Get or initialize token bucket for this IP
  if (!tokenBuckets.has(ip)) {
    tokenBuckets.set(ip, {
      tokens: bucketCapacity - 1,
      lastRefill: now
    });
    return next();
  }

  const bucket = tokenBuckets.get(ip);
  const timeElapsed = (now - bucket.lastRefill) / 1000; // in seconds

  // Refill tokens based on elapsed time
  const tokensToAdd = Math.floor(timeElapsed * refillRate);
  bucket.tokens = Math.min(bucketCapacity, bucket.tokens + tokensToAdd);
  bucket.lastRefill = tokensToAdd > 0 ? now : bucket.lastRefill;

  if (bucket.tokens > 0) {
    bucket.tokens--;
    return next();
  } else {
    return res.status(429).json({
      error: "Too many requests – token bucket empty",
      retryAfter: 1
    });
  }
};


/**
 * ✅ When is Token Bucket a Good Choice?
 *
 * - When you want to allow **burst traffic** (spikes are fine temporarily).
 * - Great for **user-facing APIs** with idle/active periods.
 * - Smoothly handles traffic with **refill flexibility**.
 *
 * ❌ Not ideal for:
 * - Strict fairness between users
 * - Systems needing constant/linear request pace (use Leaky Bucket instead)
 */
