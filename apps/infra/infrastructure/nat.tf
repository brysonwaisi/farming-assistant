# One NAT gateway per AZ so a single AZ outage doesn't cut egress for both
# private subnets (and to avoid cross-AZ NAT data charges).
resource "aws_eip" "nat_zone1" {
  domain = "vpc"
  tags   = { Name = "${local.env}-nat-zone1" }
}

resource "aws_eip" "nat_zone2" {
  domain = "vpc"
  tags   = { Name = "${local.env}-nat-zone2" }
}

resource "aws_nat_gateway" "zone1" {
  allocation_id = aws_eip.nat_zone1.id
  subnet_id     = aws_subnet.public_zone1.id
  tags          = { Name = "${local.env}-nat-zone1" }
  depends_on    = [aws_internet_gateway.igw]
}

resource "aws_nat_gateway" "zone2" {
  allocation_id = aws_eip.nat_zone2.id
  subnet_id     = aws_subnet.public_zone2.id
  tags          = { Name = "${local.env}-nat-zone2" }
  depends_on    = [aws_internet_gateway.igw]
}
