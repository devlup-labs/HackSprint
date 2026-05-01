import multer, { memoryStorage } from "multer";
import path from "path";

// Allowed mime types
const MIME_TYPES = {
  docs: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  images: ["image/jpeg", "image/png", "image/jpg"],
  videos: ["video/mp4", "video/mpeg", "video/quicktime"],
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "docs") {
    if (
      MIME_TYPES.docs.includes(file.mimetype) ||
      [".pdf", ".doc", ".docx", ".ppt", ".pptx"].includes(ext)
    ) {
      return cb(null, true);
    }
  }

  if (file.fieldname === "images") {
    if (
      MIME_TYPES.images.includes(file.mimetype) ||
      [".jpg", ".jpeg", ".png"].includes(ext)
    ) {
      return cb(null, true);
    }
  }

  if (file.fieldname === "videos") {
    if (
      MIME_TYPES.videos.includes(file.mimetype) ||
      [".mp4", ".mpeg", ".mov"].includes(ext)
    ) {
      return cb(null, true);
    }
  }

  console.log("Rejected:", file.fieldname, file.mimetype, file.originalname);

  cb(
    new Error(
      `Invalid file type for field ${file.fieldname}: ${file.mimetype}`
    ),
    false
  );
};

const storage = memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max per file
  },
});

export { upload };
export default upload;
