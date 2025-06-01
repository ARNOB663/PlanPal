import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, X } from 'lucide-react';

interface PhotoUploadProps {
  onPhotosSelected: (files: File[]) => void;
  maxFiles?: number;
  selectedPhotos: string[];
  onPhotoRemove: (index: number) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  onPhotosSelected, 
  maxFiles = 5,
  selectedPhotos,
  onPhotoRemove
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter files to only accept images
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
    
    // Limit the number of files
    const limitedFiles = imageFiles.slice(0, maxFiles - selectedPhotos.length);
    
    if (limitedFiles.length > 0) {
      onPhotosSelected(limitedFiles);
    }
  }, [maxFiles, selectedPhotos.length, onPhotosSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: maxFiles - selectedPhotos.length,
    disabled: selectedPhotos.length >= maxFiles
  });

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}
          ${selectedPhotos.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Image size={32} className="mx-auto text-gray-400 mb-2" />
        {isDragActive ? (
          <p className="text-indigo-600">Drop your photos here</p>
        ) : (
          <div>
            <p className="text-gray-600">
              Drag & drop photos here, or click to select
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {selectedPhotos.length} of {maxFiles} photos selected
            </p>
          </div>
        )}
      </div>

      {selectedPhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {selectedPhotos.map((photo, index) => (
            <div key={index} className="relative group">
              <img 
                src={photo} 
                alt={`Selected photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => onPhotoRemove(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;