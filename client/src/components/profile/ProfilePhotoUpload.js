import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiCamera, FiX, FiCheck } from 'react-icons/fi';

const ProfilePhotoUpload = ({ currentPhoto, onPhotoUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    aspect: 1, // Square aspect ratio
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setIsModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Use original image dimensions to preserve full resolution
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 1.0); // Use maximum quality (1.0) to preserve resolution
    });
  };

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;

    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      if (!croppedBlob) {
        throw new Error('Failed to crop image');
      }
      
      const formData = new FormData();
      formData.append('profilePicture', croppedBlob, 'profile-photo.jpg');

      console.log('Uploading photo...');
      const response = await onPhotoUpdate(formData);
      console.log('Upload complete:', response);
      
      setIsModalOpen(false);
      setImageSrc(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to upload photo';
      console.error('Upload failed:', errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setImageSrc(null);
    setCompletedCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onImageLoad = (e) => {
    imgRef.current = e.currentTarget;
    
    // Set initial crop to center
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height);
    const x = (width - size) / 2;
    const y = (height - size) / 2;
    
    setCrop({
      unit: 'px',
      width: size,
      height: size,
      x: x,
      y: y,
      aspect: 1,
    });
  };

  return (
    <>
      <div className="relative inline-block group">
        {/* Profile Photo Display */}
        <div className="relative">
          <img
            src={currentPhoto || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
          
          {/* Camera Icon Overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-all transform hover:scale-110"
            title="Change profile photo"
          >
            <FiCamera className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Crop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Crop Profile Photo</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Crop Area */}
            <div className="p-6">
              <div className="flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
                {imageSrc && (
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    circularCrop
                  >
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Crop preview"
                      onLoad={onImageLoad}
                      className="max-h-[60vh] object-contain"
                    />
                  </ReactCrop>
                )}
              </div>
              
              <p className="text-sm text-gray-500 text-center mt-4">
                Drag to adjust the crop area. Your photo will be cropped to a circle.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={handleCancel}
                disabled={uploading}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                disabled={uploading || !completedCrop}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FiCheck className="w-5 h-5" />
                    <span>Save Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePhotoUpload;
