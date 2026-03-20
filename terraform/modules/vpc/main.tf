# =============================================================
#  VPC MODULE — Network Foundation
# =============================================================
#  Creates:
#    - VPC
#    - 2 Public Subnets  (for EC2 - internet access)
#    - 2 Private Subnets (for RDS - no internet access)
#    - Internet Gateway   (public subnets → internet)
#    - Route Tables
# =============================================================

# --- VPC ---
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true    # Required for RDS DNS resolution
  enable_dns_hostnames = true    # Required for public DNS names on EC2

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

# --- Internet Gateway (allows public subnets to reach the internet) ---
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}

# --- Public Subnets (EC2 instances go here) ---
resource "aws_subnet" "public" {
  count = length(var.public_subnet_cidrs)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true  # EC2 instances get a public IP automatically

  tags = {
    Name = "${var.project_name}-${var.environment}-public-${count.index + 1}"
  }
}

# --- Private Subnets (RDS instances go here — no internet access) ---
resource "aws_subnet" "private" {
  count = length(var.private_subnet_cidrs)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.project_name}-${var.environment}-private-${count.index + 1}"
  }
}

# --- Public Route Table (routes traffic to Internet Gateway) ---
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"          # All outbound traffic
    gateway_id = aws_internet_gateway.main.id  # → goes through IGW
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-public-rt"
  }
}

# --- Associate public subnets with the public route table ---
resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
