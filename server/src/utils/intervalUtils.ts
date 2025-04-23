// server/src/utils/intervalUtils.ts
import { TimeInterval } from '../types';

/**
 * Sort intervals by start time
 */
export function sortIntervals(intervals: TimeInterval[]): TimeInterval[] {
    return [...intervals].sort((a, b) => a.start - b.start);
}

/**
 * Merge overlapping intervals to create unique watched intervals
 * Example:
 *   Input: [[0, 10], [5, 15], [20, 25]]
 *   Output: [[0, 15], [20, 25]]
 */
export function mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
    if (intervals.length === 0) return [];

    const sorted = sortIntervals(intervals);
    const result: TimeInterval[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i];
        const lastMerged = result[result.length - 1];

        // If current interval overlaps with the last merged interval
        if (current.start <= lastMerged.end + 0.5) { // Add small buffer for floating point comparisons
            // Extend the end of the last merged interval if necessary
            lastMerged.end = Math.max(lastMerged.end, current.end);
        } else {
            // Add the current interval to the result if no overlap
            result.push(current);
        }
    }

    return result;
}

/**
 * Calculate total duration of all intervals combined
 */
export function calculateTotalWatchedTime(intervals: TimeInterval[]): number {
    const merged = mergeIntervals(intervals);
    return merged.reduce((total, interval) => total + (interval.end - interval.start), 0);
}

/**
 * Calculate progress percentage based on watched intervals and video duration
 */
export function calculateProgressPercentage(intervals: TimeInterval[], videoDuration: number): number {
    if (videoDuration <= 0) return 0;

    const merged = mergeIntervals(intervals);
    console.log('Merged intervals:', JSON.stringify(merged));

    const totalWatched = merged.reduce((total, interval) => total + (interval.end - interval.start), 0);
    console.log(`Total watched time: ${totalWatched}, Video duration: ${videoDuration}`);

    const percentage = (totalWatched / videoDuration) * 100;
    console.log(`Raw percentage: ${percentage}`);

    // Cap at 100% and round to 2 decimal places
    return Math.min(Math.round(percentage * 100) / 100, 100);
}

/**
 * Add a new interval to the existing watched intervals and merge if needed
 */
export function addAndMergeInterval(
    existingIntervals: TimeInterval[],
    newInterval: TimeInterval
): TimeInterval[] {
    return mergeIntervals([...existingIntervals, newInterval]);
}

/**
 * Add multiple new intervals to existing watched intervals and merge
 */
export function addAndMergeIntervals(
    existingIntervals: TimeInterval[],
    newIntervals: TimeInterval[]
): TimeInterval[] {
    return mergeIntervals([...existingIntervals, ...newIntervals]);
}

/**
 * Validate that an interval is properly formed (start <= end)
 */
export function isValidInterval(interval: TimeInterval): boolean {
    return (
        typeof interval.start === 'number' &&
        typeof interval.end === 'number' &&
        interval.start <= interval.end &&
        interval.start >= 0
    );
}

/**
 * Validate all intervals in an array
 */
export function validateIntervals(intervals: TimeInterval[]): boolean {
    return intervals.every(isValidInterval);
}