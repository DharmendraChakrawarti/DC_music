# =============================================================
#  ROOT VARIABLES — All configurable inputs for the infrastructure
# =============================================================

variable "aws_region" {
  description = "AWS Region to deploy resources"
  type        = string
  default     = "ap-south-1" # Mumbai
}

variable "project_name" {
  description = "Name prefix for all resources"
  type        = string
  default     = "dcmusic"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# -------------------------------------------------------
# VPC Configuration
# -------------------------------------------------------
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (for RDS)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "availability_zones" {
  description = "Availability zones to use"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

# -------------------------------------------------------
# EC2 Configuration
# -------------------------------------------------------
variable "ec2_instance_type" {
  description = "EC2 instance type (t2.micro = Free Tier)"
  type        = string
  default     = "t3.micro"
}

variable "ec2_key_name" {
  description = "Name of the SSH key pair (must already exist in AWS)"
  type        = string
}

# -------------------------------------------------------
# RDS Configuration
# -------------------------------------------------------
variable "db_instance_class" {
  description = "RDS instance class (db.t3.micro = Free Tier)"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Name of the MySQL database"
  type        = string
  default     = "dcmusic_db"
}

variable "db_username" {
  description = "Master username for RDS"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Master password for RDS (pass via -var or env TF_VAR_db_password)"
  type        = string
  sensitive   = true
}
