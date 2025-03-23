import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // TODO: Implement actual API call
        // Mock data
        const mockProfile = {
          id: '1',
          username: username || 'user',
          avatar: 'https://via.placeholder.com/150',
          bio: 'This is a sample bio. Welcome to my profile!',
          followers: 100,
          following: 50,
          posts: 25,
        };

        const mockPosts = [
          {
            id: '1',
            content: 'This is a sample post!',
            likes: 10,
            comments: 5,
            createdAt: new Date().toISOString(),
          },
          // Add more mock posts as needed
        ];

        setProfile(mockProfile);
        setPosts(mockPosts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-300">User not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-xl shadow-red-900/10 p-6 border border-red-900/10"
      >
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-6">
          {profile.avatar && (
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={profile.avatar}
              alt={profile.username}
              className="w-32 h-32 rounded-full ring-4 ring-red-500/20"
            />
          )}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
              {profile.username}
            </h1>
            {profile.bio && (
              <p className="text-gray-400 mt-2">{profile.bio}</p>
            )}
            <div className="flex justify-center md:justify-start space-x-8 mt-4">
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <div className="font-bold text-white">{profile.posts}</div>
                <div className="text-gray-400 text-sm">Posts</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <div className="font-bold text-white">{profile.followers}</div>
                <div className="text-gray-400 text-sm">Followers</div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                <div className="font-bold text-white">{profile.following}</div>
                <div className="text-gray-400 text-sm">Following</div>
              </motion.div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Edit Profile
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex space-x-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === 'posts'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === 'about'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
            }`}
            onClick={() => setActiveTab('about')}
          >
            About
          </motion.button>
        </nav>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'posts' ? (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {posts.map((post) => (
              <motion.div
                key={post.id}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-xl shadow-red-900/10 overflow-hidden border border-red-900/10"
              >
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <p className="text-gray-300 line-clamp-3">{post.content}</p>
                  <div className="mt-4 flex items-center justify-between text-gray-400 text-sm">
                    <div className="flex space-x-4">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{post.likes}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comments}</span>
                      </span>
                    </div>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-xl shadow-red-900/10 p-6 border border-red-900/10"
          >
            <h3 className="text-lg font-medium text-red-500 mb-4">About</h3>
            <div className="space-y-4">
              <p className="text-gray-300">{profile.bio}</p>
              {/* Add more profile information here */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile; 