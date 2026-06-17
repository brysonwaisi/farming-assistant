terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

locals {
  bucket_name = "${var.project}-product-images-${var.env}"
  # The app may only write under these prefixes (product images, user avatars).
  key_prefixes = ["products/", "avatars/"]
}

# ─── Private S3 bucket (no public access; CloudFront reads via OAC) ───────────
resource "aws_s3_bucket" "images" {
  bucket = local.bucket_name
}

resource "aws_s3_bucket_public_access_block" "images" {
  bucket                  = aws_s3_bucket.images.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "images" {
  bucket = aws_s3_bucket.images.id
  versioning_configuration {
    status = "Enabled"
  }
}

# CORS so the browser can PUT directly to S3 with a presigned URL.
resource "aws_s3_bucket_cors_configuration" "images" {
  bucket = aws_s3_bucket.images.id
  cors_rule {
    allowed_methods = ["PUT"]
    allowed_origins = var.allowed_origins
    allowed_headers = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# ─── CloudFront with Origin Access Control (modern replacement for OAI) ───────
resource "aws_cloudfront_origin_access_control" "images" {
  name                              = "${local.bucket_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "images" {
  enabled             = true
  comment             = "${var.project} product images (${var.env})"
  default_root_object = ""
  price_class         = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.images.bucket_regional_domain_name
    origin_id                = "s3-images"
    origin_access_control_id = aws_cloudfront_origin_access_control.images.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-images"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# Bucket policy: only this CloudFront distribution may read objects.
data "aws_iam_policy_document" "bucket_policy" {
  statement {
    sid       = "AllowCloudFrontRead"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.images.arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.images.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "images" {
  bucket = aws_s3_bucket.images.id
  policy = data.aws_iam_policy_document.bucket_policy.json
}

# ─── Least-privilege IAM user for the backend (presign PUT to the prefix) ─────
resource "aws_iam_user" "app" {
  name = "${var.project}-image-uploader-${var.env}"
}

data "aws_iam_policy_document" "app_policy" {
  statement {
    sid       = "PutImages"
    actions   = ["s3:PutObject"]
    resources = [for p in local.key_prefixes : "${aws_s3_bucket.images.arn}/${p}*"]
  }
}

resource "aws_iam_user_policy" "app" {
  name   = "product-image-upload"
  user   = aws_iam_user.app.name
  policy = data.aws_iam_policy_document.app_policy.json
}

resource "aws_iam_access_key" "app" {
  user = aws_iam_user.app.name
}
