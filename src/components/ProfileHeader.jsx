import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProfileHeader = ({ user }) => {
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-48 w-full bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm"></div>
      </div>

      {/* Profile Info */}
      <div className="relative px-4 sm:px-6 lg:px-8 pb-8">
        <div className="sm:flex sm:items-end sm:space-x-5">
          <div className="relative -mt-16 flex">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={user.avatar || 'https://via.placeholder.com/128'}
              alt={user.username}
              className="h-32 w-32 rounded-full ring-4 ring-gray-900 bg-gray-800 object-cover"
            />
          </div>
          <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-white truncate">{user.username}</h1>
              <p className="text-sm text-gray-400 mt-1">{user.email}</p>
            </div>
            <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Link
                to="/profile/edit"
                className="inline-flex justify-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-8 border-t border-gray-700 pt-8">
          <div className="text-center">
            <span className="text-2xl font-bold text-white">{user.posts?.length || 0}</span>
            <span className="block text-sm font-medium text-gray-400">Posts</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-white">{user.followers?.length || 0}</span>
            <span className="block text-sm font-medium text-gray-400">Followers</span>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-white">{user.following?.length || 0}</span>
            <span className="block text-sm font-medium text-gray-400">Following</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 