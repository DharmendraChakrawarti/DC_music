# =============================================================
#  ECR MODULE — Docker Image Repositories
# =============================================================
#  Creates:
#    - ECR Repository for Backend (Spring Boot) image
#    - ECR Repository for Frontend (React/Nginx) image
#  
#  ECR = Elastic Container Registry (AWS's Docker Hub)
# =============================================================

resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"    # Allows overwriting :latest tag
  force_delete         = true         # Allow deletion even if images exist

  image_scanning_configuration {
    scan_on_push = false  # Set to true in production for vulnerability scanning
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-backend-ecr"
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "${var.project_name}-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = false
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-frontend-ecr"
  }
}
