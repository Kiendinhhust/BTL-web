import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3434';

/**
 * Upload an image file to the server
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder name to store the image in
 * @returns {Promise<Object>} - The response containing public_id and url
 */
export const uploadImage = async (file, folder = 'uploads') => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) {
      formData.append('folder', folder);
    }

    
    const response = await axios.post(
      `${API_URL}/api/utils/store/image/upload`,
      formData
    );

    return {
      success: true,
      public_id: response.data.public_id,
      url: response.data.url
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Lỗi khi tải ảnh lên'
    };
  }
};



/**
 * Delete an image by its public_id
 * @param {string} publicId - The public_id of the image to delete
 * @returns {Promise<Object>} - The response
 */
export const deleteImage = async (publicId) => {
  try {
    
    const response = await axios.post(
      `${API_URL}/api/utils/store/image/delete`,
      { public_id: publicId }
    );

    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Lỗi khi xóa ảnh'
    };
  }
};

/**
 * Get image details by its public_id
 * @param {string} publicId - The public_id of the image
 * @returns {Promise<Object>} - The image details including url
 */
export const getImageByPublicId = async (publicId) => {
  try {
    if (!publicId) {
      return {
        success: false,
        error: 'Missing public_id'
      };
    }

    const response = await axios.get(`${API_URL}/api/utils/store/image/${publicId}`);
    
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Error getting image:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Lỗi khi lấy thông tin ảnh'
    };
  }
};

/**
 * List all images in a folder
 * @param {string} folder - The folder to list images from
 * @returns {Promise<Object>} - The list of images
 */
export const listImages = async (folder = 'uploads') => {
  try {
    const response = await axios.get(`${API_URL}/api/utils/store/image/list?folder=${folder}`);
    
    return {
      success: true,
      images: response.data
    };
  } catch (error) {
    console.error('Error listing images:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Lỗi khi lấy danh sách ảnh'
    };
  }
};
