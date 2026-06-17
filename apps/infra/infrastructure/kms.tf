resource "aws_kms_key" "eks" {
  description             = "${local.env}-${local.eks_name} EKS secret encryption"
  enable_key_rotation     = true
  deletion_window_in_days = 10
}

resource "aws_kms_alias" "eks" {
  name          = "alias/${local.env}-${local.eks_name}-eks"
  target_key_id = aws_kms_key.eks.key_id
}
