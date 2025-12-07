const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Upload image to Cloudinary
exports.uploadImage = async (filePath, folder = 'social-media') => {
  try {
    console.log('=== CLOUDINARY UPLOAD START ===');
    console.log('File path:', filePath);
    console.log('Folder:', folder);
    console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');
    
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

    console.log('Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    console.log('Cloudinary upload successful!');
    console.log('URL:', result.secure_url);
    console.log('=== CLOUDINARY UPLOAD END ===');

    // Delete file from local storage
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('=== CLOUDINARY UPLOAD ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    console.error('=================================');
    
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
    const uploadPromises = files.map((file) => exports.uploadImage(file.path, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};
