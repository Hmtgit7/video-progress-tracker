// // client/src/pages/VideoListPage.tsx - Enhanced with filtering and better UI
// import React, { useState, useEffect, useCallback } from 'react';
// import { videosAPI, progressAPI } from '../services/api';
// import { Video, Progress } from '../types';
// import { useAuth } from '../contexts/AuthContext';
// import VideoCard from '../components/VideoCard';

// // Video list filters
// type VideoFilter = 'all' | 'in-progress' | 'completed' | 'not-started';

// const VideoListPage: React.FC = () => {
//     const { auth } = useAuth();
//     const [videos, setVideos] = useState<Video[]>([]);
//     const [progressMap, setProgressMap] = useState<Record<number, Progress>>({});
//     const [isLoading, setIsLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);
//     const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
//     const [filter, setFilter] = useState<VideoFilter>('all');
//     const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
//     const [searchQuery, setSearchQuery] = useState<string>('');

//     // Function to fetch both videos and progress
//     const fetchVideosAndProgress = useCallback(async () => {
//         try {
//             setIsLoading(true);
//             setError(null);

//             // Fetch all videos
//             const videosResponse = await videosAPI.getAllVideos();
//             setVideos(videosResponse.videos);

//             // Fetch all progress for the user if authenticated
//             if (auth.isAuthenticated) {
//                 await fetchProgressOnly();
//             }
//         } catch (err: any) {
//             setError(err.response?.data?.message || 'Failed to load videos');
//             console.error('Error fetching videos:', err);
//         } finally {
//             setIsLoading(false);
//         }
//     }, [auth.isAuthenticated]);

//     // Function to only refresh the progress
//     const fetchProgressOnly = useCallback(async () => {
//         if (!auth.isAuthenticated) return;

//         try {
//             setIsRefreshing(true);
//             const progressResponse = await progressAPI.getAllProgress();
//             console.log('Progress data received:', progressResponse.progress);

//             // Convert array to a map of videoId -> progress
//             const progressObj: Record<number, Progress> = {};
//             progressResponse.progress.forEach((p: Progress) => {
//                 progressObj[p.video_id] = p;
//             });

//             setProgressMap(progressObj);
//         } catch (err) {
//             console.log('Error fetching progress or no progress found');
//         } finally {
//             setIsRefreshing(false);
//         }
//     }, [auth.isAuthenticated]);

//     // Initial data fetch
//     useEffect(() => {
//         fetchVideosAndProgress();
//     }, [fetchVideosAndProgress]);

//     // Set up polling interval for progress updates
//     useEffect(() => {
//         let intervalId: NodeJS.Timeout | null = null;

//         if (auth.isAuthenticated) {
//             intervalId = setInterval(() => {
//                 setRefreshTrigger(prev => prev + 1);
//             }, 15000); // Refresh every 15 seconds
//         }

//         return () => {
//             if (intervalId) clearInterval(intervalId);
//         };
//     }, [auth.isAuthenticated]);

//     // Handle refresh trigger
//     useEffect(() => {
//         if (refreshTrigger > 0 && auth.isAuthenticated) {
//             fetchProgressOnly();
//         }
//     }, [refreshTrigger, auth.isAuthenticated, fetchProgressOnly]);

//     // Filter videos based on selection and search query
//     const filteredVideos = videos.filter(video => {
//         // First apply search filter if there's a query
//         if (searchQuery.trim() !== '') {
//             const query = searchQuery.toLowerCase();
//             const matchesTitle = video.title.toLowerCase().includes(query);
//             const matchesDescription = video.description ?
//                 video.description.toLowerCase().includes(query) : false;

//             if (!matchesTitle && !matchesDescription) {
//                 return false;
//             }
//         }

//         // Then apply progress filter
//         if (filter === 'all') return true;

//         const progress = progressMap[video.id];
//         const percentage = progress ? progress.progress_percentage : 0;

//         switch (filter) {
//             case 'in-progress':
//                 return percentage > 0 && percentage < 95;
//             case 'completed':
//                 return percentage >= 95;
//             case 'not-started':
//                 return !progress || percentage === 0;
//             default:
//                 return true;
//         }
//     });

