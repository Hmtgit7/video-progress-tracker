// client/src/services/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { LoginCredentials, RegisterCredentials, ProgressUpdate, ApiResponse, User, Video, Progress } from '../types';

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
    register: async (credentials: RegisterCredentials): Promise<ApiResponse<{ user: User, accessToken: string, refreshToken: string }>> => {
        const response = await api.post('/auth/register', credentials);
        return response.data;
    },

    login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User, accessToken: string, refreshToken: string }>> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string, refreshToken: string }>> => {
        const response = await api.post('/auth/refresh', { refreshToken });
        return response.data;
    },

    getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

// Videos API
export const videosAPI = {
    getAllVideos: async (): Promise<ApiResponse<{ videos: Video[] }>> => {
        const response = await api.get('/videos');
        return response.data;
    },

    getVideoById: async (id: number): Promise<ApiResponse<{ video: Video }>> => {
        const response = await api.get(`/videos/${id}`);
        return response.data;
    },
};

// Progress API
export const progressAPI = {
    getVideoProgress: async (videoId: number): Promise<ApiResponse<{ progress: Progress }>> => {
        const response = await api.get(`/progress/${videoId}`);
        return response.data;
    },

    getAllProgress: async (): Promise<ApiResponse<{ progress: Progress[] }>> => {
        const response = await api.get('/progress');
        return response.data;
    },

    updateProgress: async (progressUpdate: ProgressUpdate): Promise<ApiResponse<{ progress: Progress }>> => {
        const response = await api.post(`/progress/${progressUpdate.videoId}`, {
            intervals: progressUpdate.intervals,
            current_position: progressUpdate.current_position
        });
        return response.data;
    },

    resetProgress: async (videoId: number): Promise<ApiResponse<{ progress: Progress }>> => {
        const response = await api.delete(`/progress/${videoId}`);
        return response.data;
    },
};

export default api;