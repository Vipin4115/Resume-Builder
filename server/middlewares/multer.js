// server/middlewares/multer.js
import multer from "multer";

// Use memory storage for ImageKit
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max, optional
  },
});

export default upload;
