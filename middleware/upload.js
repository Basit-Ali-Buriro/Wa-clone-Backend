import multer from "multer";
import pkg from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // ✅ use your configured instance

const { CloudinaryStorage } = pkg;

// ✅ Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary, // use the instance that has .config() already applied
  params: async (req, file) => {
    return {
      folder: "chat_uploads", // folder name in Cloudinary
      resource_type: "auto", // auto-detect file type (image, video, etc.)
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`, // custom filename
    };
  },
});

// ✅ Initialize multer with the Cloudinary storage
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit
  },
});

export default upload;
