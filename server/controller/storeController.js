const { uploadImage, deleteImage } = require('../utils/cloudinaryHelper');
const path = require('path');

// Upload Ảnh
const uploadSingleImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Không có ảnh nào được tải lên!' });
        }

        const folder = req.body.folder || 'uploads';

        const result = await uploadImage(folder, req.file.buffer);
        delete req.file.buffer;

        res.json({
            message: 'Tải ảnh thành công!',
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        res.status(500).json({ error: 'Lỗi khi tải ảnh lên Cloudinary!' });
    }
};

// Xoá Ảnh
const deleteImageByUrl = async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'Thiếu imageUrl!' });
        }

        const url = new URL(imageUrl);
        const pathname = url.pathname; // /image/upload/v1744043610/uploads/h2f8iuasqerjmochooih.png

        // Tách các phần
        const parts = pathname.split('/'); // ['', 'image', 'upload', 'v1744043610', 'uploads', 'h2f8iuasqerjmochooih.png']

        // Bỏ 'v...' đi (phần version Cloudinary tự thêm)
        const versionIndex = parts.findIndex(part => /^v\d+$/.test(part)); // tìm vị trí 'v1744043610'
        const publicIdParts = parts.slice(versionIndex + 1); // ['uploads', 'h2f8iuasqerjmochooih.png']

        const filenameWithExt = publicIdParts.pop(); // 'h2f8iuasqerjmochooih.png'
        const folder = publicIdParts.join('/'); // 'uploads'
        const filename = path.parse(filenameWithExt).name; // 'h2f8iuasqerjmochooih'

        const publicId = folder ? `${folder}/${filename}` : filename;

        await deleteImage(publicId);

        res.json({ message: 'Xoá ảnh thành công!', public_id: publicId });
    } catch (error) {
        console.error('Lỗi xoá ảnh:', error);
        res.status(500).json({ error: 'Lỗi khi xoá ảnh trên Cloudinary!' });
    }
};


module.exports = {
    uploadSingleImage,
    deleteImageByUrl
};