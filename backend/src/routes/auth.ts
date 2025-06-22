import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs for sensitive operations
  message: {
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Public routes (no authentication required)
router.post('/login', authLimiter, AuthController.login);
router.post('/register', authLimiter, AuthController.register);
router.post('/refresh-token', authLimiter, AuthController.refreshToken);

// Routes that accept either authenticated or unauthenticated requests
router.post('/logout', AuthController.logout);

// Protected routes (authentication required)
router.get('/me', authenticate, AuthController.me);
router.post('/logout-all', authenticate, AuthController.logoutAll);
router.post('/change-password', authenticate, strictAuthLimiter, AuthController.changePassword);

// Health check endpoint for auth service
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth',
    timestamp: new Date().toISOString()
  });
});

export default router;