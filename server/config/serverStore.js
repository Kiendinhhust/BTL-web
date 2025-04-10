const path = require('path');
const multer = require('multer');
const fs = require('fs');

function defineStorage(folder) {
  const baseUploadDir = path.join(__dirname, '../public/img');

  return multer.diskStorage({
    destination: function (req, file, cb) {
      const targetFolder = folder ? path.join(baseUploadDir, folder) : path.join(baseUploadDir, 'default');
      
      // Tạo thư mục nếu chưa tồn tại
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }
      cb(null, targetFolder);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });
}

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
  }
};

// path: ./public/img/ + 'folder' || ././public/img/default
function uploadWithFolder(folder) {
    return multer({
        storage: defineStorage(folder),
        limits: {
            // Giới hạn kích thước file: 5MB
            fileSize: 5 * 1024 * 1024
          },
          fileFilter: fileFilter
    });
}

function deleteFile(filePath) {
  console.log(__dirname)
  fs.unlink(path.join(__dirname, '../public' + filePath), (err) => {
    if (err) {
      // Nếu có lỗi khi xóa file
      throw err
    }
    console.log(`Remove ${filePath}`)
  });
}

const checkFileExists = async (filePath) => {
  try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true; // Tệp tồn tại
  } catch (err) {
      return false; // Tệp không tồn tại
  }
};

module.exports = {
  uploadWithFolder,
  deleteFile,
  checkFileExists
}