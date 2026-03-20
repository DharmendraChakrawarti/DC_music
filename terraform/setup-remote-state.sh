#!/bin/bash
# =============================================================
#  SETUP REMOTE STATE — Run this ONCE before terraform init
# =============================================================
#  Creates:
#    1. S3 Bucket  → stores terraform.tfstate
#    2. DynamoDB   → state locking (prevents parallel applies)
#
#  Usage:
#    chmod +x setup-remote-state.sh
#    ./setup-remote-state.sh
# =============================================================

set -e

AWS_REGION="ap-south-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="student-mgmt-tf-state-${ACCOUNT_ID}"
DYNAMODB_TABLE="student-mgmt-tf-lock"

echo "============================================"
echo "  Setting up Terraform Remote State"
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

    # Enable versioning (keeps history of state files)
    aws s3api put-bucket-versioning \
        --bucket "${BUCKET_NAME}" \
        --versioning-configuration Status=Enabled

    # Enable encryption
    aws s3api put-bucket-encryption \
        --bucket "${BUCKET_NAME}" \
        --server-side-encryption-configuration '{
            "Rules": [{
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }]
        }'

    # Block public access
    aws s3api put-public-access-block \
        --bucket "${BUCKET_NAME}" \
        --public-access-block-configuration '{
            "BlockPublicAcls": true,
            "IgnorePublicAcls": true,
            "BlockPublicPolicy": true,
            "RestrictPublicBuckets": true
        }'

    echo "   ✅ S3 bucket created with versioning + encryption!"
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

    echo "   ✅ DynamoDB table created!"
fi

echo ""
echo "============================================"
echo "  ✅ Remote state setup complete!"
echo "============================================"
echo ""
echo "  NOW UPDATE terraform/provider.tf:"
echo "    bucket = \"${BUCKET_NAME}\""
echo ""
echo "  Then run:"
echo "    cd terraform"
echo "    terraform init"
echo "============================================"
