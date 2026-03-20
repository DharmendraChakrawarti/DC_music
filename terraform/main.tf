# =============================================================
#  ROOT MAIN — Wires all modules together
# =============================================================

# -----------------------------------------------------------
# 1. VPC MODULE — Network foundation
# -----------------------------------------------------------
module "vpc" {
  source = "./modules/vpc"

  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
}

# -----------------------------------------------------------
# 2. SECURITY MODULE — Security Groups
# -----------------------------------------------------------
module "security" {
  source = "./modules/security"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
}

# -----------------------------------------------------------
# 3. ECR MODULE — Docker image repositories
# -----------------------------------------------------------
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

# -----------------------------------------------------------
# 4. RDS MODULE — MySQL database
# -----------------------------------------------------------
module "rds" {
  source = "./modules/rds"

  project_name      = var.project_name
  environment       = var.environment
  db_instance_class = var.db_instance_class
  db_name           = var.db_name
  db_username       = var.db_username
  db_password       = var.db_password
  subnet_ids        = module.vpc.private_subnet_ids
  security_group_id = module.security.rds_security_group_id
}

# -----------------------------------------------------------
# 5. EC2 MODULE — Application server
# -----------------------------------------------------------
module "ec2" {
  source = "./modules/ec2"

  project_name      = var.project_name
  environment       = var.environment
  instance_type     = var.ec2_instance_type
  key_name          = var.ec2_key_name
  subnet_id         = module.vpc.public_subnet_ids[0]
  security_group_id = module.security.ec2_security_group_id
  ecr_backend_url   = module.ecr.backend_repository_url
  ecr_frontend_url  = module.ecr.frontend_repository_url
  rds_endpoint      = module.rds.rds_endpoint
  rds_db_name       = var.db_name
  rds_username      = var.db_username
  rds_password      = var.db_password
  aws_region        = var.aws_region
}
