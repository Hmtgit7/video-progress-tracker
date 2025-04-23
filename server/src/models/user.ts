// server/src/models/user.ts
import pool from '../db';
import { User, UserPublic, UserRegister } from '../types';
import bcrypt from 'bcrypt';

export async function findUserById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);

    return result.rowCount ? result.rows[0] : null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    return result.rowCount ? result.rows[0] : null;
}

export async function createUser(userData: UserRegister): Promise<User> {
    // Hash the password
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const query = `
    INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

    const values = [userData.username, userData.email, passwordHash];
    const result = await pool.query(query, values);

    return result.rows[0];
}

export async function verifyUserPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
}

export function sanitizeUser(user: User): UserPublic {
    const { id, username, email } = user;
    return { id, username, email };
}