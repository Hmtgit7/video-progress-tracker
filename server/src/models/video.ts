// server/src/models/video.ts
import pool from '../db';
import { Video } from '../types';

export async function getAllVideos(): Promise<Video[]> {
    const query = 'SELECT * FROM videos ORDER BY created_at DESC';
    const result = await pool.query(query);

    return result.rows;
}

export async function getVideoById(id: number): Promise<Video | null> {
    const query = 'SELECT * FROM videos WHERE id = $1';
    const result = await pool.query(query, [id]);

    return result.rowCount ? result.rows[0] : null;
}

export async function createVideo(videoData: Omit<Video, 'id' | 'created_at' | 'updated_at'>): Promise<Video> {
    const query = `
    INSERT INTO videos (title, description, url, duration)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

    const values = [videoData.title, videoData.description, videoData.url, videoData.duration];
    const result = await pool.query(query, values);

    return result.rows[0];
}

export async function updateVideo(
    id: number,
    videoData: Partial<Omit<Video, 'id' | 'created_at' | 'updated_at'>>
): Promise<Video | null> {
    // Start building the query
    let query = 'UPDATE videos SET updated_at = NOW()';
    const values: any[] = [];
    let paramIndex = 1;

    // Add each field that's present in the update data
    if (videoData.title !== undefined) {
        query += `, title = $${paramIndex}`;
        values.push(videoData.title);
        paramIndex++;
    }

    if (videoData.description !== undefined) {
        query += `, description = $${paramIndex}`;
        values.push(videoData.description);
        paramIndex++;
    }

    if (videoData.url !== undefined) {
        query += `, url = $${paramIndex}`;
        values.push(videoData.url);
        paramIndex++;
    }

    if (videoData.duration !== undefined) {
        query += `, duration = $${paramIndex}`;
        values.push(videoData.duration);
        paramIndex++;
    }

    // Add the WHERE clause and RETURNING
    query += ` WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);

    return result.rowCount ? result.rows[0] : null;
}

export async function deleteVideo(id: number): Promise<boolean> {
    const query = 'DELETE FROM videos WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
}