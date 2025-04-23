// client/src/types/index.ts
export interface User {
    id: number;
    username: string;
    email: string;
}

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface Video {
    id: number;
    title: string;
    description: string | null;
    url: string;
    duration: number;
    created_at: string;
    updated_at: string;
}

export interface TimeInterval {
    start: number;
    end: number;
}

export interface Progress {
    id?: number;
    user_id?: number;
    video_id: number;
    last_position: number;
    watched_intervals: TimeInterval[];
    progress_percentage: number;
    created_at?: string;
    updated_at?: string;
}

export interface ProgressUpdate {
    videoId: number;
    intervals: TimeInterval[];
    current_position?: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    username: string;
}

export interface ApiResponse<T> {
    message?: string;
    [key: string]: any;
    data?: T;
}