//     // Manually refresh progress
//     const handleRefresh = () => {
//         setRefreshTrigger(prev => prev + 1);
//     };

//     // Generate summary stats
//     const totalVideos = videos.length;
//     const completedVideos = Object.values(progressMap).filter(p => p.progress_percentage >= 95).length;
//     const inProgressVideos = Object.values(progressMap).filter(p => p.progress_percentage > 0 && p.progress_percentage < 95).length;
//     const notStartedVideos = totalVideos - completedVideos - inProgressVideos;

//     if (isLoading && videos.length === 0) {
//         return (
//             <div className="flex justify-center items-center min-h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="container mx-auto px-4 py-8">
//                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
//                     <p className="font-bold">Error</p>
//                     <p>{error}</p>
//                     <button
//                         onClick={fetchVideosAndProgress}
//                         className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-200"
//                     >
//                         Try Again
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="container mx-auto px-4 py-8">
//             <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//                     <h1 className="text-3xl font-bold">Available Videos</h1>

//                     {auth.isAuthenticated && (
//                         <button
//                             onClick={handleRefresh}
//                             disabled={isRefreshing}
//                             className={`mt-4 md:mt-0 ${isRefreshing
//                                     ? 'bg-gray-400 cursor-not-allowed'
//                                     : 'bg-primary-500 hover:bg-primary-600'
//                                 } text-white px-4 py-2 rounded transition duration-300 flex items-center`}
//                         >
//                             {isRefreshing ? (
//                                 <>
//                                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                     Refreshing...
//                                 </>
//                             ) : (
//                                 <>
//                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                                     </svg>
//                                     Refresh Progress
//                                 </>
//                             )}
//                         </button>
//                     )}
//                 </div>

//                 {auth.isAuthenticated && (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center">
//                             <span className="text-2xl font-bold text-blue-600">{totalVideos}</span>
//                             <span className="text-blue-800">Total Videos</span>
//                         </div>
//                         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col items-center">
//                             <span className="text-2xl font-bold text-yellow-600">{notStartedVideos}</span>
//                             <span className="text-yellow-800">Not Started</span>
//                         </div>
//                         <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col items-center">
//                             <span className="text-2xl font-bold text-purple-600">{inProgressVideos}</span>
//                             <span className="text-purple-800">In Progress</span>
//                         </div>
//                         <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center">
//                             <span className="text-2xl font-bold text-green-600">{completedVideos}</span>
//                             <span className="text-green-800">Completed</span>
//                         </div>
//                     </div>
//                 )}

//                 <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
//                     <div className="inline-flex rounded-md shadow-sm" role="group">
//                         <button
//                             type="button"
//                             onClick={() => setFilter('all')}
//                             className={`px-4 py-2 text-sm font-medium rounded-l-lg ${filter === 'all'
//                                     ? 'bg-primary-600 text-white'
//                                     : 'bg-white text-gray-700 hover:bg-gray-100'
//                                 } border border-gray-200`}
//                         >
//                             All
//                         </button>
//                         <button
//                             type="button"
//                             onClick={() => setFilter('not-started')}
//                             className={`px-4 py-2 text-sm font-medium ${filter === 'not-started'
//                                     ? 'bg-primary-600 text-white'
//                                     : 'bg-white text-gray-700 hover:bg-gray-100'
//                                 } border-t border-b border-gray-200`}
//                         >
//                             Not Started
//                         </button>
//                         <button
//                             type="button"
//                             onClick={() => setFilter('in-progress')}
//                             className={`px-4 py-2 text-sm font-medium ${filter === 'in-progress'
//                                     ? 'bg-primary-600 text-white'
//                                     : 'bg-white text-gray-700 hover:bg-gray-100'
//                                 } border-t border-b border-gray-200`}
//                         >
//                             In Progress
//                         </button>
//                         <button
//                             type="button"
//                             onClick={() => setFilter('completed')}
//                             className={`px-4 py-2 text-sm font-medium rounded-r-md ${filter === 'completed'
//                                     ? 'bg-primary-600 text-white'
//                                     : 'bg-white text-gray-700 hover:bg-gray-100'
//                                 } border border-gray-200`}
//                         >
//                             Completed
//                         </button>
//                     </div>

