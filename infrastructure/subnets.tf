resource "aws_subnet" "private-us-east-1a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_sub1
  availability_zone = "us-east-1a"

  tags = {
    "Name"                                = "private-us-east-1a"
    "kubernetes.io/role/internal-elb"     = "1"
    "kubernetes.io/cluster/farmingassist" = "owned"
  }
}

resource "aws_subnet" "private-us-east-1b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_sub2
  availability_zone = "us-east-1b"

  tags = {
    "Name"                                = "private-us-east-1b"
    "kubernetes.io/role/internal-elb"     = "1"
    "kubernetes.io/cluster/farmingassist" = "owned"
  }
}

resource "aws_subnet" "public-us-east-1a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_sub1
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    "Name"                                = "public-us-east-1a"
    "kubernetes.io/role/elb"              = "1"
    "kubernetes.io/cluster/farmingassist" = "owned"
  }
}

resource "aws_subnet" "public-us-east-1b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_sub2
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    "Name"                                = "public-us-east-1b"
    "kubernetes.io/role/elb"              = "1"
    "kubernetes.io/cluster/farmingassist" = "owned"
  }
}