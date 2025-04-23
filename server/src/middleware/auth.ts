// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/authUtils';

/**
 * Middleware to protect routes that require authentication
 */
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
    // Get the token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify the token
    const user = verifyAccessToken(token);
    if (!user) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Attach the user to the request object
    req.user = user;

    // Continue to the next middleware or route handler
    next();
}

/**
 * Optional authentication middleware
 * Will attach user to request if token is valid, but won't reject request if not
 */
export function optionalAuthenticateUser(req: Request, res: Response, next: NextFunction) {
    // Get the token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format

    if (token) {
        // Verify the token
        const user = verifyAccessToken(token);
        if (user) {
            // Attach the user to the request object
            req.user = user;
        }
    }

    // Continue to the next middleware or route handler regardless of token validity
    next();
}