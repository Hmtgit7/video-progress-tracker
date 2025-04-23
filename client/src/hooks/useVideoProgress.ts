// client/src/hooks/useVideoProgress.ts - Fixed for TypeScript errors and better progress calculation
import { useState, useEffect, useRef, useCallback } from 'react';
import { progressAPI } from '../services/api';
import { Progress, TimeInterval } from '../types';

interface UseVideoProgressProps {
    videoId: number;
    videoDuration: number;
}

interface UseVideoProgressReturn {
    progress: Progress | null;
    isLoading: boolean;
    error: string | null;
    startTracking: (currentTime: number) => void;
    stopTracking: (currentTime: number) => void;
    trackProgress: (currentTime: number) => void;
    saveProgress: () => Promise<void>;
    resetProgress: () => Promise<void>;
}

// Time interval in milliseconds for progress updates
const PROGRESS_UPDATE_INTERVAL = 1000; // 1 second for more responsive updates
// Minimum viewing time in seconds to count as watched
const MIN_VIEWING_TIME = 0.5; // Half a second to capture even brief views
// Minimum time between progress saves to prevent overloading the server
const MIN_SAVE_INTERVAL = 1500; // 1.5 seconds
// Threshold for considering a video "completed"
const COMPLETION_THRESHOLD = 95; // 95% is considered complete

// Helper function to sort intervals by start time
const sortIntervals = (intervals: TimeInterval[]): TimeInterval[] => {
    return [...intervals].sort((a, b) => a.start - b.start);
};

// Helper function to merge overlapping intervals
const mergeIntervals = (intervals: TimeInterval[]): TimeInterval[] => {
    if (intervals.length === 0) return [];

    console.log("Merging intervals:", intervals.length);

    const sorted = sortIntervals(intervals);
    const result: TimeInterval[] = [{ ...sorted[0] }]; // Clone to avoid mutation issues

    for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i];
        const lastMerged = result[result.length - 1];

        // If current interval overlaps with the last merged interval (with small buffer for floating point)
        if (current.start <= lastMerged.end + 0.5) {
            // Extend the end of the last merged interval if necessary
            lastMerged.end = Math.max(lastMerged.end, current.end);
        } else {
            // Add the current interval to the result if no overlap
            result.push({ ...current }); // Clone to avoid mutation issues
        }
    }

    console.log("After merging:", result.length, "intervals");
    return result;
};

// Calculate total unique time watched
const calculateTotalWatchedTime = (intervals: TimeInterval[]): number => {
    const merged = mergeIntervals(intervals);
    const totalTime = merged.reduce((total, interval) => total + (interval.end - interval.start), 0);
    console.log("Total watched time:", totalTime);
    return totalTime;
};

// Calculate progress percentage with detailed logging
const calculateProgressPercentage = (intervals: TimeInterval[], videoDuration: number): number => {
    if (videoDuration <= 0) {
        console.log("Invalid video duration:", videoDuration);
        return 0;
    }

    const totalWatched = calculateTotalWatchedTime(intervals);
    console.log(`Total watched time: ${totalWatched.toFixed(2)}s out of ${videoDuration.toFixed(2)}s`);

    // Calculate percentage, ensuring we don't exceed 100%
    const percentage = Math.min((totalWatched / videoDuration) * 100, 100);
    console.log(`Raw progress percentage: ${percentage.toFixed(2)}%`);

    // Round to 2 decimal places
    return Math.round(percentage * 100) / 100;
};

