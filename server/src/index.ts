import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import runMigrations from './db/migrations';

// Import routes
import authRoutes from './routes/auth';
import videoRoutes from './routes/video';
import progressRoutes from './routes/progress';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Run database migrations on startup
if (process.env.NODE_ENV !== 'test') {
    runMigrations().catch(err => {
        console.error('Failed to run migrations:', err);
        process.exit(1);
    });
}

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Logger
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Video Progress Tracker API' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});