// server/src/models/progress.ts
import pool from '../db';
import { UserProgress, TimeInterval } from '../types';
import { addAndMergeIntervals, calculateProgressPercentage } from '../utils/intervalUtils';

export async function getUserVideoProgress(userId: number, videoId: number): Promise<UserProgress | null> {
    const query = 'SELECT * FROM user_progress WHERE user_id = $1 AND video_id = $2';
    const result = await pool.query(query, [userId, videoId]);

    return result.rowCount && result.rowCount > 0 ? result.rows[0] : null;
}

export async function getAllUserProgress(userId: number): Promise<UserProgress[]> {
    const query = 'SELECT * FROM user_progress WHERE user_id = $1';
    const result = await pool.query(query, [userId]);

    return result.rows;
}

export async function createUserProgress(
    userId: number,
    videoId: number,
    lastPosition: number = 0,
    watchedIntervals: TimeInterval[] = [],
    videoDuration: number
): Promise<UserProgress> {
    const progressPercentage = calculateProgressPercentage(watchedIntervals, videoDuration);

    const query = `
    INSERT INTO user_progress (user_id, video_id, last_position, watched_intervals, progress_percentage)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

    const values = [userId, videoId, lastPosition, JSON.stringify(watchedIntervals), progressPercentage];
    const result = await pool.query(query, values);

    return result.rows[0];
}

export async function updateUserProgress(
    userId: number,
    videoId: number,
    newIntervals: TimeInterval[] = [],
    currentPosition?: number,
    videoDuration?: number
): Promise<UserProgress | null> {
    // Add detailed logging
    console.log(`Updating progress for user ${userId}, video ${videoId}`);
    console.log('New intervals:', JSON.stringify(newIntervals));
    console.log('Current position:', currentPosition);

    // Get the current progress
    const currentProgress = await getUserVideoProgress(userId, videoId);
    console.log('Current progress from DB:', currentProgress ? JSON.stringify({
        last_position: currentProgress.last_position,
        progress_percentage: currentProgress.progress_percentage,
        intervals_count: currentProgress.watched_intervals.length
    }) : 'No existing progress');

    // If no progress exists and we need to create a new one,
    // we need videoDuration for calculating progress percentage
    if (!currentProgress) {
        // Make sure we have video duration
        if (videoDuration === undefined) {
            // Fetch the video to get its duration
            const videoQuery = 'SELECT duration FROM videos WHERE id = $1';
            const videoResult = await pool.query(videoQuery, [videoId]);
            if (!videoResult.rows[0]?.duration) {
                throw new Error('Could not find video duration');
            }
            videoDuration = videoResult.rows[0].duration;
        }

        // Create new progress
        return createUserProgress(userId, videoId, currentPosition || 0, newIntervals, videoDuration);
    }

    // If progress exists, merge the intervals
    // Sanitize intervals before merging to ensure they are valid
    const sanitizedNewIntervals = newIntervals.filter(interval =>
        typeof interval.start === 'number' &&
        typeof interval.end === 'number' &&
        interval.start >= 0 &&
        interval.end > interval.start
    );

    console.log('Sanitized intervals:', JSON.stringify(sanitizedNewIntervals));

    const existingIntervals: TimeInterval[] = currentProgress.watched_intervals || [];
    console.log('Existing intervals count:', existingIntervals.length);

    const mergedIntervals = addAndMergeIntervals(existingIntervals, sanitizedNewIntervals);
    console.log('Merged intervals count:', mergedIntervals.length);
    console.log('Merged intervals sample:', JSON.stringify(mergedIntervals.slice(0, 3)));

    // Get the video duration if not provided
    if (videoDuration === undefined) {
        const videoQuery = 'SELECT duration FROM videos WHERE id = $1';
        const videoResult = await pool.query(videoQuery, [videoId]);
        if (!videoResult.rows[0]) {
            throw new Error('Could not find video duration');
        }
        videoDuration = videoResult.rows[0].duration;
    }

    console.log('Video duration:', videoDuration);

    // Calculate the new progress percentage
    const progressPercentage = calculateProgressPercentage(mergedIntervals, videoDuration);
    console.log('Calculated progress percentage:', progressPercentage);

    // Update the last position if provided
    const lastPosition = currentPosition !== undefined ? currentPosition : currentProgress.last_position;
    console.log('Using last position:', lastPosition);

    // Update the progress in the database
    const updateQuery = `
      UPDATE user_progress
      SET watched_intervals = $1,
          progress_percentage = $2,
          last_position = $3,
          updated_at = NOW()
      WHERE user_id = $4 AND video_id = $5
      RETURNING *
    `;

    const values = [
        JSON.stringify(mergedIntervals),
        progressPercentage,
        lastPosition,
        userId,
        videoId
    ];

    const result = await pool.query(updateQuery, values);
    console.log('Progress updated in DB. New percentage:', result.rows[0]?.progress_percentage);
    return result.rows[0];
}

export async function deleteUserProgress(userId: number, videoId: number): Promise<boolean> {
    const query = 'DELETE FROM user_progress WHERE user_id = $1 AND video_id = $2';
    const result = await pool.query(query, [userId, videoId]);
    return result.rowCount !== null && result.rowCount > 0;
}