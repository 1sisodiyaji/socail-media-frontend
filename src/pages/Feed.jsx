import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { postService, userService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import { Heart } from 'lucide-react';
const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const observer = useRef();

  // Get current user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await userService.getMyProfile();
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  // Load posts
  const loadPosts = useCallback(async () => {
    try {
      const response = await postService.getAllPosts({ page });
      setPosts(prev => [...prev, ...response.posts]);
      setHasMore(response.hasMore);
      setError(null);
    } catch (error) {
      setError('Failed to load posts. Please try again later.');
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Infinite scroll
  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const handleLike = async (postId) => {
    try {
      await postService.toggleLike(postId);
      setPosts(prev =>
        prev.map(post => {
          if (post._id === postId) {
            const isLiked = post.likes.includes(currentUser._id);
            return {
              ...post,
              likes: isLiked
                ? post.likes.filter(id => id !== currentUser._id)
                : [...post.likes, currentUser._id]
            };
          }
          return post;
        })
      );
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                ref={index === posts.length - 1 ? lastPostElementRef : null}
                className="bg-black rounded-xl shadow-lg overflow-hidden border border-zinc-800"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center space-x-3">
                  <Link to={`/profile/${post.userId._id}`}>
                    <img
                      src={post.userId.profilePicture || 'https://png.pngtree.com/png-clipart/20240909/original/pngtree-misleading-dating-profile-photo-flat-color-png-image_15970390.png'}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </Link>
                  <div>
                    <Link
                      to={`/profile/${post.userId._id}`}
                      className="font-medium text-white hover:text-red-500 transition-colors"
                    >
                      {post.userId.username}
                    </Link>
                    <p className="text-sm text-gray-400">
                      {format(new Date(post.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4 border-t border-zinc-800">
                  <p className="text-white whitespace-pre-wrap">{post.text}</p>
                </div>

                {/* Post Images */}
                {post.images?.length > 0 && (
                  <div className="flex gap-4 overflow-x-scroll p-4">
                    {post.images.map((image, i) => (
                      <img
                        key={i}
                        src={`http://localhost:8081${image}`}
                        alt={`Post ${i + 1}`}
                        className="w-full h-48 object-contain rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="p-4 border-t border-zinc-800 flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center space-x-2 text-gray-400 hover:text-red-500 cursor-pointer`}
                  >
                    <span><Heart className={`w-4 h-4 ${
                      post.likes.includes(currentUser?._id)
                        ? 'text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                    } transition-colors cursor-pointer`} /></span>
                    <span>{post.likes.length}</span>
                  </button>
                  <Link
                    to={`/post/${post._id}`}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <span>💬</span>
                    <span>{post.commentCount || 0}</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && <LoadingSpinner />}
        </div>
      )}
    </div>
  );
};

export default Feed; 