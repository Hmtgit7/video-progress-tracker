// server/src/routes/video.ts
import { RequestHandler, Router } from 'express';
import { getAllVideos, getVideoById, createVideo, updateVideo, deleteVideo } from '../controllers/video';
import { authenticateUser } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/videos
 * @desc    Get all videos
 * @access  Public
 */
router.get('/', getAllVideos as RequestHandler);

/**
 * @route   GET /api/videos/:id
 * @desc    Get a video by ID
 * @access  Public
 */
router.get('/:id', getVideoById as RequestHandler);

/**
 * @route   POST /api/videos
 * @desc    Create a new video
 * @access  Private (Admin only in a real application)
 */
router.post('/', authenticateUser as RequestHandler, createVideo as RequestHandler);

/**
 * @route   PUT /api/videos/:id
 * @desc    Update a video
 * @access  Private (Admin only in a real application)
 */
router.put('/:id', authenticateUser as RequestHandler, updateVideo as RequestHandler);

/**
 * @route   DELETE /api/videos/:id
 * @desc    Delete a video
 * @access  Private (Admin only in a real application)
 */
router.delete('/:id', authenticateUser as RequestHandler, deleteVideo as RequestHandler);

export default router;