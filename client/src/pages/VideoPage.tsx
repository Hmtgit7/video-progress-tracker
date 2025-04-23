// client/src/pages/VideoPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videosAPI } from '../services/api';
import { Video } from '../types';
import VideoPlayer from '../components/VideoPlayer';
import { useAuth } from '../contexts/AuthContext';

const VideoPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [video, setVideo] = useState<Video | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load video');
                console.error('Error fetching video:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideo();
    }, [id]);

    if (isLoading) {
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
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                    <p className="font-bold">Video Not Found</p>
                    <p>The requested video could not be found.</p>
                </div>
                <button
                    onClick={() => navigate('/videos')}
                    className="mt-4 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded"
                >
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

            <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
            {video.description && (
                <p className="text-gray-700 mb-6">{video.description}</p>
            )}

            <div className="w-full max-w-4xl mx-auto">
                <VideoPlayer video={video} />
            </div>

            {!auth.isAuthenticated && (
                <div className="mt-6 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
                    <p className="font-bold">Sign in to track your progress</p>
                    <p>Create an account or sign in to track your watching progress.</p>
                    <div className="mt-2">
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-primary-500 hover:bg-primary-600 text-white py-1 px-4 rounded mr-2"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-4 rounded"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPage;