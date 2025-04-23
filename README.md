# Video Progress Tracker

A full-stack web application that tracks your progress while watching educational videos. The app provides accurate tracking of which portions of videos you've watched, ensuring your progress reflects your actual learning journey.

## Features

- **Precise Video Progress Tracking:** Tracks exactly which portions of videos you've watched
- **Smart Resume:** Automatically resumes from where you left off
- **Progress Visualization:** Visual indicators for video completion status
- **Robust Authentication:** JWT-based authentication with refresh tokens
- **Responsive Design:** Works on all device sizes

## Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- React Router
- ReactPlayer for video playback
- Axios for API requests

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL database
- JWT for authentication
- RESTful API architecture

## Prerequisites

To run this application locally, you need to have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- Docker and Docker Compose (for containerized setup)

## Installation and Setup

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/Hmtgit7/video-progress-tracker.git
   cd video-progress-tracker
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   # Database Configuration
   PGHOST=postgres
   PGUSER=postgres
   PGDATABASE=video_progress_tracker
   PGPASSWORD=postgres
   PGPORT=5432

   # JWT Configuration
   JWT_SECRET=uWxz9Kq7BpTfA5mJ2eD8sR4vL6yH3nG1
   JWT_EXPIRES_IN=1d
   JWT_REFRESH_SECRET=cX7bN2pE6tY9vR4zK3mS8wQ1aD5gF0jH
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Other Configuration
   NODE_ENV=production
   ```

3. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Manual Setup

#### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory:
   ```
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   PGHOST=localhost
   PGUSER=postgres
   PGDATABASE=video_progress_tracker
   PGPASSWORD=postgres
   PGPORT=5432

   # JWT Configuration
   JWT_SECRET=uWxz9Kq7BpTfA5mJ2eD8sR4vL6yH3nG1
   JWT_EXPIRES_IN=1d
   JWT_REFRESH_SECRET=cX7bN2pE6tY9vR4zK3mS8wQ1aD5gF0jH
   JWT_REFRESH_EXPIRES_IN=7d

   # CORS Configuration
   CLIENT_URL=http://localhost:3000
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Seed the database (optional):
   ```bash
   npm run db:seed
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the client directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. The application will be available at http://localhost:3000

## Project Structure

```
video-progress-tracker/
├── client/                   # Frontend React application
│   ├── public/               # Static files
│   ├── src/                  # Source files
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts (auth, etc.)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── types/            # TypeScript type definitions
│   │   └── ...
│   ├── Dockerfile            # Frontend Docker config
│   └── nginx.conf            # Nginx config for production
│
├── server/                   # Backend Node.js API
│   ├── src/                  # Source files
│   │   ├── controllers/      # Route controllers
│   │   ├── db/               # Database configuration
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Helper utilities
│   │   └── ...
│   ├── Dockerfile            # Backend Docker config
│   └── ...
│
├── docker-compose.yml        # Docker Compose configuration
└── README.md                 # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user information

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get a video by ID

### Progress
- `GET /api/progress` - Get all user's progress
- `GET /api/progress/:videoId` - Get user's progress for a specific video
- `POST /api/progress/:videoId` - Update user's progress for a video
- `DELETE /api/progress/:videoId` - Reset user's progress for a video

## Usage

1. Register an account or log in
2. Browse the available video library
3. Click on a video to start watching
4. Your progress is automatically tracked as you watch
5. You can resume watching from where you left off
6. Videos are marked as completed when you reach 95% or more

## Docker Commands

- Start all services: `docker-compose up -d`
- Stop all services: `docker-compose down`
- View logs: `docker-compose logs -f`
- Rebuild containers: `docker-compose build`

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

- GitHub: [Hmtgit7](https://github.com/Hmtgit7)

## Acknowledgements

- [ReactPlayer](https://github.com/cookpete/react-player) for video playback
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [JWT](https://jwt.io/) for authentication
- [PostgreSQL](https://www.postgresql.org/) for database