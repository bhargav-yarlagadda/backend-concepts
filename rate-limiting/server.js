import express from "express";
import { fixedWindowRateLimiter } from "./rate-limiters/fixed-window";
import { slidingWindowRateLimiter } from "./rate-limiters/sliding-window";
import { slidingWindowCounterRateLimiter } from "./rate-limiters/sliding-window-counter";
import { tokenBucketRateLimiter } from "./rate-limiters/token-bucket";
import { leakyBucketRateLimiter } from "./rate-limiters/leaky-token-bucket";

const app = express();
const PORT = 3000;

app.use(express.json());


// Apply rate limiter globally (or to specific routes)
app.use(fixedWindowRateLimiter);
app.use(slidingWindowRateLimiter)
app.use(slidingWindowCounterRateLimiter)
app.use(tokenBucketRateLimiter)
app.use(leakyBucketRateLimiter)
app.get("/", (req, res) => {
  res.send("Rate Limiting Demo Server is running with ES Modules!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
