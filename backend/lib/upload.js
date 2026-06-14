import multer from 'multer';
import path from 'path';
import multerS3 from 'multer-s3';
import { isS3Configured, s3Client, s3Bucket, s3UploadPrefix } from './s3.js';
import 'dotenv/config';

if (!isS3Configured) {
  throw new Error(
    'AWS S3 is required for uploads. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_BUCKET_NAME in .env'
  );
}

/** Returns the public S3 URL from a multer-s3 file object. */
export const getFileUrl = (file) => file?.location || null;

/** Detects Cloudinary or local upload paths that should no longer be stored. */
export const isLegacyUploadUrl = (url) =>
  typeof url === 'string' && (
    url.includes('res.cloudinary.com') ||
    url.includes('/uploads/') ||
    url.startsWith('uploads/')
  );

/** Returns true when a legacy URL was rejected and a response was sent. */
export const rejectLegacyUploadUrl = (url, res, fieldName = 'file') => {
  if (url && isLegacyUploadUrl(url)) {
    res.status(400).json({
      message: `Legacy upload URL in ${fieldName} is not accepted. Please upload the file again.`,
    });
    return true;
  }
  return false;
};

const buildObjectKey = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const baseName = path.basename(originalname, ext).replace(/\s+/g, '-');
  return `${s3UploadPrefix}/${Date.now()}-${baseName}${ext}`;
};

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'video/mpeg',
    'video/ogg',
    'video/quicktime',
    'video/webm',
    'video/x-msvideo',
    'video/x-matroska',
  ];
  const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.pdf', '.doc', '.docx',
    '.mp4', '.mov', '.avi', '.mkv', '.webm',
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  const isAllowedMime = allowedMimeTypes.includes(file.mimetype);
  const isAllowedExt = allowedExtensions.includes(fileExtension);

  if (isImage || isVideo || isAllowedMime || isAllowedExt) {
    cb(null, true);
  } else {
    cb(new Error('Only images, videos, PDFs, and Word documents are allowed!'), false);
  }
};

const storage = multerS3({
  s3: s3Client,
  bucket: s3Bucket,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    cb(null, buildObjectKey(file.originalname));
  },
});

console.log(`📦 Upload storage: AWS S3 (bucket: ${s3Bucket}, prefix: ${s3UploadPrefix})`);

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 30 * 1024 * 1024 },
});
