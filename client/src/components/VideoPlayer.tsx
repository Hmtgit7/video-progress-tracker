// client/src/components/VideoPlayer.tsx - Updated to better save progress
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    const [localProgress, setLocalProgress] = useState<number>(0);
    const [initialSeekDone, setInitialSeekDone] = useState<boolean>(false);

    // Tracking continuous playing sessions
    const playSessionStartRef = useRef<number | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasUnsavedProgress = useRef<boolean>(false);

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
        if (duration > 0 && !seeking && !buffering && videoReady) {
            // Update local progress for immediate visual feedback
            const percentage = Math.min((currentTime / duration) * 100, 100);
            setLocalProgress(Math.round(percentage));
        }
    }, [currentTime, duration, seeking, buffering, videoReady]);

    // Initialize with server progress when it loads
    useEffect(() => {
        if (progress && !isLoading) {
            console.log(`Initializing with server progress: ${progress.progress_percentage}%`);
            setLocalProgress(Math.round(progress.progress_percentage));
        }
    }, [progress, isLoading]);

    // Set initial position based on progress after video is ready
    useEffect(() => {
        if (progress && playerRef.current && !isLoading && videoReady && !initialSeekDone) {
            console.log(`Setting initial position to ${progress.last_position}`);

            // Small delay to ensure the player is fully ready
            const timer = setTimeout(() => {
                console.log("Seeking to initial position now");
                playerRef.current?.seekTo(progress.last_position, 'seconds');
                setCurrentTime(progress.last_position);
                setInitialSeekDone(true);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [progress, isLoading, videoReady, initialSeekDone]);

    // Set up periodic progress tracking when playing
    useEffect(() => {
        if (playing && !seeking && !buffering && videoReady) {
            console.log("Starting progress tracking interval");

            // Clear any existing interval
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }

            // Set up new interval
            progressIntervalRef.current = setInterval(() => {
                const currentPlayerTime = playerRef.current?.getCurrentTime() || 0;
                setCurrentTime(currentPlayerTime);
                trackProgress(currentPlayerTime);
                hasUnsavedProgress.current = true;
            }, 250); // 4 times per second
        } else if (progressIntervalRef.current) {
            console.log("Stopping progress tracking interval");
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }

        // Clean up on unmount
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        };
    }, [playing, seeking, buffering, videoReady, trackProgress]);

    // Periodic save to server (separate from tracking)
    useEffect(() => {
        // Set up save interval when playing or when we have unsaved progress
        if ((playing && videoReady && !seeking && !buffering) || hasUnsavedProgress.current) {
            // Clear existing timeout if any
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Set new timeout
            saveTimeoutRef.current = setTimeout(() => {
                if (hasUnsavedProgress.current) {
                    console.log("Saving progress to server...");
                    saveProgress();
                    hasUnsavedProgress.current = false;
                }
            }, 2000); // Save every 2 seconds when playing
        }

        // Clean up on unmount
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }
        };
    }, [playing, videoReady, seeking, buffering, currentTime, saveProgress]);

    // Save progress when component unmounts
    useEffect(() => {
        return () => {
            console.log("Component unmounting, final progress save");
            if (hasUnsavedProgress.current) {
                saveProgress();
            }
        };
    }, [saveProgress]);

    // Track play sessions more accurately
    const startPlaySession = useCallback((time: number) => {
        console.log(`Starting play session at ${time.toFixed(2)}`);
        playSessionStartRef.current = time;
        startTracking(time);
        hasUnsavedProgress.current = true;
    }, [startTracking]);

    const endPlaySession = useCallback((time: number) => {
        if (playSessionStartRef.current !== null) {
            console.log(`Ending play session at ${time.toFixed(2)}`);
            stopTracking(time);
            playSessionStartRef.current = null;

            // Force immediate save on session end
            console.log("Forcing immediate save on session end");
            saveProgress();
            hasUnsavedProgress.current = false;
        }
    }, [stopTracking, saveProgress]);

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
        console.log('Video playing at', currentTime);
        setPlaying(true);
        startPlaySession(currentTime);
    };

    const handlePause = () => {
        console.log('Video paused at', currentTime);
        setPlaying(false);
        endPlaySession(currentTime);
    };

    const handleBuffer = () => {
        console.log('Video buffering');
        setBuffering(true);
        if (playing) {
            // Temporarily pause tracking during buffer
            endPlaySession(currentTime);
        }
    };

    const handleBufferEnd = () => {
        console.log('Video buffering ended');
        setBuffering(false);
        if (playing) {
            // Resume tracking after buffer
            startPlaySession(currentTime);
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
            endPlaySession(currentTime);
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
            startPlaySession(newTime);
        } else {
            // Even if not playing, we should track the seek position
            trackProgress(newTime);
            hasUnsavedProgress.current = true;
            saveProgress();
        }
    };

    const handleReset = async () => {
        console.log("Resetting progress");
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
        endPlaySession(duration);

        // Force progress to 100% when video ends
        setLocalProgress(100);

        // Explicitly set current time to duration to ensure 100% progress
        setCurrentTime(duration);

        // Force immediate save with 100% progress
        console.log("Video ended - forcing save with 100% progress");
        saveProgress();
    };

    if (!auth.isAuthenticated) {
        return <UnauthenticatedView />;
    }

    return (
        <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg video-player-container">
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
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading progress...
                            </span>
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

                    <div className="flex space-x-2">
                        {progress && progress.last_position > 0 && (
                            <button
                                onClick={() => {
                                    playerRef.current?.seekTo(0, 'seconds');
                                    setCurrentTime(0);

                                    // Also track the seek to start
                                    if (playing) {
                                        endPlaySession(currentTime);
                                        startPlaySession(0);
                                    } else {
                                        trackProgress(0);
                                        hasUnsavedProgress.current = true;
                                        saveProgress();
                                    }
                                }}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                Start Over
                            </button>
                        )}
                        <button
                            onClick={handleReset}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Reset Progress
                        </button>
                    </div>
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