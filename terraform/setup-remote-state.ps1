# =============================================================
#  SETUP REMOTE STATE (PowerShell) — Run ONCE before terraform init
# =============================================================
#  Creates:
#    1. S3 Bucket  → stores terraform.tfstate
#    2. DynamoDB   → state locking (prevents parallel applies)
#
#  Usage:
#    .\setup-remote-state.ps1
# =============================================================

$ErrorActionPreference = "Stop"

$AWS_REGION = "ap-south-1"
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text).Trim()
$BUCKET_NAME = "student-mgmt-tf-state-$ACCOUNT_ID"
$DYNAMODB_TABLE = "student-mgmt-tf-lock"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Setting up Terraform Remote State"        -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  AWS Account:    $ACCOUNT_ID"
Write-Host "  Region:         $AWS_REGION"
Write-Host "  S3 Bucket:      $BUCKET_NAME"
Write-Host "  DynamoDB Table: $DYNAMODB_TABLE"
Write-Host "============================================" -ForegroundColor Cyan

# --- 1. Create S3 Bucket ---
Write-Host "`n📦 Creating S3 bucket: $BUCKET_NAME..." -ForegroundColor Yellow
try {
    aws s3api head-bucket --bucket $BUCKET_NAME 2>$null
    Write-Host "   ✅ Bucket already exists, skipping." -ForegroundColor Green
}
catch {
    aws s3 mb "s3://$BUCKET_NAME" --region $AWS_REGION

    # Enable versioning
    aws s3api put-bucket-versioning `
        --bucket $BUCKET_NAME `
        --versioning-configuration Status=Enabled

    # Enable encryption
    $encryptionConfig = '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
    aws s3api put-bucket-encryption `
        --bucket $BUCKET_NAME `
        --server-side-encryption-configuration $encryptionConfig

    # Block public access
    $publicAccessConfig = '{"BlockPublicAcls":true,"IgnorePublicAcls":true,"BlockPublicPolicy":true,"RestrictPublicBuckets":true}'
    aws s3api put-public-access-block `
        --bucket $BUCKET_NAME `
        --public-access-block-configuration $publicAccessConfig

    Write-Host "   ✅ S3 bucket created with versioning + encryption!" -ForegroundColor Green
}

# --- 2. Create DynamoDB Table ---
Write-Host "`n🔒 Creating DynamoDB table: $DYNAMODB_TABLE..." -ForegroundColor Yellow
try {
    aws dynamodb describe-table --table-name $DYNAMODB_TABLE --region $AWS_REGION 2>$null | Out-Null
    Write-Host "   ✅ Table already exists, skipping." -ForegroundColor Green
}
catch {
    aws dynamodb create-table `
        --table-name $DYNAMODB_TABLE `
        --attribute-definitions AttributeName=LockID, AttributeType=S `
        --key-schema AttributeName=LockID, KeyType=HASH `
        --billing-mode PAY_PER_REQUEST `
        --region $AWS_REGION

    Write-Host "   ✅ DynamoDB table created!" -ForegroundColor Green
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  ✅ Remote state setup complete!"             -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  NOW UPDATE terraform/provider.tf:" -ForegroundColor Yellow
Write-Host "    bucket = `"$BUCKET_NAME`""
Write-Host ""
Write-Host "  Then run:" -ForegroundColor Yellow
Write-Host "    cd terraform"
Write-Host "    terraform init"
Write-Host "============================================" -ForegroundColor Cyan
