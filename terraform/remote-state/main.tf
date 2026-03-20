provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

# -----------------------------------------------------------
# S3 BUCKET — Stores the Terraform state file
# -----------------------------------------------------------
resource "aws_s3_bucket" "terraform_state" {
  # Globally unique bucket name using AWS Account ID
  bucket        = "${var.project_name}-tf-state-${data.aws_caller_identity.current.account_id}"
  
  # Set to true for dev environments so you can cleanly destroy the bucket later without emptying it manually
  force_destroy = true 

  tags = {
    Name        = "${var.project_name}-tf-state-bucket"
    Environment = "Management"
  }
}

# Enable versioning so we can see full revision history of our state files
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Enable server-side encryption by default
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block all public access for security
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# -----------------------------------------------------------
# DYNAMODB TABLE — Used for state locking (prevents concurrent applies)
# -----------------------------------------------------------
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "${var.project_name}-tf-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "${var.project_name}-tf-lock-table"
    Environment = "Management"
  }
}