//                     <div className="relative">
//                         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                             <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
//                                 <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
//                             </svg>
//                         </div>
//                         <input
//                             type="search"
//                             className="block w-full md:w-64 p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
//                             placeholder="Search videos..."
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {filteredVideos.length === 0 ? (
//                 <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
//                     <p className="font-bold">No Videos Found</p>
//                     <p>
//                         {videos.length === 0
//                             ? "There are currently no videos available."
//                             : "No videos match your current filters."}
//                     </p>
//                     {videos.length > 0 && (
//                         <button
//                             onClick={() => {
//                                 setFilter('all');
//                                 setSearchQuery('');
//                             }}
//                             className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-colors duration-200"
//                         >
//                             Reset Filters
//                         </button>
//                     )}
//                 </div>
//             ) : (
//                 <>
//                     <p className="text-gray-600 mb-4">Showing {filteredVideos.length} of {videos.length} videos</p>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {filteredVideos.map(video => (
//                             <VideoCard
//                                 key={video.id}
//                                 video={video}
//                                 progress={progressMap[video.id]}
//                             />
//                         ))}
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default VideoListPage;

// client/src/pages/VideoListPage.tsx - Fixed progress update issue
import React, { useState, useEffect, useCallback } from 'react';
import { videosAPI, progressAPI } from '../services/api';
import { Video, Progress } from '../types';
import { useAuth } from '../contexts/AuthContext';
import VideoCard from '../components/VideoCard';

// Video list filters
type VideoFilter = 'all' | 'in-progress' | 'completed' | 'not-started';

const VideoListPage: React.FC = () => {
    const { auth } = useAuth();
    const [videos, setVideos] = useState<Video[]>([]);
    const [progressMap, setProgressMap] = useState<Record<number, Progress>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
    const [filter, setFilter] = useState<VideoFilter>('all');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Add force refresh flag
    const forceRefresh = useCallback(() => {
        console.log("Force refreshing progress data");
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // Function to fetch both videos and progress
    const fetchVideosAndProgress = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch all videos
            const videosResponse = await videosAPI.getAllVideos();
            setVideos(videosResponse.videos);
            console.log("Videos fetched:", videosResponse.videos.length);

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
    }, [auth.isAuthenticated]);

    // Function to only refresh the progress with explicit logging
    const fetchProgressOnly = useCallback(async () => {
        if (!auth.isAuthenticated) return;

        try {
            setIsRefreshing(true);
            console.log("Fetching latest progress data...");

            const progressResponse = await progressAPI.getAllProgress();
            console.log('Progress data received:', progressResponse.progress);

            // Convert array to a map of videoId -> progress
            const progressObj: Record<number, Progress> = {};
            progressResponse.progress.forEach((p: Progress) => {
                progressObj[p.video_id] = p;
                console.log(`Video ${p.video_id} progress: ${p.progress_percentage}%`);
            });

            setProgressMap(progressObj);
            console.log("Progress map updated:", Object.keys(progressObj).length, "entries");
        } catch (err) {
            console.error('Error fetching progress:', err);
        } finally {
            setIsRefreshing(false);
        }
    }, [auth.isAuthenticated]);

    // Initial data fetch
    useEffect(() => {
        console.log("Initial data fetch");
        fetchVideosAndProgress();
    }, [fetchVideosAndProgress]);

    // Set up polling interval for progress updates
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        if (auth.isAuthenticated) {
            console.log("Setting up progress refresh interval");
            intervalId = setInterval(() => {
                console.log("Auto-refresh triggered");
                setRefreshTrigger(prev => prev + 1);
            }, 10000); // Refresh every 10 seconds
        }

        return () => {
            if (intervalId) {
                console.log("Clearing progress refresh interval");
                clearInterval(intervalId);
            }
        };
    }, [auth.isAuthenticated]);

    // Handle refresh trigger
    useEffect(() => {
        if (refreshTrigger > 0 && auth.isAuthenticated) {
            console.log(`Refresh triggered (${refreshTrigger})`);
            fetchProgressOnly();
        }
    }, [refreshTrigger, auth.isAuthenticated, fetchProgressOnly]);

    // Filter videos based on selection and search query
    const filteredVideos = videos.filter(video => {
        // First apply search filter if there's a query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            const matchesTitle = video.title.toLowerCase().includes(query);
            const matchesDescription = video.description ?
                video.description.toLowerCase().includes(query) : false;

            if (!matchesTitle && !matchesDescription) {
                return false;
            }
        }

        // Then apply progress filter
        if (filter === 'all') return true;

        const progress = progressMap[video.id];
        const percentage = progress ? progress.progress_percentage : 0;

        switch (filter) {
            case 'in-progress':
                return percentage > 0 && percentage < 95;
            case 'completed':
                return percentage >= 95;
            case 'not-started':
                return !progress || percentage === 0;
            default:
                return true;
        }
    });

    // Manually refresh progress
    const handleRefresh = () => {
        console.log("Manual refresh requested");
        setRefreshTrigger(prev => prev + 1);
    };

    // Generate summary stats with detailed logging
    const totalVideos = videos.length;
    const completedCount = Object.values(progressMap).filter(p => p.progress_percentage >= 95).length;
    const inProgressCount = Object.values(progressMap).filter(p => p.progress_percentage > 0 && p.progress_percentage < 95).length;
    const notStartedCount = totalVideos - completedCount - inProgressCount;

    console.log(`Stats: Total=${totalVideos}, Completed=${completedCount}, InProgress=${inProgressCount}, NotStarted=${notStartedCount}`);

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
                    <button
                        onClick={fetchVideosAndProgress}
                        className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h1 className="text-3xl font-bold">Available Videos</h1>

                    {auth.isAuthenticated && (
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={`mt-4 md:mt-0 ${isRefreshing
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary-500 hover:bg-primary-600'
                                } text-white px-4 py-2 rounded transition duration-300 flex items-center`}
                        >
                            {isRefreshing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh Progress
                                </>
                            )}
                        </button>
                    )}
                </div>

                {auth.isAuthenticated && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center">
                            <span className="text-2xl font-bold text-blue-600">{totalVideos}</span>
                            <span className="text-blue-800">Total Videos</span>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col items-center">
                            <span className="text-2xl font-bold text-yellow-600">{notStartedCount}</span>
                            <span className="text-yellow-800">Not Started</span>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col items-center">
                            <span className="text-2xl font-bold text-purple-600">{inProgressCount}</span>
                            <span className="text-purple-800">In Progress</span>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center">
                            <span className="text-2xl font-bold text-green-600">{completedCount}</span>
                            <span className="text-green-800">Completed</span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button
                            type="button"
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${filter === 'all'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                } border border-gray-200`}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter('not-started')}
                            className={`px-4 py-2 text-sm font-medium ${filter === 'not-started'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                } border-t border-b border-gray-200`}
                        >
                            Not Started
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter('in-progress')}
                            className={`px-4 py-2 text-sm font-medium ${filter === 'in-progress'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                } border-t border-b border-gray-200`}
                        >
                            In Progress
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter('completed')}
                            className={`px-4 py-2 text-sm font-medium rounded-r-md ${filter === 'completed'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                } border border-gray-200`}
                        >
                            Completed
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            className="block w-full md:w-64 p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Search videos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {filteredVideos.length === 0 ? (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                    <p className="font-bold">No Videos Found</p>
                    <p>
                        {videos.length === 0
                            ? "There are currently no videos available."
                            : "No videos match your current filters."}
                    </p>
                    {videos.length > 0 && (
                        <button
                            onClick={() => {
                                setFilter('all');
                                setSearchQuery('');
                            }}
                            className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-colors duration-200"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <p className="text-gray-600 mb-4">Showing {filteredVideos.length} of {videos.length} videos</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVideos.map(video => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                progress={progressMap[video.id]}
                                onProgressUpdate={forceRefresh}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default VideoListPage;