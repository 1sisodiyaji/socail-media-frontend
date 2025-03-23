import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchUsers from './SearchUsers';
import { motion, AnimatePresence } from 'framer-motion';
import PostForm from '../components/PostForm';
import { CircleFadingPlus, House, LogOutIcon, User2Icon } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-black border-b border-zinc-800 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16"> 
          <Link to="/" className="flex items-center"> 
            <span className="text-red-500 text-xl font-bold">RedFlag</span>
          </Link>
 
          <div className="flex-1 max-w-xl px-4">
            <SearchUsers />
          </div>
 
          <div className="flex items-center space-x-4">
            <div>
              {/* create post  */}
              <button onClick = {() => setShowCreatePost(true)} className="text-gray-300 hover:text-red-500 transition-colors p-2 cursor-pointer">
                <CircleFadingPlus className="w-6 h-6" />
              </button>
            </div>
            <Link
              to="/"
              className="text-gray-300 hover:text-red-500 transition-colors p-2 cursor-pointer"
            >
              <House className="w-6 h-6" />
            </Link>
            <Link
              to="/profile/me"
              className="text-gray-300 hover:text-red-500 transition-colors p-2 cursor-pointer"
            >
              <User2Icon className="w-6 h-6" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-red-500 transition-colors p-2 cursor-pointer"
            >
              <LogOutIcon className="w-6 h-6" />
            </button>
          </div>
          
      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCreatePost(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl"
            >
              <PostForm
                onSubmit={() => {
                  setShowCreatePost(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 