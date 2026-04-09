import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure uploads folder exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    // Save as: timestamp-filename.ext
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx'];
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isImage = file.mimetype.startsWith('image/');
  const isAllowedMime = allowedMimeTypes.includes(file.mimetype);
  const isAllowedExt = allowedExtensions.includes(fileExtension);

  console.log("📁 Receiving file:", {
    mimetype: file.mimetype,
    originalname: file.originalname,
    extension: fileExtension,
    isImage,
    isAllowedMime,
    isAllowedExt
  });

  if (isImage || isAllowedMime || isAllowedExt) {
    cb(null, true);
  } else {
    console.error("❌ Rejected file type:", file.mimetype, fileExtension);
    cb(new Error('Only images, PDFs, and Word documents are allowed!'), false);
  }
};

export const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 30 * 1024 * 1024 } // 30MB limit
});
