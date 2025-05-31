const express = require("express");
const productController = require("../controller/productController");
const auth = require("../middleware/authMiddleware");

const multer = require("multer");

const storage = multer.memoryStorage();

// Chỉ cho phép file ảnh (jpg, jpeg, png, gif, webp)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Chỉ chấp nhận các định dạng ảnh!"), false); // Reject file
  }
};
const upload = multer({ storage, fileFilter });

const router = express.Router();

router.get("/status", (req, res) => {
  res.send("Product Route 200 OK");
});

router.post("/create", productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/shop/:shopId", productController.getProductsByShop);
router.post(
  "/add-item/:productId",
  upload.single("image"),
  productController.createItem
);
router.get("/item/:productId", productController.getItemsByProduct);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
