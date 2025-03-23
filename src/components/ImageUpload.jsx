import { useRef, useState } from 'react';
import useFileUpload from '../hooks/useFileUpload';
import { toast } from 'react-hot-toast';

const ImageUpload = ({ 
  onUpload, 
  maxSize = 5 * 1024 * 1024, // 5MB default
  className = '',
  acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
  aspectRatio = 16/9,
  showPreview = true,
}) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const { uploadProgress, isUploading, error, validateFile, uploadFile, reset } = useFileUpload();

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateFile(file, { maxSize, allowedTypes: acceptedTypes });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload file
      await uploadFile(onUpload, file);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(err.message);
      reset();
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      validateFile(file, { maxSize, allowedTypes: acceptedTypes });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload file
      await uploadFile(onUpload, file);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error(err.message);
      reset();
      setPreview(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div 
      className={`relative ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`
          cursor-pointer border-2 border-dashed border-gray-300 rounded-lg
          transition-all duration-200 ease-in-out
          ${isUploading ? 'opacity-50' : 'hover:border-blue-500'}
          flex flex-col items-center justify-center p-4
          ${preview ? 'bg-gray-100' : 'bg-gray-50'}
        `}
        style={{ aspectRatio }}
      >
        {showPreview && preview ? (
          <img 
            src={preview} 
            alt="Preview" 
            className="max-h-full w-auto object-contain rounded"
          />
        ) : (
          <div className="text-center">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="mt-1 text-sm text-gray-500">
              Click or drag image to upload
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {Math.floor(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="mb-2">Uploading... {uploadProgress}%</div>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-200 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload; 