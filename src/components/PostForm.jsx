import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const PostForm = ({ initialData, onSubmit, isSubmitting }) => {
  const [text, setText] = useState(initialData?.text || '');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(
    initialData?.images ? initialData.images.map(img => `http://localhost:8081${img}`) : []
  );
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const totalFiles = selectedImages.length + files.length;

    // Check total number of images
    if (totalFiles > 5) {
      toast.error(`You can only upload up to 5 images (${5 - selectedImages.length} remaining)`, {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
      return;
    }

    // Check total size of all images
    if (totalSize > 10 * 1024 * 1024) { // 10MB total limit
      toast.error('Total image size should be less than 10MB', {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
      return;
    }

    // Check individual file sizes
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(
        oversizedFiles.length === 1
          ? `Image ${oversizedFiles[0].name} is too large (max 5MB)`
          : `${oversizedFiles.length} images are too large (max 5MB each)`,
        {
          style: {
            background: '#1F2937',
            color: '#FFF',
          },
        }
      );
      return;
    }

    // Process valid files
    const newImages = [];
    const newPreviews = [];
    let loadedPreviews = 0;

    files.forEach(file => {
      newImages.push(file);
      const reader = new FileReader();
      
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        loadedPreviews++;
        
        // Only update state when all previews are loaded
        if (loadedPreviews === files.length) {
          setSelectedImages(prev => [...prev, ...newImages]);
          setImagePreviews(prev => [...prev, ...newPreviews]);
          
          // Show success message
          toast.success(
            files.length === 1
              ? 'Image added successfully'
              : `${files.length} images added successfully`,
            {
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
            }
          );
        }
      };

      reader.onerror = () => {
        toast.error(`Failed to load image: ${file.name}`, {
          style: {
            background: '#1F2937',
            color: '#FFF',
          },
        });
      };

      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedImages.length === 0 && !initialData?.images?.length) {
      toast.error('Please add at least one image', {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
      return;
    }

    if (!text.trim()) {
      toast.error('Please add some content', {
        style: {
          background: '#1F2937',
          color: '#FFF',
        },
      });
      return;
    }

    const formData = new FormData();
    formData.append('text', text.trim());
    
    // Append each new image to formData
    selectedImages.forEach(image => {
      formData.append('images', image);
    });

    // If editing and some original images are kept
    if (initialData?.images) {
      const keptOriginalImages = initialData.images
        .filter((_, index) => imagePreviews.includes(`http://localhost:8081${initialData.images[index]}`));
      
      keptOriginalImages.forEach(image => {
        formData.append('keepImages', image);
      });
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="text"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          What's on your mind?
        </label>
        <textarea
          id="text"
          rows={4}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
          placeholder="Share your thoughts..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Add images (1-5 images required)
        </label>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-lg bg-gray-800/30 transition-colors hover:border-red-500/50"
        >
          <div className="space-y-1 text-center">
            {imagePreviews.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 rounded-lg object-cover"
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </motion.button>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-400 mt-2">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-red-500 hover:text-red-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                  >
                    <span>Upload images</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      ref={fileInputRef}
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageSelect}
                      multiple
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, GIF up to 5MB each (max 5 images)
                </p>
              </>
            )}
            {imagePreviews.length > 0 && imagePreviews.length < 5 && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 text-gray-400 hover:text-red-500 transition-colors duration-200 flex items-center space-x-2 mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add More Images ({imagePreviews.length}/5)</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      <div className="flex justify-end space-x-4">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting || !text.trim() || (selectedImages.length === 0 && !initialData?.images?.length)}
          className={`px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 rounded-lg transition-all duration-200 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
            (isSubmitting || !text.trim() || (selectedImages.length === 0 && !initialData?.images?.length)) && 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {initialData ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            initialData ? 'Update Post' : 'Create Post'
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default PostForm; 