# =============================================================
#  ROOT OUTPUTS — Important values printed after terraform apply
# =============================================================

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "ec2_public_ip" {
  description = "Public IP of the EC2 instance (SSH & access app here)"
  value       = module.ec2.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = module.ec2.public_dns
}

output "rds_endpoint" {
  description = "RDS MySQL endpoint (hostname:port)"
  value       = module.rds.rds_endpoint
}

output "ecr_backend_url" {
  description = "ECR repository URL for backend image"
  value       = module.ecr.backend_repository_url
}

output "ecr_frontend_url" {
  description = "ECR repository URL for frontend image"
  value       = module.ecr.frontend_repository_url
}

output "app_url" {
  description = "URL to access the application"
  value       = "http://${module.ec2.public_ip}"
}

output "ssh_command" {
  description = "SSH command to connect to EC2"
  value       = "ssh -i <your-key.pem> ec2-user@${module.ec2.public_ip}"
}
