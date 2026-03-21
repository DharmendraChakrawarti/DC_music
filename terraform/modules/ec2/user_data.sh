#!/bin/bash
# =============================================================
#  EC2 USER DATA SCRIPT
#  Runs once on first boot — installs Docker & starts the app
# =============================================================
set -e

# --- 1. Install Docker ---
yum update -y
yum install -y docker
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group (so we can run docker without sudo)
usermod -aG docker ec2-user

# --- 2. Install Docker Compose ---
DOCKER_COMPOSE_VERSION="v2.24.5"
curl -SL "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# --- 3. Login to ECR ---
aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin ${ecr_backend_url}

# --- 4. Create docker-compose file ---
mkdir -p /home/ec2-user/app
mkdir -p /home/ec2-user/app/uploads
cat > /home/ec2-user/app/docker-compose.yml <<'COMPOSE'
services:
  backend:
    image: ${ecr_backend_url}:latest
    container_name: dcmusic-backend
    restart: always
    ports:
      - "8080:8080"
    volumes:
      - ./uploads:/app/uploads
    environment:
      SPRING_PROFILES_ACTIVE: aws
      SPRING_DATASOURCE_URL: "jdbc:mysql://${rds_endpoint}/${rds_db_name}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true"
      SPRING_DATASOURCE_USERNAME: "${rds_username}"
      SPRING_DATASOURCE_PASSWORD: "${rds_password}"
      SPRING_JPA_HIBERNATE_DDL_AUTO: update
      APP_CORS_ALLOWED_ORIGINS: "*"
    networks:
      - app-network

  frontend:
    image: ${ecr_frontend_url}:latest
    container_name: dcmusic-frontend
    restart: always
    ports:
      - "80:80"
      - "3000:80"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
COMPOSE

# --- 5. Pull images and start the application ---
cd /home/ec2-user/app
docker-compose pull
docker-compose up -d

# --- 6. Set ownership ---
chown -R ec2-user:ec2-user /home/ec2-user/app

echo "===== APPLICATION DEPLOYMENT COMPLETE ====="
