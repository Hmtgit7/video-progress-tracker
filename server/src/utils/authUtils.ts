// server/src/utils/authUtils.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import { TokenPayload } from '../types';

/**
 * Generate an access token for a user
 */
export function generateAccessToken(payload: TokenPayload): string {
    const secret = process.env.JWT_SECRET || 'jwt_fallback_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    // Use explicit Buffer conversion for the secret
    return jwt.sign(
        payload,
        Buffer.from(secret, 'utf-8'),
        { expiresIn } as SignOptions
    );
}

/**
 * Generate a refresh token for a user
 */
export function generateRefreshToken(payload: TokenPayload): string {
    const secret = process.env.JWT_REFRESH_SECRET || 'jwt_refresh_fallback_secret';
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    // Use explicit Buffer conversion for the secret
    return jwt.sign(
        payload,
        Buffer.from(secret, 'utf-8'),
        { expiresIn } as SignOptions
    );
}

/**
 * Verify an access token and return the decoded payload
 */
export function verifyAccessToken(token: string): TokenPayload | null {
    try {
        const secret = process.env.JWT_SECRET || 'jwt_fallback_secret';
        return jwt.verify(token, Buffer.from(secret, 'utf-8')) as TokenPayload;
    } catch (error) {
        return null;
    }
}

/**
 * Verify a refresh token and return the decoded payload
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
    try {
        const secret = process.env.JWT_REFRESH_SECRET || 'jwt_refresh_fallback_secret';
        return jwt.verify(token, Buffer.from(secret, 'utf-8')) as TokenPayload;
    } catch (error) {
        return null;
    }
}