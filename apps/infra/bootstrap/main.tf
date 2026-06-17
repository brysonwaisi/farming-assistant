# One-time bootstrap for the remote-state backend used by ../infrastructure.
# Run this FIRST (local state), then `terraform init` the infrastructure stack.
#   cd bootstrap && terraform init && terraform apply
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.49.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# State-locking table referenced by ../infrastructure/backend.tf.
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

# State bucket (already exists: "farmingassistant"). Versioning + encryption
# are managed here so state is recoverable and encrypted at rest.
resource "aws_s3_bucket" "state" {
  bucket = "farmingassistant"
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
