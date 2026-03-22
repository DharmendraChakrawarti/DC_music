# 🎵 DC Music Application

**DC Music** is a comprehensive, full-stack music streaming platform designed to seamlessly handle audio uploading, user-authentication, playlist curation, and smart search functionalities. It features a modern, completely responsive user interface and runs on an enterprise-ready infrastructure utilizing AWS RDS, Docker, and Terraform.

---

## ✨ Features
* **Music Streaming & Uploading:** Users can upload audio files (MP3/WAV) up to 50MB.
* **Smart Search:** Real-time debounced smart search with a dropdown preview of songs, artists, and albums.
* **Library & Playlists:** Create, delete, and add songs to custom playlists. Responsive layout that adapts between mobile and desktop automatically.
* **Persistent Player:** Beautiful, non-interruptive music player fixed to the bottom of the screen featuring volume control, progress seeking, and rapid 10-second skip buttons *(FastForward / Rewind)*.
* **Admin Controls:** An Admin dashboard allowing authorized users to globally approve, reject, or delete uploaded songs.
* **Authentication:** Secure JSON Web Token (JWT) based login and registration.

---

## 🏗️ Technology Stack
### Frontend
* **Framework:** React + Vite
* **Styling:** Tailwind CSS + Lucide Icons
* **State Management:** Redux Toolkit

### Backend
* **Framework:** Java 17 + Spring Boot 3.2
* **Security:** Spring Security & JWT
* **Database:** H2 Database (Local Dev) & AWS RDS MySQL (Production)

### DevOps & Infrastructure
* **Containerization:** Docker & Docker Compose (Frontend uses lightweight Nginx Alpine)
* **Infrastructure as Code (IaC):** Terraform
* **CI/CD:** Jenkins (`Jenkinsfile` integrated)

---

## 🚀 Running Locally (Docker)
The entire application is 100% Dockerized for zero-configuration, one-command startups. The local setup stores persistent database data and uploaded MP3 files accurately on your machine using Docker Volumes. 

**Prerequisites:** Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

1. Open your terminal at the root directory of this project.
2. Build and launch the containers detached:
   ```bash
   docker-compose up --build -d
   ```
3. Access the application:
   * **Frontend Application:** [http://localhost:5173](http://localhost:5173)
   * **Backend API:** [http://localhost:8080/api](http://localhost:8080/api)

4. To safely stop the containers:
   ```bash
   docker-compose down
   ```

*(Bonus: Because volumes are mapped dynamically in `docker-compose.yml`, uploaded files and H2 user accounts are saved persistently in `backend/data` and `backend/uploads`!)*

---

## ☁️ Cloud & Production Infrastructure (AWS)
This directory includes a complete `terraform/` folder configured to deploy the application into **Amazon Web Services (AWS)** seamlessly.

👉 **[Read the complete Infrastructure Overview in `infra.md`](infra.md)** for a detailed dive into the VPC, Security Groups, ECR, RDS, and EC2 topology.

### Provisioned AWS Resources
- **VPC & Subnets:** Custom public and private networks ensuring secure access points.
- **RDS MySQL 8.0:** A persistent, highly-available managed database in private subnets.
- **EC2 Instance:** The central web-server hosting our Docker containers in public subnets.
- **IAM Roles & ECR:** Secure Elastic Container Registries allowing EC2 to pull our latest pushed images automatically securely via IAM instances.

---

## 📂 Project Structure Overview
- `/frontend`: React + Vite UI application.
- `/backend`: Spring Boot 3 Java API handling logic, JWT Auth, and Audio Uploads.
- `/terraform`: Terraform AWS provision modules (`vpc`, `security`, `ecr`, `rds`, `ec2`).
- `docker-compose.yml`: For booting up both frontend & backend servers.
- `Jenkinsfile`: Entire CI/CD orchestration pipeline pipeline.
- `infra.md`: Deep dive into infrastructure architecture.
- `api-docs.md`: Details about the backend REST endpoints.
- `jenkinsinfo.md`: Complete overview of the Jenkins deployment and EC2 configuration points.

### Deploying Infrastructure
1. Move to the Terraform directory:
   ```bash
   cd terraform
   ```
2. Initialize Terraform and automatically provision remote state buckets:
   ```bash
   ./create-dynamic-state.sh   # (Or use the .ps1 file for Windows PowerShell)
   ```
3. Run the Terraform deploy command:
   ```bash
   terraform init
   terraform apply
   ```

*(You will be prompted to pass an RDS Master password securely through the console.)*

---

## 🔄 CI/CD Pipeline
A robust `Jenkinsfile` exists at the root of the project to orchestrate a 6-stage Continuous Deployment pipeline:

1. **Checkout:** Pulls the latest code from GitHub.
2. **Terraform (IaC):** Detects any changes to AWS infrastructure and applies them securely.
3. **Build:** Compiles the Spring Boot backend JAR and the Vite frontend static dist file.
4. **Docker:** Packages both the frontend (Node/Nginx) and backend (Maven/Java) into Docker containers and pushes them directly to AWS ECR.
5. **Deploy to EC2:** SSH connects directly to the EC2 server, updates the local `docker-compose.yml`, pulls the newly deployed images, and restarts the environment cleanly!

*Note: For Jenkins to execute this correctly, ensure your Jenkins credentials (`aws-credentials`, `rds-password`, `ec2-ssh-key`) are registered securely in the master node.*
