# Security Module — Outputs

output "ec2_security_group_id" {
  description = "Security Group ID for EC2"
  value       = aws_security_group.ec2.id
}

output "rds_security_group_id" {
  description = "Security Group ID for RDS"
  value       = aws_security_group.rds.id
}
