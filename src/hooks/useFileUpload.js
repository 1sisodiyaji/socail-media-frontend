import { useState, useCallback } from 'react';

const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = useCallback((file, options = {}) => {
    const {
      maxSize = 5 * 1024 * 1024, // Default 5MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
    } = options;

    if (!file) {
      throw new Error('No file selected');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Invalid file type. Allowed types: ${allowedTypes
          .map((type) => type.split('/')[1].toUpperCase())
          .join(', ')}`
      );
    }

    if (file.size > maxSize) {
      throw new Error(`File size too large. Maximum size is ${Math.floor(maxSize / 1024 / 1024)}MB`);
    }

    return true;
  }, []);

  const uploadFile = useCallback(async (uploadFunction, file, additionalData = {}) => {
    try {
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      const onProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      };

      const result = await uploadFunction(file, additionalData, onProgress);
      setUploadProgress(100);
      return result;
    } catch (err) {
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploadProgress(0);
    setIsUploading(false);
    setError(null);
  }, []);

  return {
    uploadProgress,
    isUploading,
    error,
    validateFile,
    uploadFile,
    reset,
  };
};

export default useFileUpload; 