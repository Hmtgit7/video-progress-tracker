// client/src/components/VideoCard.tsx - Enhanced video card with progress bar
import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Progress } from '../types';

interface VideoCardProps {
    video: Video;
    progress?: Progress;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, progress }) => {
    // Format duration from seconds to MM:SS
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const progressPercentage = progress ? Math.round(progress.progress_percentage) : 0;
    const hasWatched = progressPercentage > 0;
    const hasProgress = progress && progress.last_position > 0;

    return (
        <Link
            to={`/videos/${video.id}`}
            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300"
        >
            <div className="aspect-video bg-gray-200 relative">
                {/* Video thumbnail (placeholder) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`rounded-full p-3 flex items-center justify-center transition-all duration-300 ${hasWatched ? 'text-primary-500 bg-white bg-opacity-90' : 'text-gray-400 bg-white bg-opacity-70'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 transition duration-300 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                </div>

                {/* Resume indicator */}
                {hasProgress && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                        Resume
                    </div>
                )}

                {/* Progress overlay at bottom of thumbnail */}
                {progressPercentage > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                        <div
                            className="h-full bg-primary-500"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold mb-1 group-hover:text-primary-600 transition duration-300">{video.title}</h3>

                {video.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                )}

                <div className="mt-3">
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold inline-block text-primary-600">
                                    Progress: {progressPercentage}%
                                </span>
                            </div>
                            {hasProgress && (
                                <div className="text-xs text-gray-500">
                                    Resume at {formatDuration(progress.last_position)}
                                </div>
                            )}
                        </div>
                        <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200">
                            <div
                                style={{ width: `${progressPercentage}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default VideoCard;