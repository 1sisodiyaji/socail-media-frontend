import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { postService } from "../services";
import { X } from "lucide-react";

const MAX_IMAGES = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

const PostForm = ({ initialData, onSubmit, onClose, isEditing = false }) => {
  const [content, setContent] = useState(initialData?.content || "");
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const validateImage = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Invalid file type. Only JPEG, PNG, and GIF images are allowed.");
    }
    if (file.size > MAX_SIZE) {
      throw new Error("File size too large. Maximum size is 5MB.");
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = MAX_IMAGES - selectedImages.length;
    
    if (files.length > remainingSlots) {
      toast.error(`You can only add ${remainingSlots} more image(s).`);
      return;
    }

    const newImages = [];
    const newPreviews = [];
    let errorCount = 0;

    files.forEach((file) => {
      if (selectedImages.some((img) => img.name === file.name)) {
        toast.error(`"${file.name}" is already selected.`);
        return;
      }

      try {
        validateImage(file);
        newImages.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === newImages.length) {
            setSelectedImages((prev) => [...prev, ...newImages]);
            setPreviews((prev) => [...prev, ...newPreviews]);
            if (newImages.length > 0) {
              toast.success(`Added ${newImages.length} image(s) successfully.`);
            }
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        errorCount++;
        toast.error(error.message);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image removed successfully");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Please enter some content for your post");
      return;
    }

    if (selectedImages.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      
      // Append each image with a unique key
      selectedImages.forEach((image, index) => {
        formData.append(`images`, image);
      });

      if (isEditing) {
        await postService.updatePost(initialData.id, formData);
        toast.success("Post updated successfully!");
      } else {
        await postService.createPost(formData);
        toast.success("Post created successfully!");
      }

      // Clear form and close modal
      handleClose();
      
      if (onSubmit) {
        onSubmit();
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      const errorMessage = error.message || "Something went wrong. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clear form state
    setContent("");
    setSelectedImages([]);
    setPreviews([]);
    setError("");
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Call the onClose prop if provided
    if (onClose) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800 rounded-xl shadow-lg p-6 relative"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/30 text-red-400 p-3 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}
        
        <motion.button
          type="button"
          onClick={handleClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-4 p-1 rounded-full bg-gray-700 hover:bg-red-500 transition-colors duration-200"
        >
          <X className="w-5 h-5 text-white" />
        </motion.button>

        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 transition duration-200"
            rows="4"
          />
        </div>

        <AnimatePresence>
          {previews.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              {previews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <motion.button
                    type="button"
                    onClick={() => removeImage(index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={selectedImages.length >= MAX_IMAGES || isSubmitting}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            📷 Add Images ({selectedImages.length}/{MAX_IMAGES})
          </button>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept={ALLOWED_TYPES.join(',')}
            multiple 
            onChange={handleImageSelect} 
            className="hidden" 
          />

          <motion.button
            type="submit"
            disabled={isSubmitting || !content.trim() || selectedImages.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-rose-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-600 transition-colors duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isEditing ? "Updating..." : "Posting..."}
              </div>
            ) : (
              isEditing ? "Update Post" : "Create Post"
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default PostForm;
