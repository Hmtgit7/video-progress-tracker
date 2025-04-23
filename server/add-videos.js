// add-videos.js
const { Pool } = require('pg');

// Database connection configuration - adjust based on your .env settings
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'video_progress_tracker',
    password: 'Psql@13443', // Replace with your actual password if different
    port: 5432,
});

async function addVideos() {
    try {
        // Insert sample videos
        await pool.query(`
      INSERT INTO videos (title, description, url, duration)
      VALUES 
        ('Introduction to JavaScript', 'Learn the basics of JavaScript programming language including variables, functions, and control flow', 
         'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 600),
        
        ('Advanced React Hooks', 'Deep dive into React hooks and custom hook patterns for state management', 
         'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 900),
        
        ('Building REST APIs with Node.js', 'Learn how to build robust REST APIs using Node.js and Express', 
         'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 1200),
         
        ('CSS Grid & Flexbox Fundamentals', 'Master modern CSS layout techniques with Grid and Flexbox',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 750),
         
        ('Git & GitHub for Beginners', 'Learn version control and collaboration using Git and GitHub',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 840),
         
        ('Introduction to TypeScript', 'Learn the basics of TypeScript and how it improves JavaScript development',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 720),
         
        ('Responsive Web Design', 'Create websites that look great on any device using responsive design principles',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 540),
         
        ('JavaScript ES6+ Features', 'Explore modern JavaScript features including arrow functions, destructuring, and more',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 660),
         
        ('Web Accessibility Fundamentals', 'Learn how to make your websites accessible to everyone',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', 480),
         
        ('React State Management with Redux', 'Master global state management in React applications using Redux',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 1080),
         
        ('Full Stack Development with MERN', 'Build complete web applications with MongoDB, Express, React, and Node.js',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4', 1260),
         
        ('Docker for Web Developers', 'Learn how to containerize your web applications with Docker',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4', 810),
         
        ('GraphQL API Development', 'Build efficient APIs using GraphQL instead of traditional REST',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4', 930),
         
        ('CSS Animation and Transitions', 'Create engaging user interfaces with CSS animations',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 570),
         
        ('Progressive Web Apps (PWA)', 'Build web applications that work offline and load instantly',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 690)
      ON CONFLICT DO NOTHING;
    `);

        console.log('Videos added successfully!');
    } catch (error) {
        console.error('Error adding videos:', error);
    } finally {
        pool.end();
    }
}

addVideos();