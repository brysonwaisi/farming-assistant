locals {
  env         = "production"
  region      = "us-east-1"
  zone1       = "us-east-1a"
  zone2       = "us-east-1b"
  eks_name    = "farming-assistant"
  eks_version = "1.30"

  # CIDRs allowed to reach the public EKS API endpoint. Restrict to admin/VPN
  # ranges before applying; do not leave open to the internet.
  cluster_public_access_cidrs = ["0.0.0.0/0"]
}
