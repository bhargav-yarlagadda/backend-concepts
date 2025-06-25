const windowTime = 15 * 60 * 1000; // 15 minutes
const maxRequests = 100;
const ipRequestCounts = new Map();

/**
 * Fixed Window Counter Rate Limiter
 * 
 * This strategy limits each IP to `maxRequests` every `windowTime` period.
 * It resets the counter at the end of each fixed window.
 */
export const fixedWindowRateLimiter = (req, res, next) => {
  const now = Date.now();
  const ip = req.ip; // ✅ Correct usage

  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, { count: 1, windowStart: now });
    return next(); // ✅ Return early
  }

  const entry = ipRequestCounts.get(ip);

  // ✅ If still within the current window
  if (now - entry.windowStart < windowTime) {
    if (entry.count < maxRequests) {
      entry.count++;
      return next();
    } else {
      const retryAfter = Math.ceil((windowTime - (now - entry.windowStart)) / 1000);
      return res.status(429).json({
        error: "Too many requests",
        retryAfter,
      });
    }
  } else {
    // ✅ Window expired — reset count
    ipRequestCounts.set(ip, { count: 1, windowStart: now });
    return next();
  }
};

/**
 * ✅ When is Fixed Window a Good Choice?
 *
 * - Best for **simple use cases** where bursty abuse isn't a big issue.
 * - Ideal when you're okay with occasional **spike at window boundaries**.
 * - Works well for internal APIs or dev/testing environments.
 *
 * ❌ Not ideal for:
 * - Public APIs (susceptible to burst abuse near window edges).
 * - Systems requiring precise control or fairness.
 * - Distributed systems (unless using shared cache like Redis).
 */
