#!/bin/bash
# =============================================================
#  CREATE DYNAMIC STATE BACKEND (Bash)
# =============================================================
#  This is a completely standalone script that automatically:
#    1. Detects your AWS Account ID dynamically
#    2. Creates a unique S3 bucket for Terraform state
#    3. Creates a DynamoDB table for state locking
#
#  Usage:
#    cd terraform
#    chmod +x create-dynamic-state.sh
#    ./create-dynamic-state.sh
# =============================================================

set -e

AWS_REGION="ap-south-1"
PROJECT_NAME="dcmusic"

echo ""
echo "🔍 Detecting AWS Account ID..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null) || {
    echo "❌ Failed to get AWS Account ID. Ensure AWS CLI is configured."
    exit 1
}

BUCKET_NAME="${PROJECT_NAME}-tf-state-${ACCOUNT_ID}"
DYNAMODB_TABLE="${PROJECT_NAME}-tf-lock"

echo "============================================"
echo "  Provisioning Terraform Backend Resources"
echo "============================================"
echo "  AWS Account:    ${ACCOUNT_ID}"
echo "  Region:         ${AWS_REGION}"
echo "  S3 Bucket:      ${BUCKET_NAME}"
echo "  DynamoDB Table: ${DYNAMODB_TABLE}"
echo "============================================"

# --- 1. Create S3 Bucket ---
echo ""
echo "📦 Creating S3 bucket: ${BUCKET_NAME}..."
if aws s3api head-bucket --bucket "${BUCKET_NAME}" 2>/dev/null; then
    echo "   ✅ Bucket already exists, skipping."
else
    aws s3 mb "s3://${BUCKET_NAME}" --region "${AWS_REGION}"

    aws s3api put-bucket-versioning \
        --bucket "${BUCKET_NAME}" \
        --versioning-configuration Status=Enabled

    aws s3api put-bucket-encryption \
        --bucket "${BUCKET_NAME}" \
        --server-side-encryption-configuration '{
            "Rules": [{
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }]
        }'

    aws s3api put-public-access-block \
        --bucket "${BUCKET_NAME}" \
        --public-access-block-configuration '{
            "BlockPublicAcls": true,
            "IgnorePublicAcls": true,
            "BlockPublicPolicy": true,
            "RestrictPublicBuckets": true
        }'

    echo "   ✅ S3 bucket created successfully!"
fi

# --- 2. Create DynamoDB Table ---
echo ""
echo "🔒 Creating DynamoDB table: ${DYNAMODB_TABLE}..."
if aws dynamodb describe-table --table-name "${DYNAMODB_TABLE}" --region "${AWS_REGION}" 2>/dev/null; then
    echo "   ✅ Table already exists, skipping."
else
    aws dynamodb create-table \
        --table-name "${DYNAMODB_TABLE}" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "${AWS_REGION}"

    echo "   ⏳ Waiting for table to become active..."
    aws dynamodb wait table-exists \
        --table-name "${DYNAMODB_TABLE}" \
        --region "${AWS_REGION}"

    echo "   ✅ DynamoDB table created successfully!"
fi

echo ""
echo "============================================"
echo "  ✅ Dynamic State Setup Complete!"
echo "============================================"
echo ""
echo "  To use this dynamically without modifying provider.tf, run:"
echo ""
echo "  terraform init -backend-config=\"bucket=$BUCKET_NAME\" -backend-config=\"dynamodb_table=$DYNAMODB_TABLE\" -backend-config=\"region=$AWS_REGION\" -backend-config=\"key=dev/terraform.tfstate\" -backend-config=\"encrypt=true\""
echo ""
echo "============================================"
