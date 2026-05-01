import multer, { memoryStorage } from "multer";

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

// File filter
const fileFilter = (req, file, cb) => {
  if (MIME_TYPES.docs.includes(file.mimetype)) {
    if (file.fieldname === "docs") return cb(null, true);
  }
  if (MIME_TYPES.images.includes(file.mimetype)) {
    if (file.fieldname === "images") return cb(null, true);
  }
  if (MIME_TYPES.videos.includes(file.mimetype)) {
    if (file.fieldname === "videos") return cb(null, true);
  }

  // ❌ Reject file
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
