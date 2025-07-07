// A Map to store request timestamps per IP address
const IPMap = new Map(); 

// Configuration Constants
const MAX_REQUESTS = 5;      // Max allowed requests per time window
const TIME_WINDOW = 1000;    // Time window in milliseconds (1 second)

/**
 * Throttle middleware to limit the rate of incoming requests.
 * 
 * Each IP address is allowed to make at most MAX_REQUESTS within the TIME_WINDOW.
 * If a client exceeds the limit, their request will be delayed (not blocked),
 * and executed after the time window has room again.
 * 
 * @param req - Incoming request object
 * @param res - Outgoing response object
 * @param next - Function to pass control to the next middleware
 */
export const throttleMiddleware = (req, res, next) => {
  const ip = req.ip;                 // Get the IP address of the client
  const currentTime = Date.now();    // Current request timestamp in ms

  // If this IP has no history, initialize an empty array
  if (!IPMap.has(ip)) {
    IPMap.set(ip, []);
  }

  // Get recent request timestamps for this IP
  // and filter to keep only those within the TIME_WINDOW
  const timestamps = IPMap.get(ip).filter(ts => currentTime - ts < TIME_WINDOW);
  IPMap.set(ip, timestamps); // Update the IP's record with cleaned timestamps

  // If under the allowed request limit, allow the request immediately
  if (timestamps.length < MAX_REQUESTS) {
    timestamps.push(currentTime);       // Add this request's timestamp
    IPMap.set(ip, timestamps);          // Update the IP's history
    next();                              // Proceed to next middleware or route
  } else {
    // Too many requests — calculate delay until oldest timestamp falls out of window
    const delay = TIME_WINDOW - (currentTime - timestamps[0]);

    // Delay the execution instead of rejecting
    setTimeout(() => {
      const now = Date.now();
      
      // Re-filter timestamps to make sure outdated ones are removed
      const updatedTimestamps = IPMap.get(ip).filter(ts => now - ts < TIME_WINDOW);
      updatedTimestamps.push(now);        // Add current (delayed) timestamp
      IPMap.set(ip, updatedTimestamps);   // Update IPMap with latest data
      next();                              // Proceed after delay
    }, delay);
  }
};
// Note: This middleware does not block requests but delays them if the limit is exceeded.
// This allows the server to handle bursts of traffic without rejecting requests outright.          
