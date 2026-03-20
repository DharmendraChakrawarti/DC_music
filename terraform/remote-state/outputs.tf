output "s3_bucket_name" {
  description = "The name of the S3 bucket to use in backend config"
  value       = aws_s3_bucket.terraform_state.id
}

output "dynamodb_table_name" {
  description = "The name of the DynamoDB table to use in backend config"
  value       = aws_dynamodb_table.terraform_locks.name
}

output "aws_region" {
  description = "The AWS region where the remote state is hosted"
  value       = var.aws_region
}

output "terraform_init_command" {
  description = "Command to run in your main terraform directory to initialize the remote state"
  value       = "terraform init -backend-config=\"bucket=${aws_s3_bucket.terraform_state.id}\" -backend-config=\"dynamodb_table=${aws_dynamodb_table.terraform_locks.name}\" -backend-config=\"region=${var.aws_region}\" -backend-config=\"key=dev/terraform.tfstate\" -backend-config=\"encrypt=true\""
}