export const useVideoProgress = ({ videoId, videoDuration }: UseVideoProgressProps): UseVideoProgressReturn => {
    const [progress, setProgress] = useState<Progress | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Refs to store tracking state
    const trackingStartTime = useRef<number | null>(null);
    const currentViewingInterval = useRef<TimeInterval | null>(null);
    const newIntervals = useRef<TimeInterval[]>([]);
    const lastSaveTime = useRef<number>(Date.now());
    const lastTrackedTime = useRef<number | null>(null);
    const saveQueue = useRef<boolean>(false); // Use to queue saves if one is in progress

    // Flag to detect if we've reached 100% (or the threshold)
    const hasReachedCompletion = useRef<boolean>(false);

    // Keep all intervals including previously saved ones for local calculation
    const allIntervals = useRef<TimeInterval[]>([]);

    // Define saveProgress first to resolve the TypeScript error
    const saveProgress = useCallback(async () => {
        // Don't allow too frequent saves
        if (Date.now() - lastSaveTime.current < MIN_SAVE_INTERVAL) {
            saveQueue.current = true;
            return;
        }

        if (isSaving) {
            saveQueue.current = true;
            return;
        }

        if (!videoDuration || videoDuration <= 0) {
            console.log('Cannot save progress: invalid video duration', videoDuration);
            return;
        }

        // Collect all new intervals
        const intervals = [...newIntervals.current];

        // Add current viewing interval if it exists and is long enough
        if (
            currentViewingInterval.current &&
            (currentViewingInterval.current.end - currentViewingInterval.current.start) >= MIN_VIEWING_TIME
        ) {
            intervals.push({ ...currentViewingInterval.current });
            console.log('Added current viewing interval:', currentViewingInterval.current);
        }

        // If we're at completion, add a full-watch interval to ensure 100% progress
        if (hasReachedCompletion.current) {
            // This ensures we get full credit even if we skipped around
            console.log('Adding full watch interval for completion');
            intervals.push({ start: 0, end: videoDuration });
        }

        // Only save if we have new intervals or we've explicitly requested a save at the current position
        if (intervals.length > 0 || saveQueue.current) {
            try {
                setIsSaving(true);
                console.log(`Saving ${intervals.length} intervals to server`);

                // Get current position from the last interval if available
                const current_position = currentViewingInterval.current?.end ||
                    intervals[intervals.length - 1]?.end ||
                    (progress ? progress.last_position : 0);

                const response = await progressAPI.updateProgress({
                    videoId,
                    intervals,
                    current_position
                });

                console.log('Progress saved successfully:', response.progress);

                // Update local state with server response
                setProgress(response.progress);

                // Update allIntervals with the merged intervals from the server
                if (response.progress && response.progress.watched_intervals) {
                    allIntervals.current = [...response.progress.watched_intervals];
                    console.log(`Updated with ${allIntervals.current.length} intervals from server`);
                }

                // Reset intervals now that they've been saved
                newIntervals.current = [];
                lastSaveTime.current = Date.now();

                // Check if another save was queued while this one was in progress
                if (saveQueue.current) {
                    saveQueue.current = false;
                    // Allow a small delay before the next save
                    setTimeout(() => {
                        saveProgress();
                    }, 100);
                }
            } catch (err: any) {
                console.error('Error saving progress:', err);
                setError(err.message || 'Failed to save progress');
            } finally {
                setIsSaving(false);
            }
        } else {
            console.log('No new intervals to save');
            // Mark save as complete anyway to update the timer
            lastSaveTime.current = Date.now();
        }
    }, [videoId, videoDuration, progress, isSaving]);

    // Start tracking when the video is playing
    const startTracking = useCallback((currentTime: number) => {
        console.log(`Started tracking at ${currentTime.toFixed(2)}`);
        trackingStartTime.current = currentTime;
        lastTrackedTime.current = currentTime;
    }, []);

    // Stop tracking when the video is paused
    const stopTracking = useCallback((currentTime: number) => {
        console.log(`Stopped tracking at ${currentTime.toFixed(2)}`);
        if (trackingStartTime.current !== null && lastTrackedTime.current !== null) {
            const start = trackingStartTime.current;
            const end = currentTime;

            // Only add interval if it's long enough
            if (end - start >= MIN_VIEWING_TIME) {
                const newInterval: TimeInterval = { start, end };
                console.log(`Adding interval: ${start.toFixed(2)}s to ${end.toFixed(2)}s (${(end - start).toFixed(2)}s)`);
                newIntervals.current.push(newInterval);
                allIntervals.current.push(newInterval);

                // Calculate local progress for immediate feedback
                if (videoDuration > 0) {
                    const newPercentage = calculateProgressPercentage(allIntervals.current, videoDuration);

                    // Update the local progress object immediately
                    setProgress(prev => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            last_position: currentTime,
                            progress_percentage: newPercentage
                        };
                    });

                    // Check if we've reached completion
                    if (newPercentage >= COMPLETION_THRESHOLD && !hasReachedCompletion.current) {
                        console.log(`Video completed! Progress: ${newPercentage}%`);
                        hasReachedCompletion.current = true;
                    }
                }

                // Trigger save immediately to ensure nothing is lost
                saveProgress();
            } else {
                console.log(`Interval too short (${(end - start).toFixed(2)}s), not adding`);
            }

            // Reset tracking
            trackingStartTime.current = null;
            currentViewingInterval.current = null;
            lastTrackedTime.current = null;
        }
    }, [videoDuration, saveProgress]);

    // Track progress while playing
    const trackProgress = useCallback((currentTime: number) => {
        // Skip if the time hasn't changed significantly (helps with floating point issues)
        if (lastTrackedTime.current !== null &&
            Math.abs(currentTime - lastTrackedTime.current) < 0.1) {
            return;
        }

        if (trackingStartTime.current !== null) {
            // Update current viewing interval
            currentViewingInterval.current = {
                start: trackingStartTime.current,
                end: currentTime
            };

            // Calculate local progress for current viewing session
            if (videoDuration > 0) {
                const tempIntervals = [
                    ...allIntervals.current,
                    ...(currentViewingInterval.current ? [currentViewingInterval.current] : [])
                ];

                const newPercentage = calculateProgressPercentage(tempIntervals, videoDuration);

                // Update the local progress object in real-time
                setProgress(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        last_position: currentTime,
                        progress_percentage: newPercentage
                    };
                });

                // Check if we've reached completion
                if (newPercentage >= COMPLETION_THRESHOLD && !hasReachedCompletion.current) {
                    console.log(`Video completed! Progress: ${newPercentage}%`);
                    hasReachedCompletion.current = true;

                    // Force a save when we reach completion
                    saveProgress();
                }
            }

            lastTrackedTime.current = currentTime;

            // Save progress periodically
            if (Date.now() - lastSaveTime.current > PROGRESS_UPDATE_INTERVAL) {
                console.log('Auto-saving while tracking, current time:', currentTime.toFixed(2));
                saveProgress();
            }
        }
    }, [videoDuration, saveProgress]);

    // Reset progress for this video
    const resetProgress = useCallback(async () => {
        try {
            console.log('Resetting progress for video', videoId);
            const response = await progressAPI.resetProgress(videoId);
            console.log('Progress reset successful:', response.progress);
            setProgress(response.progress);

            // Clear all tracking state
            trackingStartTime.current = null;
            currentViewingInterval.current = null;
            newIntervals.current = [];
            lastTrackedTime.current = null;
            allIntervals.current = [];
            hasReachedCompletion.current = false;

            return Promise.resolve();
        } catch (err: any) {
            console.error('Error resetting progress:', err);
            setError(err.message || 'Failed to reset progress');
            return Promise.reject(err);
        }
    }, [videoId]);

    // Load progress on component mount
    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setIsLoading(true);
                setError(null);

                console.log(`Fetching initial progress for video ${videoId}`);
                const response = await progressAPI.getVideoProgress(videoId);
                console.log('Fetched initial progress:', response.progress);
                setProgress(response.progress);

                // Initialize all intervals with previously watched intervals
                if (response.progress && response.progress.watched_intervals) {
                    allIntervals.current = [...response.progress.watched_intervals];
                    console.log(`Loaded ${allIntervals.current.length} existing intervals`);

                    // Check if we're already at completion threshold
                    if (response.progress.progress_percentage >= COMPLETION_THRESHOLD) {
                        hasReachedCompletion.current = true;
                        console.log("Video already marked as completed");
                    }
                }
            } catch (err: any) {
                // If progress doesn't exist yet, that's okay
                if (err.response && err.response.status === 404) {
                    console.log('No existing progress found, starting new');
                    setProgress({
                        video_id: videoId,
                        last_position: 0,
                        watched_intervals: [],
                        progress_percentage: 0
                    });
                    allIntervals.current = [];
                } else {
                    console.error('Error fetching progress:', err);
                    setError(err.message || 'Failed to load progress');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProgress();
    }, [videoId]);

    // Save progress when component unmounts
    useEffect(() => {
        return () => {
            console.log('Component unmounting, saving final progress');
            if (newIntervals.current.length > 0 || currentViewingInterval.current) {
                const finalSave = async () => {
                    try {
                        await saveProgress();
                    } catch (err) {
                        console.error('Error during final progress save:', err);
                    }
                };
                finalSave();
            }
        };
    }, [saveProgress]);

    return {
        progress,
        isLoading,
        error,
        startTracking,
        stopTracking,
        trackProgress,
        saveProgress,
        resetProgress
    };
};