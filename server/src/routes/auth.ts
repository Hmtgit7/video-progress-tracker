// server/src/routes/auth.ts
import { RequestHandler, Router } from 'express';
import { register, login, refreshToken, getCurrentUser } from '../controllers/auth';
import { authenticateUser } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register as RequestHandler);

/**
 * @route   POST /api/auth/login
 * @desc    Login a user
 * @access  Public
 */
router.post('/login', login as RequestHandler);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refreshToken as RequestHandler);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticateUser as RequestHandler, getCurrentUser as RequestHandler);

export default router;