import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  limit: 100, // limit each IP to 100 requests per windowMs (here, per 15 minutes)
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit`
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
  // store: ... , // Redis, Memcached, etc. See below.
});
