# =============================================================
#  SECURITY MODULE — Security Groups
# =============================================================
#  Creates:
#    - EC2 Security Group  (allows SSH, HTTP 3000, 8080)
#    - RDS Security Group  (allows MySQL 3306 from EC2 only)
# =============================================================

# --- EC2 Security Group ---
# Controls what traffic can reach our application server
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-${var.environment}-ec2-sg"
  description = "Security group for EC2 application server"
  vpc_id      = var.vpc_id

  # SSH access (port 22) — for remote management
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # In production, restrict to your IP
  }

  # Frontend (port 3000) — Nginx serves the React app
  ingress {
    description = "Frontend (Nginx)"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend (port 8080) — Spring Boot API
  ingress {
    description = "Backend (Spring Boot)"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP (port 80) — Standard web traffic
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow ALL outbound traffic (EC2 needs to reach internet, RDS, ECR)
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ec2-sg"
  }
}

# --- RDS Security Group ---
# Only allows MySQL traffic FROM the EC2 security group (not the internet!)
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "Security group for RDS MySQL - only accessible from EC2"
  vpc_id      = var.vpc_id

  # MySQL access (port 3306) — ONLY from EC2 instances in our SG
  ingress {
    description     = "MySQL from EC2"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id] # ← Only from EC2!
  }

  # Allow ALL outbound (for updates, etc.)
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  }
}
