// client/src/pages/VideoListPage.tsx
import React, { useState, useEffect } from 'react';
import { videosAPI, progressAPI } from '../services/api';
import { Video, Progress } from '../types';
import { useAuth } from '../contexts/AuthContext';
import VideoCard from '../components/VideoCard';

const VideoListPage: React.FC = () => {
    const { auth } = useAuth();
    const [videos, setVideos] = useState<Video[]>([]);
    const [progressMap, setProgressMap] = useState<Record<number, Progress>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    // Add polling interval to periodically refresh progress data
    useEffect(() => {
        // Initial fetch
        fetchVideosAndProgress();

        // Set up polling interval if user is authenticated
        let intervalId: NodeJS.Timeout | null = null;
        if (auth.isAuthenticated) {
            intervalId = setInterval(() => {
                setRefreshTrigger(prev => prev + 1); // Trigger a refresh
            }, 10000); // Refresh every 10 seconds
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [auth.isAuthenticated]);

    // Fetch data whenever refresh is triggered or auth changes
    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchProgressOnly();
        }
    }, [refreshTrigger, auth.isAuthenticated]);

    const fetchVideosAndProgress = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch all videos
            const videosResponse = await videosAPI.getAllVideos();
            setVideos(videosResponse.videos);

            // Fetch all progress for the user if authenticated
            if (auth.isAuthenticated) {
                await fetchProgressOnly();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load videos');
            console.error('Error fetching videos:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProgressOnly = async () => {
        if (!auth.isAuthenticated) return;

        try {
            const progressResponse = await progressAPI.getAllProgress();
            console.log('Progress data received:', progressResponse.progress);

            // Convert array to a map of videoId -> progress
            const progressObj: Record<number, Progress> = {};
            progressResponse.progress.forEach((p: Progress) => {
                progressObj[p.video_id] = p;
            });

            setProgressMap(progressObj);
        } catch (err) {
            console.log('Error fetching progress or no progress found');
        }
    };

    if (isLoading && videos.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Available Videos</h1>

                {auth.isAuthenticated && (
                    <button
                        onClick={() => setRefreshTrigger(prev => prev + 1)}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded transition duration-300 flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Progress
                    </button>
                )}
            </div>

            {videos.length === 0 ? (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                    <p className="font-bold">No Videos Found</p>
                    <p>There are currently no videos available.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map(video => (
                        <VideoCard
                            key={video.id}
                            video={video}
                            progress={progressMap[video.id]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default VideoListPage;