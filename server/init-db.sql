# init-db.sql
-- This script is used to initialize the database schema 
-- and seed it with some initial data when running in Docker
-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Modify the user_progress table to use DECIMAL for last_position
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    last_position INTEGER DEFAULT 0,
    -- Using INTEGER as per current implementation
    watched_intervals JSONB DEFAULT '[]',
    progress_percentage DECIMAL(5, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, video_id)
);
-- Insert sample videos if none exist
INSERT INTO videos (title, description, url, duration)
SELECT 'Introduction to JavaScript',
    'Learn the basics of JavaScript programming language',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    596
WHERE NOT EXISTS (
        SELECT 1
        FROM videos
        WHERE title = 'Introduction to JavaScript'
    );
INSERT INTO videos (title, description, url, duration)
SELECT 'Advanced React Hooks',
    'Deep dive into React hooks and custom hook patterns',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    653
WHERE NOT EXISTS (
        SELECT 1
        FROM videos
        WHERE title = 'Advanced React Hooks'
    );
INSERT INTO videos (title, description, url, duration)
SELECT 'Building REST APIs with Node.js',
    'Learn how to build robust REST APIs using Node.js and Express',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    734
WHERE NOT EXISTS (
        SELECT 1
        FROM videos
        WHERE title = 'Building REST APIs with Node.js'
    );