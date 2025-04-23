// client/src/pages/VideoPage.tsx - Enhanced with better UI and error handling
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videosAPI } from '../services/api';
import { Video } from '../types';
import VideoPlayer from '../components/VideoPlayer';
import { useAuth } from '../contexts/AuthContext';

const VideoPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { auth, isAuthInitialized } = useAuth();

    const [video, setVideo] = useState<Video | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);

    useEffect(() => {
        const fetchVideo = async () => {
            if (!id) return;

            try {
                setIsLoading(true);
                setError(null);

                // Fetch video details
                const videoId = parseInt(id);
                const videoResponse = await videosAPI.getVideoById(videoId);
                setVideo(videoResponse.video);

                // Fetch all videos to get related ones (in a real app, use a dedicated API endpoint)
                const allVideosResponse = await videosAPI.getAllVideos();
                const otherVideos = allVideosResponse.videos.filter((v: Video) => v.id !== videoId);

                // In a real app, use a more sophisticated algorithm to find truly related videos
                // For now, just pick random videos as "related"
                const shuffled = [...otherVideos].sort(() => 0.5 - Math.random());
                setRelatedVideos(shuffled.slice(0, 3));
            } catch (err: any) {
                console.error('Error fetching video:', err);
                setError(err.response?.data?.message || 'Failed to load video');
            } finally {
                setIsLoading(false);
            }
        };

        // Only fetch video if auth is initialized (to avoid unnecessary API calls)
        if (isAuthInitialized) {
            fetchVideo();
        }
    }, [id, isAuthInitialized]);

    // Format duration from seconds to MM:SS
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!isAuthInitialized || (isLoading && !video)) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Go Back
                </button>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow">
                    <p className="font-bold">Video Not Found</p>
                    <p>The requested video could not be found.</p>
                </div>
                <button
                    onClick={() => navigate('/videos')}
                    className="mt-4 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Videos
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="text-primary-600 hover:text-primary-800 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
                    <div className="flex items-center text-gray-600 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatDuration(video.duration)}</span>
                    </div>
                    {video.description && (
                        <p className="text-gray-700 mb-6">{video.description}</p>
                    )}

                    <div className="w-full max-w-4xl mx-auto">
                        <VideoPlayer video={video} />
                    </div>
                </div>
            </div>

            {!auth.isAuthenticated && (
                <div className="mb-8 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow">
                    <p className="font-bold">Sign in to track your progress</p>
                    <p>Create an account or sign in to track your watching progress.</p>
                    <div className="mt-4 flex">
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded mr-2 transition duration-300"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition duration-300"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            )}

            {/* Related Videos Section */}
            {relatedVideos.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Related Videos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedVideos.map(relatedVideo => (
                            <div
                                key={relatedVideo.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300"
                            >
                                <div
                                    className="aspect-video bg-gray-200 relative cursor-pointer"
                                    onClick={() => navigate(`/videos/${relatedVideo.id}`)}
                                >
                                    {/* Video thumbnail */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="rounded-full p-3 bg-white bg-opacity-70 text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Duration badge */}
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                        {formatDuration(relatedVideo.duration)}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3
                                        className="text-lg font-semibold mb-1 hover:text-primary-600 cursor-pointer"
                                        onClick={() => navigate(`/videos/${relatedVideo.id}`)}
                                    >
                                        {relatedVideo.title}
                                    </h3>
                                    {relatedVideo.description && (
                                        <p className="text-gray-600 text-sm line-clamp-2">{relatedVideo.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPage;