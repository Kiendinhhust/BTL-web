const cloudinary = require('../config/cloudinaryStore');

// Upload buffer (ảnh từ multer) lên Cloudinary
const uploadImage = (folder, buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};

// Xóa ảnh theo folder và tên file (không có đuôi mở rộng)
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw error;
    }
};
async function listImages(prefix) {
    const res = await cloudinary.api.resources({
      type: 'upload',
      prefix
    });
    return res.resources.map(r => ({
      public_id: r.public_id,
      url:       r.secure_url
    }));
  }
  
module.exports = {
    uploadImage,
    deleteImage,
    listImages
};
