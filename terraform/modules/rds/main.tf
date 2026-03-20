# =============================================================
#  RDS MODULE — MySQL Database (AWS Managed)
# =============================================================
#  Creates:
#    - DB Subnet Group (tells RDS which subnets to use)
#    - RDS MySQL Instance (db.t3.micro = Free Tier)
#
#  WHY RDS instead of MySQL in Docker?
#    - Automatic backups
#    - Managed updates/patches
#    - Multi-AZ failover (production)
#    - No need to manage MySQL ourselves
# =============================================================

# --- DB Subnet Group ---
# RDS needs at least 2 subnets in different AZs
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

# --- RDS MySQL Instance ---
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-mysql"

  # Engine
  engine         = "mysql"
  engine_version = "8.0"

  # Size (Free Tier)
  instance_class    = var.db_instance_class   # db.t3.micro
  allocated_storage = 20                       # 20 GB (Free Tier = 20 GB)
  storage_type      = "gp2"                    # General Purpose SSD

  # Database
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]
  publicly_accessible    = false   # Not accessible from internet (only from EC2)

  # Backup & Maintenance
  backup_retention_period = 0       # Disable backups for dev (save cost)
  skip_final_snapshot     = true    # Don't create snapshot when deleting

  # Other
  multi_az            = false  # Single AZ for dev (save cost)
  deletion_protection = false  # Allow terraform destroy

  tags = {
    Name = "${var.project_name}-${var.environment}-mysql"
  }
}
