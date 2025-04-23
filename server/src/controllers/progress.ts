// server/src/controllers/progress.ts
import { Request, Response } from 'express';
import * as progressModel from '../models/progress';
import * as videoModel from '../models/video';
import { validateIntervals } from '../utils/intervalUtils';
import { TimeInterval } from '../types';

export async function getUserVideoProgress(req: Request, res: Response) {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const videoId = parseInt(req.params.videoId);

        if (isNaN(videoId)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }

        // Check if video exists
        const video = await videoModel.getVideoById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Get the user's progress
        const progress = await progressModel.getUserVideoProgress(req.user.userId, videoId);

        // If no progress found, return default values
        if (!progress) {
            return res.status(200).json({
                progress: {
                    video_id: videoId,
                    last_position: 0,
                    watched_intervals: [],
                    progress_percentage: 0,
                }
            });
        }

        res.status(200).json({ progress });
    } catch (error) {
        console.error('Error getting progress:', error);
        res.status(500).json({ message: 'Error retrieving progress' });
    }
}

export async function getAllUserProgress(req: Request, res: Response) {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const progressList = await progressModel.getAllUserProgress(req.user.userId);

        res.status(200).json({ progress: progressList });
    } catch (error) {
        console.error('Error getting all progress:', error);
        res.status(500).json({ message: 'Error retrieving progress data' });
    }
}

export async function updateUserProgress(req: Request, res: Response) {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const videoId = parseInt(req.params.videoId);

        if (isNaN(videoId)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }

        const { intervals, current_position } = req.body;
        console.log(`Updating progress for user ${req.user.userId}, video ${videoId}`);
        console.log('Received intervals:', JSON.stringify(intervals));
        console.log('Current position:', current_position);

        // Validate intervals
        if (!Array.isArray(intervals)) {
            return res.status(400).json({ message: 'Intervals must be an array' });
        }

        if (!validateIntervals(intervals)) {
            return res.status(400).json({ message: 'Invalid interval format' });
        }

        // Get video to check if it exists and get duration
        const video = await videoModel.getVideoById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        console.log('Video duration:', video.duration);

        // Update progress
        const updatedProgress = await progressModel.updateUserProgress(
            req.user.userId,
            videoId,
            intervals as TimeInterval[],
            current_position,
            video.duration
        );

        console.log('Updated progress:', JSON.stringify(updatedProgress));

        res.status(200).json({
            message: 'Progress updated successfully',
            progress: updatedProgress
        });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ message: 'Error updating progress' });
    }
}

export async function resetUserProgress(req: Request, res: Response) {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const videoId = parseInt(req.params.videoId);

        if (isNaN(videoId)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }

        // Check if video exists
        const video = await videoModel.getVideoById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Delete the progress first
        await progressModel.deleteUserProgress(req.user.userId, videoId);

        // Create new empty progress
        const newProgress = await progressModel.createUserProgress(
            req.user.userId,
            videoId,
            0,
            [],
            video.duration
        );

        res.status(200).json({
            message: 'Progress reset successfully',
            progress: newProgress
        });
    } catch (error) {
        console.error('Error resetting progress:', error);
        res.status(500).json({ message: 'Error resetting progress' });
    }
}