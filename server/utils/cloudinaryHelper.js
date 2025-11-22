const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Upload image to Cloudinary
exports.uploadImage = async (filePath, folder = 'social-media') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    // Delete file from local storage
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    // Delete file from local storage if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

// Delete image from Cloudinary
exports.deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

// Upload multiple images
exports.uploadMultipleImages = async (files, folder = 'social-media') => {
  try {
    const uploadPromises = files.map((file) => this.uploadImage(file.path, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw error;
  }
};
