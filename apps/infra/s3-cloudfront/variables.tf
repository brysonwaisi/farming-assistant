variable "region" {
  description = "AWS region for the S3 bucket."
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project slug used to name resources."
  type        = string
  default     = "farming-assistant"
}

variable "env" {
  description = "Environment suffix (e.g. dev, prod)."
  type        = string
  default     = "prod"
}

variable "allowed_origins" {
  description = "Frontend origins allowed to PUT directly to S3 via presigned URLs."
  type        = list(string)
  default     = ["http://localhost:5173"]
}
