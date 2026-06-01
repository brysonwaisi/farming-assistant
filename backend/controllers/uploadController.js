const s3Service = require('../services/s3Service');
const ApiError = require('../util/ApiError');

// Issue a presigned URL so an admin can upload a product image straight to S3.
const createUploadUrl = async (req, res) => {
  const { contentType } = req.body;
  if (!contentType) {
    throw new ApiError(400, 'contentType is required');
  }
  const data = await s3Service.createUploadUrl(contentType, 'products/');
  return res.status(201).json(data);
};

// Presigned URL for the authenticated user's own avatar (any logged-in user).
const createAvatarUploadUrl = async (req, res) => {
  const { contentType } = req.body;
  if (!contentType) {
    throw new ApiError(400, 'contentType is required');
  }
  const data = await s3Service.createUploadUrl(contentType, 'avatars/');
  return res.status(201).json(data);
};

module.exports = { createUploadUrl, createAvatarUploadUrl };
