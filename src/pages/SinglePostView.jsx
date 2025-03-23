import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { postService, userService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import { Delete, Heart, PencilIcon, Trash2Icon } from 'lucide-react';

const SinglePostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postData, commentsData, userData] = await Promise.all([
          postService.getPost(id),
          postService.getComments(id),
          userService.getMyProfile()
        ]);
        setPost(postData);
        setComments(commentsData);
        setCurrentUser(userData);
      } catch (error) {
        setError(error.message);
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleLike = async () => {
    try {
      await postService.toggleLike(id);
      setPost(prev => ({
        ...prev,
        likes: prev.likes.includes(currentUser._id)
          ? prev.likes.filter(id => id !== currentUser._id)
          : [...prev.likes, currentUser._id]
      }));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      await postService.toggleCommentLike(id, commentId);
      setComments(prev => prev.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            likes: comment.likes.includes(currentUser._id)
              ? comment.likes.filter(id => id !== currentUser._id)
              : [...comment.likes, currentUser._id]
          };
        }
        return comment;
      }));
    } catch (error) {
      toast.error('Failed to like comment');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await postService.addComment(id, { text: newComment });
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      toast.success('Comment added successfully!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await postService.deleteComment(id, commentId);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      toast.success('Comment deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await postService.deletePost(id);
      toast.success('Post deleted successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!post) return <div className="text-center">Post not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto p-4"
    >
      {/* Post */}
      <div className="bg-zinc-900 rounded-xl shadow-lg overflow-hidden mb-6">
        {/* Post Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
                className="font-medium text-white hover:text-rose-500 transition-colors"
              >
                {post.userId.username}
              </Link>
              <p className="text-sm text-gray-400">
                {format(new Date(post.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          {currentUser?._id === post.userId._id && (
            <div className="flex space-x-2">
              <Link
                to={`/edit-post/${post._id}`}
                className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <PencilIcon className="w-4 h-4 " />
              </Link>
              <button
                onClick={handleDeletePost}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
              <Trash2Icon className="w-4 h-4 " />
              </button>
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="p-4 border-t border-gray-700">
          <p className="text-white whitespace-pre-wrap">{post.text}</p>
        </div>

        {/* Post Images */}
        {post.images?.length > 0 && (
          <div className="flex gap-4 overflow-x-scroll p-4">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={`http://localhost:8081${image}`}
                alt={`Post ${index + 1}`}
                className="w-full h-48 object-contain rounded-lg"
              />
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="p-4 border-t border-gray-700 flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 ${
              post.likes.includes(currentUser?._id)
                ? 'text-rose-500'
                : 'text-gray-400 hover:text-rose-500'
            } transition-colors`}
          >
            <span>❤️</span>
            <span>{post.likes.length}</span>
          </button>
          <button
            onClick={() => document.getElementById('comment-input').focus()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <span>💬</span>
            <span>{comments.length}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-zinc-800 rounded-xl shadow-lg p-4">
        <form onSubmit={handleComment} className="mb-6">
          <textarea
            id="comment-input"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-4 py-3 bg-zinc-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none transition duration-200"
            rows="2"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className={`px-4 py-2 bg-rose-500 text-white rounded-lg font-medium transition-colors ${
                submitting || !newComment.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-rose-600'
              }`}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border-t border-zinc-700 py-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Link to={`/profile/${comment.userId._id}`}>
                    <img
                      src={comment.userId.profilePicture || 'https://png.pngtree.com/png-clipart/20240909/original/pngtree-misleading-dating-profile-photo-flat-color-png-image_15970390.png'}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-contain"
                    />
                  </Link>
                  <div>
                    <Link
                      to={`/profile/${comment.userId._id}`}
                      className="font-medium text-white hover:text-rose-500 transition-colors"
                    >
                      {comment.userId.username}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {currentUser?._id === comment.userId._id && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2Icon className="w-4 h-4 " />
                  </button>
                )}
              </div>
              <p className="text-white ml-11">{comment.text}</p>
              <div className="mt-2 ml-11">
                <button
                  onClick={() => handleCommentLike(comment._id)}
                  className={`flex items-center space-x-2 ${
                    comment.likes.includes(currentUser?._id)
                      ? 'text-rose-500'
                      : 'text-gray-400 hover:text-rose-500'
                  } transition-colors text-sm`}
                >
                  <span><Heart className={`w-4 h-4 ${
                    comment.likes.includes(currentUser?._id)
                      ? 'text-red-500'
                      : 'text-gray-400 hover:text-red-500'
                  } transition-colors cursor-pointer`} /></span>
                  <span>{comment.likes.length}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SinglePostView; 