# =============================================================
#  CREATE DYNAMIC STATE BACKEND (PowerShell)
# =============================================================
#  This is a completely standalone script that automatically:
#    1. Detects your AWS Account ID dynamically
#    2. Creates a unique S3 bucket for Terraform state
#    3. Creates a DynamoDB table for state locking
#
#  Usage:
#    cd terraform
#    .\create-dynamic-state.ps1
# =============================================================

$ErrorActionPreference = "Stop"

$AWS_REGION = "ap-south-1"
$PROJECT_NAME = "dcmusic"

Write-Host "`n[*] Detecting AWS Account ID..." -ForegroundColor Yellow
try {
    $ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text).Trim()
}
catch {
    Write-Host "[X] Failed to get AWS Account ID. Ensure AWS CLI is installed and configured." -ForegroundColor Red
    exit 1
}

# Add random suffix or account ID to make it globally unique
$BUCKET_NAME = "${PROJECT_NAME}-tf-state-${ACCOUNT_ID}"
$DYNAMODB_TABLE = "${PROJECT_NAME}-tf-lock"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Provisioning Terraform Backend Resources"    -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  AWS Account:    $ACCOUNT_ID"
Write-Host "  Region:         $AWS_REGION"
Write-Host "  S3 Bucket:      $BUCKET_NAME"
Write-Host "  DynamoDB Table: $DYNAMODB_TABLE"
Write-Host "============================================" -ForegroundColor Cyan

# --- 1. Create S3 Bucket ---
Write-Host "`n[*] Creating S3 bucket: $BUCKET_NAME..." -ForegroundColor Yellow
$bucketExists = $false
try {
    aws s3api head-bucket --bucket $BUCKET_NAME 2>$null
    $bucketExists = $true
}
catch {}

if ($bucketExists) {
    Write-Host "   [+] Bucket already exists, skipping creation." -ForegroundColor Green
}
else {
    aws s3 mb "s3://$BUCKET_NAME" --region $AWS_REGION

    aws s3api put-bucket-versioning `
        --bucket $BUCKET_NAME `
        --versioning-configuration Status=Enabled

    $encryptionConfig = '{\"Rules\":[{\"ApplyServerSideEncryptionByDefault\":{\"SSEAlgorithm\":\"AES256\"}}]}'
    aws s3api put-bucket-encryption `
        --bucket $BUCKET_NAME `
        --server-side-encryption-configuration $encryptionConfig

    $publicAccessConfig = '{\"BlockPublicAcls\":true,\"IgnorePublicAcls\":true,\"BlockPublicPolicy\":true,\"RestrictPublicBuckets\":true}'
    aws s3api put-public-access-block `
        --bucket $BUCKET_NAME `
        --public-access-block-configuration $publicAccessConfig

    Write-Host "   [+] S3 bucket created successfully with security best practices!" -ForegroundColor Green
}

# --- 2. Create DynamoDB Table ---
Write-Host "`n[*] Creating DynamoDB table: $DYNAMODB_TABLE..." -ForegroundColor Yellow
$tableExists = $false
try {
    aws dynamodb describe-table --table-name $DYNAMODB_TABLE --region $AWS_REGION 2>$null | Out-Null
    $tableExists = $true
}
catch {}

if ($tableExists) {
    Write-Host "   [+] Table already exists, skipping creation." -ForegroundColor Green
}
else {
    aws dynamodb create-table `
        --table-name $DYNAMODB_TABLE `
        --attribute-definitions 'AttributeName=LockID,AttributeType=S' `
        --key-schema 'AttributeName=LockID,KeyType=HASH' `
        --billing-mode PAY_PER_REQUEST `
        --region $AWS_REGION

    Write-Host "   [*] Waiting for table to become active..." -ForegroundColor Yellow
    aws dynamodb wait table-exists `
        --table-name $DYNAMODB_TABLE `
        --region $AWS_REGION

    Write-Host "   [+] DynamoDB table created successfully!" -ForegroundColor Green
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  [+] Dynamic State Setup Complete!"             -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  To use this dynamically without modifying provider.tf, run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  terraform init -backend-config=`"bucket=$BUCKET_NAME`" -backend-config=`"dynamodb_table=$DYNAMODB_TABLE`" -backend-config=`"region=$AWS_REGION`" -backend-config=`"key=dev/terraform.tfstate`" -backend-config=`"encrypt=true`"" -ForegroundColor White
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
