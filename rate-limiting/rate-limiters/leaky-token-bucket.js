const queueCapacity = 10; // Max number of queued requests
const leakRate = 1000;    // Leak 1 request every 1 second (in ms)

const buckets = new Map();

/**
 * Leaky Bucket Rate Limiter
 * 
 * Each IP has a queue that drains at a constant rate.
 * If queue is full, new requests are dropped.
 */
export const leakyBucketRateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  if (!buckets.has(ip)) {
    buckets.set(ip, {
      lastLeakTime: now,
      queue: 1
    });
    return next();
  }

  const bucket = buckets.get(ip);
  const elapsed = now - bucket.lastLeakTime;

  // How many leaks occurred since last check
  const leaked = Math.floor(elapsed / leakRate);
  bucket.queue = Math.max(0, bucket.queue - leaked);
  bucket.lastLeakTime = leaked > 0 ? now : bucket.lastLeakTime;

  if (bucket.queue < queueCapacity) {
    bucket.queue++;
    return next();
  } else {
    return res.status(429).json({
      error: "Too many requests – bucket overflow",
      retryAfter: Math.ceil(leakRate / 1000)
    });
  }
};
