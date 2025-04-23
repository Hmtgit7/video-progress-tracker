// client/src/contexts/AuthContext.tsx - Improved auth persistence
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';

interface AuthContextType {
    auth: AuthState;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    refreshTokens: () => Promise<boolean>;
    isAuthInitialized: boolean; // Added to track initial auth loading
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [auth, setAuth] = useState<AuthState>({
        user: null,
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        isAuthenticated: Boolean(localStorage.getItem('accessToken')),
        isLoading: true,
        error: null,
    });
    const [isAuthInitialized, setIsAuthInitialized] = useState<boolean>(false);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            if (auth.accessToken) {
                try {
                    console.log('Getting current user with existing token');
                    const { user } = await authAPI.getCurrentUser();
                    setAuth(prev => ({
                        ...prev,
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    }));
                } catch (error) {
                    console.log('Token invalid, trying to refresh');
                    // If token is invalid, try to refresh
                    const refreshed = await refreshTokens();
                    if (!refreshed) {
                        // If refresh fails, log out
                        console.log('Refresh failed, logging out');
                        logout();
                    }
                } finally {
                    setIsAuthInitialized(true);
                }
            } else {
                setAuth(prev => ({ ...prev, isLoading: false }));
                setIsAuthInitialized(true);
            }
        };

        loadUser();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            setAuth(prev => ({ ...prev, isLoading: true, error: null }));
            const { user, accessToken, refreshToken } = await authAPI.login(credentials);

            console.log('Login successful, storing tokens');

            // Store tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            setAuth({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error: any) {
            console.error('Login failed:', error);
            setAuth(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Login failed',
            }));
            throw error;
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        try {
            setAuth(prev => ({ ...prev, isLoading: true, error: null }));
            const { user, accessToken, refreshToken } = await authAPI.register(credentials);

            console.log('Registration successful, storing tokens');

            // Store tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            setAuth({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error: any) {
            console.error('Registration failed:', error);
            setAuth(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || 'Registration failed',
            }));
            throw error;
        }
    };

    const logout = () => {
        console.log('Logging out, removing tokens');

        // Remove tokens from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        setAuth({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    };

    const refreshTokens = async (): Promise<boolean> => {
        if (!auth.refreshToken) return false;

        try {
            console.log('Attempting to refresh tokens');
            const { accessToken, refreshToken } = await authAPI.refreshToken(auth.refreshToken);

            console.log('Token refresh successful, storing new tokens');

            // Store new tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Get current user with new token
            const { user } = await authAPI.getCurrentUser();

            setAuth({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                auth,
                login,
                register,
                logout,
                refreshTokens,
                isAuthInitialized
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};