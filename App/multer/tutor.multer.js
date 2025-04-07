const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs").promises; // Async fs functions

const uploadPath = path.join(__dirname, "uploads"); // Uploads folder

// Ensure "uploads" directory exists
(async () => {
  try {
    await fs.mkdir(uploadPath, { recursive: true });
  } catch (err) {
    console.error("Failed to create upload directory:", err);
  }
})();

// Allowed MIME types
const allowedMimeTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx"
};

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save all files in "uploads/"
  },
  filename: function (req, file, cb) {
    const ext = allowedMimeTypes[file.mimetype] || path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now(); // Timestamp for uniqueness
    const prefix = file.mimetype.startsWith("image/") ? "profile-uploaded" : "document-uploaded";
    cb(null, `${prefix}-${uniqueSuffix}.${ext}`);
  }
});

// Multer Upload Configuration
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes[file.mimetype]) {
      console.log("Unsupported file format:", file.mimetype);
      return cb(new Error("Only images and documents are allowed!"), false);
    }
    cb(null, true);
  }
});

// Image Compression Middleware
const compressImage = async (req, res, next) => {
  if (!req.file || !req.file.mimetype.startsWith("image/")) return next(); // Skip if not an image

  const targetFormat = "webp"; // Default format for images
  const quality = 70;
  const width = 800;

  try {
    const outputFileName = `profile-uploaded-${Date.now()}.${targetFormat}`;
    const outputPath = path.join(uploadPath, outputFileName);

    await sharp(req.file.path)
      .resize({ width })
      .toFormat(targetFormat, { quality })
      .toFile(outputPath);

    // Delete the original uncompressed file
    await fs.unlink(req.file.path).catch(err => console.error("Failed to delete original file:", err));

    // Update req.file details
    req.file.path = outputPath;
    req.file.filename = outputFileName;

    next();
  } catch (error) {
    console.error("Image processing error:", error);
    next(error);
  }
};

module.exports = { upload, compressImage };
