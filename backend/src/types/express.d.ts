import { RateLimitInfo } from 'express-rate-limit';

declare global {
  namespace Express {
    interface Request {
      rateLimit?: RateLimitInfo;
    }
  }
}

export {};