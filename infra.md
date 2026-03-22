# 🏗️ Infrastructure Overview (AWS & Terraform)

The DC Music application utilizes a fully automated Infrastructure as Code (IaC) approach using **Terraform** to provision highly scalable, secure, and resilient cloud native resources on **Amazon Web Services (AWS)**.

## 🚀 Architectural Map

The infrastructure follows standard AWS best practices including a VPC with both public and private subnets. Here is a high-level overview of the components defined in the `terraform/` directory.

### 1. 🌐 VPC Network (`modules/vpc`)
- **VPC (Virtual Private Cloud)**: Provides an isolated network boundary.
- **Public Subnets**: Used to host the EC2 Instance (acting as the application server) containing an internet gateway for routing public traffic.
- **Private Subnets**: Houses the RDS MySQL database for maximum security, keeping the data layer completely detached from direct internet exposure.

### 2. 🛡️ Security (`modules/security`)
- **EC2 Security Group**: Allows inbound traffic on HTTP/HTTPS for user access, and SSH for administrator and Jenkins pipeline access.
- **RDS Security Group**: Allows internal traffic (MySQL port 3306) specifically originating *only* from the EC2 Security Group.

### 3. 📦 ECR (Elastic Container Registry) (`modules/ecr`)
- **Backend Repo**: Stores the Spring Boot Java container image.
- **Frontend Repo**: Stores the Nginx/React Vite container image.

### 4. 🗄️ Database (`modules/rds`)
- **Engine**: Amazon RDS running MySQL 8.0.
- **Deployment**: Placed securely within the private subnets.
- **Wiring**: The auto-configured remote endpoint is injected dynamically into the EC2 host via securely generated env files, allowing backend connectivity without manual configuration.

### 5. 🖥️ App Server (`modules/ec2`)
- **Instance**: EC2 instance in a public subnet.
- **User Data & Bootstrapping**: A startup script (`user_data.sh`) bootstraps the server installing Docker, AWS CLI, and preparing the host system. It then automatically authenticates with ECR, pulls the fresh Docker images, and injects runtime configurations.

---

## ⚙️ Configuration & Secrets Management
Terraform securely passes the RDS passwords, backend URLs, and environment variables dynamically to the EC2 server and ensures standard variables are preserved.

*For complete details on Jenkins deployment, refer to `jenkinsinfo.md`.*
