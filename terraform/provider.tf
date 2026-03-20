# =============================================================
#  TERRAFORM PROVIDER & BACKEND CONFIGURATION
# =============================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # -----------------------------------------------------------
  # REMOTE STATE BACKEND (S3 + DynamoDB)
  # -----------------------------------------------------------
  # WHY REMOTE STATE?
  #   1. Jenkins and your laptop share the SAME state file
  #   2. State is not lost if your machine crashes
  #   3. DynamoDB lock prevents two people from applying at once
  #
  # BEFORE FIRST USE — run the setup script:
  #   ./setup-remote-state.sh
  #
  # Or create manually:
  #   aws s3 mb s3://student-mgmt-tf-state-<ACCOUNT_ID> --region ap-south-1
  #   aws dynamodb create-table --table-name student-mgmt-tf-lock \
  #     --attribute-definitions AttributeName=LockID,AttributeType=S \
  #     --key-schema AttributeName=LockID,KeyType=HASH \
  #     --billing-mode PAY_PER_REQUEST --region ap-south-1
  # -----------------------------------------------------------
  backend "s3" {
    bucket         = "dcmusic-tf-state-bucket" # CHANGE to your bucket name
    key            = "dev/terraform.tfstate"        # Path inside the bucket
    region         = "ap-south-1"                   # Must match your AWS region
    dynamodb_table = "dcmusic-tf-lock"         # For state locking
    encrypt        = true                           # Encrypt state at rest
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
