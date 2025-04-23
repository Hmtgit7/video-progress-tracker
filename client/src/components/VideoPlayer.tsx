// client/src/components/VideoPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useVideoProgress } from '../hooks/useVideoProgress';
import { Video } from '../types';
import { useAuth } from '../contexts/AuthContext';
import UnauthenticatedView from './UnauthenticatedView';

interface VideoPlayerProps {
    video: Video;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
    const { auth } = useAuth();
    const playerRef = useRef<ReactPlayer>(null);
    const [playing, setPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(video.duration);
    const [seeking, setSeeking] = useState<boolean>(false);
    const [buffering, setBuffering] = useState<boolean>(false);
    const [videoReady, setVideoReady] = useState<boolean>(false);
    const [localProgress, setLocalProgress] = useState<number>(0); // Local progress for immediate feedback

    const {
        progress,
        isLoading,
        error,
        startTracking,
        stopTracking,
        trackProgress,
        saveProgress,
        resetProgress
    } = useVideoProgress({
        videoId: video.id,
        videoDuration: duration
    });

    // Format seconds to MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Calculate played percentage based on current time
    const calculatePlayedPercentage = (): number => {
        if (duration <= 0) return 0;
        return (currentTime / duration) * 100;
    };

    // Update local progress for immediate feedback
    useEffect(() => {
        if (duration > 0 && !seeking && !buffering && videoReady && playing) {
            // Update local progress for immediate visual feedback
            const percentage = Math.min((currentTime / duration) * 100, 100);
            setLocalProgress(Math.round(percentage));
        }
    }, [currentTime, duration, seeking, buffering, videoReady, playing]);

    // Initialize with server progress when it loads
    useEffect(() => {
        if (progress && !isLoading) {
            setLocalProgress(Math.round(progress.progress_percentage));
        }
    }, [progress, isLoading]);

    // Update current time periodically while playing
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (playing && !seeking && !buffering && videoReady) {
            interval = setInterval(() => {
                const currentPlayerTime = playerRef.current?.getCurrentTime() || 0;
                setCurrentTime(currentPlayerTime);
                trackProgress(currentPlayerTime);
            }, 250); // More frequent updates (4 times per second)
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [playing, seeking, buffering, videoReady, trackProgress]);

    // Set initial position based on progress after video is ready
    useEffect(() => {
        if (progress && playerRef.current && !isLoading && videoReady) {
            console.log(`Setting initial position to ${progress.last_position}`);

            // Small delay to ensure the player is fully ready
            const timer = setTimeout(() => {
                playerRef.current?.seekTo(progress.last_position, 'seconds');
                setCurrentTime(progress.last_position);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [progress, isLoading, videoReady]);

    // Save progress when component unmounts
    useEffect(() => {
        return () => {
            console.log("Component unmounting, final progress save");
            if (playing) {
                stopTracking(currentTime);
            }
            saveProgress();
        };
    }, [playing, currentTime, stopTracking, saveProgress]);

    // Force progress save every 2 seconds while playing
    useEffect(() => {
        let saveInterval: NodeJS.Timeout | null = null;

        if (playing && videoReady && !seeking && !buffering) {
            saveInterval = setInterval(() => {
                saveProgress();
            }, 2000);
        }

        return () => {
            if (saveInterval) clearInterval(saveInterval);
        };
    }, [playing, videoReady, seeking, buffering, saveProgress]);

    // Handle player events
    const handleReady = () => {
        console.log('Video is ready to play');
        setVideoReady(true);

        // Set duration from player if available (more accurate than video.duration)
        if (playerRef.current) {
            const playerDuration = playerRef.current.getDuration();
            if (playerDuration && playerDuration > 0) {
                setDuration(playerDuration);
                console.log(`Video duration from player: ${playerDuration}`);
            }
        }
    };

    const handlePlay = () => {
        console.log('Video playing');
        setPlaying(true);
        startTracking(currentTime);
    };

    const handlePause = () => {
        console.log('Video paused');
        setPlaying(false);
        stopTracking(currentTime);
        // Save progress immediately on pause
        saveProgress();
    };

    const handleBuffer = () => {
        console.log('Video buffering');
        setBuffering(true);
        if (playing) {
            stopTracking(currentTime);
        }
    };

    const handleBufferEnd = () => {
        console.log('Video buffering ended');
        setBuffering(false);
        if (playing) {
            startTracking(currentTime);
        }
    };

    const handleProgress = (state: { playedSeconds: number }) => {
        if (!seeking && videoReady) {
            setCurrentTime(state.playedSeconds);
        }
    };

    const handleDuration = (duration: number) => {
        console.log(`Video duration updated: ${duration}`);
        setDuration(duration);
    };

    const handleSeekStart = () => {
        console.log('Seek started');
        setSeeking(true);
        if (playing) {
            stopTracking(currentTime);
        }
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value) * duration / 100;
        setCurrentTime(newTime);
    };

    const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
        const newTime = parseFloat((e.target as HTMLInputElement).value) * duration / 100;
        console.log(`Seek ended at ${newTime}`);

        playerRef.current?.seekTo(newTime / duration, 'fraction');
        setSeeking(false);

        if (playing) {
            startTracking(newTime);
        }
    };

    const handleReset = async () => {
        await resetProgress();
        if (playerRef.current) {
            playerRef.current.seekTo(0, 'seconds');
            setCurrentTime(0);
            setLocalProgress(0);
        }
    };

    const handleEnded = () => {
        console.log('Video ended');
        setPlaying(false);
        stopTracking(duration);
        saveProgress();
        // Force progress to 100% when video ends
        setLocalProgress(100);
    };

    if (!auth.isAuthenticated) {
        return <UnauthenticatedView />;
    }

    return (
        <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg">
            <div className="relative aspect-video">
                <ReactPlayer
                    ref={playerRef}
                    url={video.url}
                    width="100%"
                    height="100%"
                    playing={playing}
                    controls
                    onReady={handleReady}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onBuffer={handleBuffer}
                    onBufferEnd={handleBufferEnd}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    onEnded={handleEnded}
                    progressInterval={250}
                />
            </div>

            <div className="bg-gray-900 p-4">
                <div className="flex justify-between items-center text-white mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>

                <div className="flex items-center mb-2">
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={calculatePlayedPercentage()}
                        onChange={handleSeekChange}
                        onMouseDown={handleSeekStart}
                        onMouseUp={handleSeekEnd}
                        onTouchStart={handleSeekStart}
                        onTouchEnd={handleSeekEnd}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer video-progress-bar"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <div className="text-white">
                        {isLoading ? (
                            <span>Loading progress...</span>
                        ) : (
                            <div className="flex items-center">
                                <span className="mr-2">Progress:</span>
                                <div className="w-24 bg-gray-700 rounded-full h-2.5 mr-2">
                                    <div
                                        className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${localProgress}%` }}
                                    ></div>
                                </div>
                                <span>{localProgress}%</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleReset}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
                    >
                        Reset Progress
                    </button>
                </div>

                {error && (
                    <div className="text-red-500 mt-2">
                        Error: {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;