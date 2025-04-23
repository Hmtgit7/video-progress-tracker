// server/src/types/index.ts
// User-related types
export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}

export interface UserPublic {
    id: number;
    username: string;
    email: string;
}

export interface UserLogin {
    email: string;
    password: string;
}

export interface UserRegister extends UserLogin {
    username: string;
}

// Video-related types
export interface Video {
    id: number;
    title: string;
    description: string | null;
    url: string;
    duration: number;
    created_at: Date;
    updated_at: Date;
}

// Progress-related types
export interface TimeInterval {
    start: number;
    end: number;
}

export interface UserProgress {
    id: number;
    user_id: number;
    video_id: number;
    last_position: number;
    watched_intervals: TimeInterval[];
    progress_percentage: number;
    created_at: Date;
    updated_at: Date;
}

export interface ProgressUpdate {
    video_id: number;
    intervals: TimeInterval[];
    current_position?: number;
}

// Authentication-related types
export interface TokenPayload {
    userId: number;
    username: string;
    email: string;
}

export interface AuthResponse {
    user: UserPublic;
    accessToken: string;
    refreshToken?: string;
}

// Express request with custom properties
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}