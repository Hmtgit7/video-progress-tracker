// server/src/controllers/video.ts
import { Request, Response } from 'express';
import * as videoModel from '../models/video';

export async function getAllVideos(req: Request, res: Response) {
    try {
        const videos = await videoModel.getAllVideos();
        res.status(200).json({ videos });
    } catch (error) {
        console.error('Error getting videos:', error);
        res.status(500).json({ message: 'Error retrieving videos' });
    }
}

export async function getVideoById(req: Request, res: Response) {
    try {
        const videoId = parseInt(req.params.id);

        if (isNaN(videoId)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }

        const video = await videoModel.getVideoById(videoId);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        res.status(200).json({ video });
    } catch (error) {
        console.error('Error getting video by ID:', error);
        res.status(500).json({ message: 'Error retrieving video' });
    }
}

export async function createVideo(req: Request, res: Response) {
    try {
        const { title, description, url, duration } = req.body;

        // Validate required fields
        if (!title || !url || !duration) {
            return res.status(400).json({ message: 'Title, URL, and duration are required' });
        }

        // Validate duration is a positive number
        if (typeof duration !== 'number' || duration <= 0) {
            return res.status(400).json({ message: 'Duration must be a positive number' });
        }

        const newVideo = await videoModel.createVideo({
            title,
            description,
            url,
            duration
        });

        res.status(201).json({
            message: 'Video created successfully',
            video: newVideo
        });
    } catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({ message: 'Error creating video' });
    }
}

export async function updateVideo(req: Request, res: Response) {
    try {
        const videoId = parseInt(req.params.id);

        if (isNaN(videoId)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }

        // Check if video exists
        const existingVideo = await videoModel.getVideoById(videoId);
        if (!existingVideo) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Get fields to update
        const { title, description, url, duration } = req.body;

        // Validate duration if provided
        if (duration !== undefined && (typeof duration !== 'number' || duration <= 0)) {
            return res.status(400).json({ message: 'Duration must be a positive number' });
        }

        // Update the video
        const updatedVideo = await videoModel.updateVideo(videoId, {
            title,
            description,
            url,
            duration
        });

        res.status(200).json({
            message: 'Video updated successfully',
            video: updatedVideo
        });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ message: 'Error updating video' });
    }
}

export async function deleteVideo(req: Request, res: Response) {
    try {
        const videoId = parseInt(req.params.id);

        if (isNaN(videoId)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }

        // Check if video exists
        const existingVideo = await videoModel.getVideoById(videoId);
        if (!existingVideo) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Delete the video
        await videoModel.deleteVideo(videoId);

        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Error deleting video' });
    }
}