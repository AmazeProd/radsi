const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Upload image to Cloudinary
exports.uploadImage = async (filePath, folder = 'social-media') => {
  try {
    console.log('Uploading file:', filePath);
    console.log('Folder:', folder);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist at path: ' + filePath);
    }
    
    // Check Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.warn('Cloudinary not configured, using local storage');
      // Use local storage as fallback
      const filename = path.basename(filePath);
      const publicPath = `/uploads/${filename}`;
      return {
        url: publicPath,
        publicId: filename,
      };
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    console.log('Cloudinary upload successful');

    // Delete file from local storage
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Error in uploadImage:', error.message);
    
    // Delete file from local storage if upload fails
    if (fs.existsSync(filePath)) {
      try {
        // If Cloudinary fails, keep the file and return local URL
        if (error.message.includes('Cloudinary') || error.http_code) {
          const filename = path.basename(filePath);
          const publicPath = `/uploads/${filename}`;
          console.log('Using local storage fallback:', publicPath);
          return {
            url: publicPath,
            publicId: filename,
          };
        }
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
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
