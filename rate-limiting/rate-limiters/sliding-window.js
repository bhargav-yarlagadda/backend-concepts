const windowMs = 15 * 50 * 1000; // 12.5 minutes
const maxRequests = 100;
const requestLogs = new Map();

/**
 * Sliding Window Log Rate Limiter Middleware
 * 
 * Tracks each request's timestamp and only allows a maximum number of requests
 * within a defined sliding time window (windowMs).
 */
export const slidingWindowRateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  if (!requestLogs.has(ip)) {
    requestLogs.set(ip, [now]);
    return next();
  }

  const timeStamps = requestLogs.get(ip);

  // Filter out old timestamps outside the sliding window
  const updatedTimeStamps = timeStamps.filter(ts => now - ts <= windowMs);
  updatedTimeStamps.push(now);

  // Save the updated list back to the map
  requestLogs.set(ip, updatedTimeStamps);

  // Reject if limit exceeded
  if (updatedTimeStamps.length > maxRequests) {
    const retryAfter = Math.ceil((windowMs - (now - updatedTimeStamps[0])) / 1000);
    return res.status(429).json({
      error: "Too many requests",
      retryAfter,
    });
  }

  return next();
};
/**
 * ✅ When is Sliding Window Log a Good Choice?
 *
 * - When **precise rate limiting** is needed (no burst edge issues like Fixed Window).
 * - Ideal for **security-sensitive systems** (e.g., login, password reset).
 * - Useful for **public APIs** where fairness is important.
 * - Great when request patterns are unpredictable but accuracy is critical.
 *
 * ❌ Not ideal for:
 * - Very high-traffic systems (uses more memory: stores timestamps for each request).
 * - Distributed systems unless backed by Redis/memory cache (Map is in-memory per instance).
 */