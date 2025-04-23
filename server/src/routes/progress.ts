// server/src/routes/progress.ts
import { RequestHandler, Router } from 'express';
import { getUserVideoProgress, getAllUserProgress, updateUserProgress, resetUserProgress } from '../controllers/progress';
import { authenticateUser } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/progress
 * @desc    Get all user's progress
 * @access  Private
 */
router.get('/', authenticateUser as RequestHandler, getAllUserProgress as RequestHandler);

/**
 * @route   GET /api/progress/:videoId
 * @desc    Get user's progress for a specific video
 * @access  Private
 */
router.get('/:videoId', authenticateUser as RequestHandler, getUserVideoProgress as RequestHandler);

/**
 * @route   POST /api/progress/:videoId
 * @desc    Update user's progress for a video
 * @access  Private
 */
router.post('/:videoId', authenticateUser as RequestHandler, updateUserProgress as RequestHandler);

/**
 * @route   DELETE /api/progress/:videoId
 * @desc    Reset user's progress for a video
 * @access  Private
 */
router.delete('/:videoId', authenticateUser as RequestHandler, resetUserProgress as RequestHandler);

export default router;