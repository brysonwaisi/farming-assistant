# Feed these into the backend .env after `terraform apply`.

output "s3_bucket" {
  description = "S3_BUCKET — the private images bucket name."
  value       = aws_s3_bucket.images.bucket
}

output "aws_region" {
  description = "AWS_REGION — bucket region."
  value       = var.region
}

output "cloudfront_domain" {
  description = "CLOUDFRONT_DOMAIN — public image host (e.g. dxxxx.cloudfront.net)."
  value       = aws_cloudfront_distribution.images.domain_name
}

output "aws_access_key_id" {
  description = "AWS_ACCESS_KEY_ID for the least-privilege uploader user."
  value       = aws_iam_access_key.app.id
}

output "aws_secret_access_key" {
  description = "AWS_SECRET_ACCESS_KEY for the uploader user."
  value       = aws_iam_access_key.app.secret
  sensitive   = true
}
