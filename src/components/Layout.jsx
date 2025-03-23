import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const isAuthenticated = true; // TODO: Replace with actual auth state

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-black/80 sticky top-0 z-50 border-b border-red-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex-shrink-0 flex items-center space-x-2 group"
              >
                <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-800 transform transition-transform group-hover:scale-105">RedFlag</span>
              </Link>
            </div>

            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <Link
                  to="/create"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-800 rounded-lg hover:from-red-700 hover:to-red-900 transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Create Post
                </Link>
                <Link
                  to="/profile"
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 rounded-full hover:bg-gray-800"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              </div>
            )}

            {!isAuthenticated && (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg transition-colors duration-200 hover:bg-gray-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-800 rounded-lg hover:from-red-700 hover:to-red-900 transform transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
      </main>
    </div>
  );
};

export default Layout; 