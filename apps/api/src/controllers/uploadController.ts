import { Request, Response } from 'express';
import * as s3Service from '../services/s3Service';
import ApiError from '../util/ApiError';

// Issue a presigned URL so an admin can upload a product image straight to S3.
const createUploadUrl = async (req: Request, res: Response) => {
  const { contentType } = req.body;
  if (!contentType) {
    throw new ApiError(400, 'contentType is required');
  }
  const data = await s3Service.createUploadUrl(contentType, 'products/');
  return res.status(201).json(data);
};

// Presigned URL for the authenticated user's own avatar (any logged-in user).
const createAvatarUploadUrl = async (req: Request, res: Response) => {
  const { contentType } = req.body;
  if (!contentType) {
    throw new ApiError(400, 'contentType is required');
  }
  const data = await s3Service.createUploadUrl(contentType, 'avatars/');
  return res.status(201).json(data);
};

export { createUploadUrl, createAvatarUploadUrl };
