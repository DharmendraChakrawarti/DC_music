# =============================================================
#  EC2 MODULE — Application Server
# =============================================================
#  Creates:
#    - IAM Role + Instance Profile (for ECR access)
#    - EC2 Instance with Docker pre-installed
#    - User data script auto-pulls & runs containers
#
#  HOW IT WORKS:
#    1. EC2 boots with Amazon Linux 2023
#    2. User data script installs Docker & Docker Compose
#    3. Pulls images from ECR
#    4. Runs frontend + backend via docker-compose
#    5. Backend connects to RDS MySQL (not a local container)
# =============================================================

# --- Get latest Amazon Linux 2023 AMI ---
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# --- IAM Role for EC2 (to pull images from ECR) ---
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-${var.environment}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-ec2-role"
  }
}

# Attach ECR read-only policy (so EC2 can pull Docker images)
resource "aws_iam_role_policy_attachment" "ecr_readonly" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# Instance Profile (wrapper that lets EC2 use the IAM role)
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-${var.environment}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# --- EC2 Instance ---
resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  # Root volume
  root_block_device {
    volume_size = 30 # 30 GB (minimum required by AMI snapshot)
    volume_type = "gp3"
  }

  # --- User Data Script ---
  # This runs ONCE when the EC2 instance first boots.
  # It installs Docker, logs into ECR, and starts the application.
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    aws_region       = var.aws_region
    ecr_backend_url  = var.ecr_backend_url
    ecr_frontend_url = var.ecr_frontend_url
    rds_endpoint     = var.rds_endpoint
    rds_db_name      = var.rds_db_name
    rds_username     = var.rds_username
    rds_password     = var.rds_password
  }))

  tags = {
    Name = "${var.project_name}-${var.environment}-app-server"
  }
}
