import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostForm from './PostForm';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Modal from './Modal';

const UserPosts = ({ posts, onEditPost, onDeletePost, isLoading }) => {
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = async (formData, postId) => {
    setIsSubmitting(true);
    try {
      await onEditPost(formData, postId);
      setEditingPost(null);
    } catch (error) {
      console.error('Error editing post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    setIsSubmitting(true);
    try {
      await onDeletePost(postId);
      setDeletingPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No posts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {posts.map((post) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 backdrop-blur-sm"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {post.images.map((image, index) => (
                  <img
                    key={index}
                    src={`http://localhost:8081${image}`}
                    alt={`Post ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
              <p className="text-gray-300">{post.text}</p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditingPost(post)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeletingPost(post)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600/80 rounded-lg hover:bg-red-600 transition-all duration-200"
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Edit Post Modal */}
      <Modal
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        title="Edit Post"
      >
        {editingPost && (
          <PostForm
            initialData={editingPost}
            onSubmit={(formData) => handleEdit(formData, editingPost._id)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingPost}
        onClose={() => setDeletingPost(null)}
        onConfirm={() => handleDelete(deletingPost?._id)}
        isDeleting={isSubmitting}
      />
    </div>
  );
};

export default UserPosts; 