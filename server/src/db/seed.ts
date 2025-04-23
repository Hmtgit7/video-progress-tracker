// server/src/db/seed.ts
import pool from './index';
import bcrypt from 'bcrypt';

/**
 * Seed the database with initial data
 */
async function seedDatabase() {
    const client = await pool.connect();

    try {
        // Start transaction
        await client.query('BEGIN');

        // Create a test user
        const passwordHash = await bcrypt.hash('password123', 10);
        const userResult = await client.query(`
      INSERT INTO users (username, email, password_hash)
      VALUES ('testuser', 'test@example.com', $1)
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [passwordHash]);

        const userId = userResult.rows[0]?.id;

        // Seed some test videos
        const videos = [
            {
                title: 'Introduction to JavaScript',
                description: 'Learn the basics of JavaScript programming language',
                url: 'https://example.com/videos/intro-to-js.mp4',
                duration: 600 // 10 minutes
            },
            {
                title: 'Advanced React Hooks',
                description: 'Deep dive into React hooks and custom hook patterns',
                url: 'https://example.com/videos/advanced-react-hooks.mp4',
                duration: 900 // 15 minutes
            },
            {
                title: 'Building REST APIs with Node.js',
                description: 'Learn how to build robust REST APIs using Node.js and Express',
                url: 'https://example.com/videos/nodejs-rest-apis.mp4',
                duration: 1200 // 20 minutes
            }
        ];

        for (const video of videos) {
            await client.query(`
        INSERT INTO videos (title, description, url, duration)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING;
      `, [video.title, video.description, video.url, video.duration]);
        }

        // Commit transaction
        await client.query('COMMIT');

        console.log('Database seeding completed successfully');
    } catch (err) {
        // Rollback transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error seeding database:', err);
        throw err;
    } finally {
        // Release client back to the pool
        client.release();
    }
}

// Run seeds if this file is executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export default seedDatabase;