import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const UnauthenticatedView = () => {
    const location = useLocation();

    // Encode the current URL to return after login
    const returnTo = encodeURIComponent(location.pathname);

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg shadow-inner">
            <div className="text-center mb-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-primary-500 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h3>
                <p className="text-gray-600 mb-4">
                    Please sign in to watch videos and track your learning progress.
                </p>
            </div>

            <div className="flex space-x-4">
                <Link
                    to={`/login?returnTo=${returnTo}`}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                    Sign In
                </Link>
                <Link
                    to="/register"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    Create Account
                </Link>
            </div>
        </div>
    );
};

export default UnauthenticatedView;