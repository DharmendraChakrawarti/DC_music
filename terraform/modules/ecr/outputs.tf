# ECR Module — Outputs

output "backend_repository_url" {
  description = "Full URL for the backend ECR repository"
  value       = aws_ecr_repository.backend.repository_url
}

output "frontend_repository_url" {
  description = "Full URL for the frontend ECR repository"
  value       = aws_ecr_repository.frontend.repository_url
}
