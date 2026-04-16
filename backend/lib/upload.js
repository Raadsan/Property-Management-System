import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import 'dotenv/config';

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  // If CLOUDINARY_URL is present, the SDK handles config automatically
  console.log("☁️ Cloudinary configured using CLOUDINARY_URL");
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log("☁️ Cloudinary configured using individual keys");
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Return parameters for Cloudinary
    return {
      folder: 'property-management',
      resource_type: 'auto',
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "").replace(/\s+/g, '-')}`
    };
  },
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
