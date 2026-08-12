import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import ApiError from '../util/ApiError';

const { AWS_REGION: REGION, S3_BUCKET: BUCKET, CLOUDFRONT_DOMAIN } = process.env;
const PRESIGN_TTL = 60; // seconds

// Only these key prefixes may be written to via presigned URLs. Matches the
// IAM policy granted to the app's uploader user.
const ALLOWED_PREFIXES = ['products/', 'avatars/'];
const DEFAULT_PREFIX = 'products/';

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const isConfigured = (): boolean => Boolean(REGION && BUCKET && CLOUDFRONT_DOMAIN);

let client: S3Client | undefined;
const s3 = (): S3Client => {
  if (!client) client = new S3Client({ region: REGION });
  return client;
};

// Public URL the product stores, served via CloudFront (bucket stays private).
const publicUrl = (key: string): string => `https://${CLOUDFRONT_DOMAIN}/${key}`;

interface UploadUrlResult {
  uploadUrl: string;
  key: string;
  fileUrl: string;
  expiresIn: number;
}

// Mint a short-lived presigned PUT URL for a single image upload.
const createUploadUrl = async (
  contentType: string,
  prefix: string = DEFAULT_PREFIX,
): Promise<UploadUrlResult> => {
  if (!isConfigured()) {
    throw new ApiError(503, 'Image storage is not configured');
  }
  const ext = ALLOWED_TYPES[contentType];
  if (!ext) {
    throw new ApiError(400, 'Unsupported image type. Use JPEG, PNG, WebP or GIF.');
  }
  if (!ALLOWED_PREFIXES.includes(prefix)) {
    throw new ApiError(400, 'Invalid upload target');
  }

  const key = `${prefix}${crypto.randomUUID()}.${ext}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3(), command, { expiresIn: PRESIGN_TTL });

  return {
    uploadUrl,
    key,
    fileUrl: publicUrl(key),
    expiresIn: PRESIGN_TTL,
  };
};

export { createUploadUrl, publicUrl, isConfigured, ALLOWED_TYPES };
