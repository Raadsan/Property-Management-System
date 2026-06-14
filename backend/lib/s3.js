import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME } = process.env;

export const isS3Configured = Boolean(
  AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_REGION && AWS_BUCKET_NAME
);

export const s3Client = isS3Configured
  ? new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

export const s3Bucket = AWS_BUCKET_NAME || '';
export const s3UploadPrefix = process.env.AWS_S3_UPLOAD_PREFIX || 'uploads';

export const getS3PublicUrl = (key) =>
  `https://${s3Bucket}.s3.${AWS_REGION}.amazonaws.com/${key}`;
