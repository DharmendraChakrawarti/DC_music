# EC2 Module — Input Variables

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "key_name" {
  description = "SSH key pair name (must already exist in AWS)"
  type        = string
}

variable "subnet_id" {
  description = "Public subnet ID to launch EC2 in"
  type        = string
}

variable "security_group_id" {
  description = "Security group ID for EC2"
  type        = string
}

variable "ecr_backend_url" {
  description = "ECR repository URL for backend image"
  type        = string
}

variable "ecr_frontend_url" {
  description = "ECR repository URL for frontend image"
  type        = string
}

variable "rds_endpoint" {
  description = "RDS MySQL endpoint (hostname:port)"
  type        = string
}

variable "rds_db_name" {
  type = string
}

variable "rds_username" {
  type = string
}

variable "rds_password" {
  type      = string
  sensitive = true
}

variable "aws_region" {
  type = string
}
