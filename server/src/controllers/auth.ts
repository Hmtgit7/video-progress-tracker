// server/src/controllers/auth.ts
import { Request, Response } from 'express';
import { findUserByEmail, createUser, verifyUserPassword, sanitizeUser, findUserById } from '../models/user';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/authUtils';
import { UserLogin, UserRegister } from '../types';

export async function register(req: Request, res: Response) {
    try {
        const userData: UserRegister = req.body;

        // Check if required fields are present
        if (!userData.username || !userData.email || !userData.password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        // Validate username (alphanumeric and max 8 characters)
        if (!/^[a-zA-Z0-9]{1,8}$/.test(userData.username)) {
            return res.status(400).json({
                message: 'Username must be alphanumeric and maximum 8 characters long'
            });
        }

        // Validate email format
        if (!/\S+@\S+\.\S+/.test(userData.email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if user with email already exists
        const existingUser = await findUserByEmail(userData.email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Create the new user
        const newUser = await createUser(userData);
        const sanitizedUser = sanitizeUser(newUser);

        // Generate tokens
        const tokenPayload = {
            userId: sanitizedUser.id,
            username: sanitizedUser.username,
            email: sanitizedUser.email
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Send response
        res.status(201).json({
            message: 'User registered successfully',
            user: sanitizedUser,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password }: UserLogin = req.body;

        // Check if required fields are present
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find the user by email
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify the password
        const isPasswordValid = await verifyUserPassword(user, password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate tokens
        const sanitizedUser = sanitizeUser(user);
        const tokenPayload = {
            userId: sanitizedUser.id,
            username: sanitizedUser.username,
            email: sanitizedUser.email
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Send response
        res.status(200).json({
            message: 'Login successful',
            user: sanitizedUser,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
}

export async function refreshToken(req: Request, res: Response) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        // Verify the refresh token
        const payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        // Check if the user still exists
        const user = await findUserById(payload.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate new tokens
        const sanitizedUser = sanitizeUser(user);
        const tokenPayload = {
            userId: sanitizedUser.id,
            username: sanitizedUser.username,
            email: sanitizedUser.email
        };

        const accessToken = generateAccessToken(tokenPayload);
        const newRefreshToken = generateRefreshToken(tokenPayload);

        // Send response
        res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ message: 'Error refreshing token' });
    }
}

export async function getCurrentUser(req: Request, res: Response) {
    try {
        // User payload is attached by the authenticate middleware
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Get user from database to ensure most up-to-date info
        const user = await findUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return sanitized user data
        res.status(200).json({
            user: sanitizeUser(user)
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Error retrieving user information' });
    }
}