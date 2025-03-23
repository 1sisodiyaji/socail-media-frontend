import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { postService } from '../services/api';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await postService.getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      toast.error('Failed to load posts', {
        style: {
          background: '#1F2937',
          color: '#FFF',
          borderRadius: '0.5rem',
          border: '1px solid rgba(220, 38, 38, 0.1)',
        },
        iconTheme: {
          primary: '#EF4444',
          secondary: '#1F2937',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const totalFiles = selectedImages.length + files.length;

    if (totalFiles > 5) {
      toast.error('Maximum 5 images allowed', {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
      return;
    }

    if (totalSize > 10 * 1024 * 1024) { // 10MB total limit
      toast.error('Total image size should be less than 10MB', {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
      return;
    }

    const newImages = [];
    const newPreviews = [];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB per file limit
        toast.error(`Image ${file.name} is too large (max 5MB)`, {
          style: {
            background: '#1F2937',
            color: '#FFF',
          },
        });
        return;
      }

      newImages.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setSelectedImages(prev => [...prev, ...newImages]);
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (selectedImages.length === 0) {
      toast.error('Please add at least one image', {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
      return;
    }

    if (!newPost.trim()) {
      toast.error('Please add some content', {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
      return;
    }

    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('text', newPost.trim());
      
      // Append each image to formData
      selectedImages.forEach(image => {
        formData.append('images', image);
      });

      const createdPost = await postService.createPost(formData);
      setPosts([createdPost, ...posts]);
      setNewPost('');
      setSelectedImages([]);
      setImagePreviews([]);
      
      toast.success('Post created successfully!', {
        style: {
          background: '#1F2937',
          color: '#FFF',
          borderRadius: '0.5rem',
          border: '1px solid rgba(16, 185, 129, 0.1)',
        },
        iconTheme: {
          primary: '#10B981',
          secondary: '#1F2937',
        },
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Failed to create post', {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await postService.likePost(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post
      ));
    } catch (error) {
      toast.error('Failed to like post', {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
    }
  };

  const handleComment = (postId) => {
    // TODO: Implement comment functionality
    console.log('Comment button clicked for post:', postId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Create Post Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-xl shadow-red-900/10 p-6 border border-red-900/10"
      >
        <div className="space-y-4">
          <textarea
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
            rows={3}
          />
          
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-40 rounded-lg object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-gray-400 hover:text-red-500 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Add Images</span>
              {selectedImages.length > 0 && (
                <span className="text-sm">({selectedImages.length}/5)</span>
              )}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreatePost}
              disabled={posting || (!newPost.trim() && selectedImages.length === 0)}
              className={`px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${posting || (!newPost.trim() && selectedImages.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {posting ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Posting...</span>
                </div>
              ) : (
                'Post'
              )}
            </motion.button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>
      </motion.div>

      {/* Posts Feed */}
      <div className="space-y-6">
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-xl shadow-red-900/10 p-6 border border-red-900/10"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-medium text-lg">
                  {post.author?.username?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="font-medium text-white">{post.author?.username || 'Anonymous'}</div>
                  <div className="text-gray-400 text-sm">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">{post.text}</p>
              
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {post.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`http://localhost:8081${image}`}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-40 rounded-lg object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center space-x-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center space-x-2 ${post.isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors duration-200`}
                >
                  <svg
                    className="w-6 h-6"
                    fill={post.isLiked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="font-medium">{post.likes?.length || 0}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleComment(post._id)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="font-medium">{post.comments?.length || 0}</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Feed; 