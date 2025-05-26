const { uploadImage, deleteImage } = require("../utils/cloudinaryHelper");
const path = require("path");
const cloudinary = require("../config/cloudinaryStore");
// Upload Ảnh
const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Không có ảnh nào được tải lên!" });
    }

    const folder = req.body.folder || "uploads";

    const result = await uploadImage(folder, req.file.buffer);
    delete req.file.buffer;

    res.json({
      message: "Tải ảnh thành công!",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Lỗi upload ảnh:", error);
    res.status(500).json({ error: "Lỗi khi tải ảnh lên Cloudinary!" });
  }
};

// Xoá Ảnh
const deleteImageByPublicId = async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) {
      return res.status(400).json({ error: "Thiếu public_id!" });
    }
    await deleteImage(public_id);
    res.json({ message: "Xóa ảnh thành công!", public_id });
  } catch (error) {
    console.error("Lỗi khi xóa ảnh:", error);
    res.status(500).json({ error: "Xóa ảnh thất bại!" });
  }
};

const getImageByPublicId = async (req, res) => {
  try {
    const { public_id } = req.params;
    if (!public_id) {
      return res.status(400).json({ error: "Thiếu public_id!" });
    }
    // Gọi API để lấy metadata, bao gồm secure_url
    const info = await cloudinary.api.resource(public_id);
    res.json({
      public_id: info.public_id,
      url: info.secure_url,
      width: info.width,
      height: info.height,
      format: info.format,
      created_at: info.created_at,
    });
  } catch (error) {
    console.error("Lỗi khi lấy ảnh:", error);
    res.status(500).json({ error: "Không thể lấy ảnh!" });
  }
};
module.exports = {
  uploadSingleImage,
  deleteImageByPublicId,
  getImageByPublicId,
};
