# 🔄 Jenkins CI/CD Setup Guide for DC Music

This document explains everything you need to know to successfully configure and run the Jenkins CI/CD pipeline for the **DC Music** application using the provided `Jenkinsfile`.

---

## 1️⃣ Required Jenkins Plugins
Before running the pipeline, ensure the following plugins are installed securely on your Jenkins Master node via **Manage Jenkins > Manage Plugins**:
- **Pipeline** (Usually installed by default)
- **Amazon Web Services SDK** and **Pipeline: AWS Steps** (For securely authenticating with AWS services)
- **SSH Agent Plugin** (For SSHing into the backend EC2 server for Docker deployments)
- **Docker Pipeline** (For building the Spring/React images natively)

---

## 2️⃣ Jenkins Global Tool Configuration
The pipeline relies on Jenkins downloading and caching build tools automatically rather than forcing the Agent layer to install them natively. 

Go to **Manage Jenkins > Global Tool Configuration** and set up the following tools precisely with these *exact names*:

1. **Maven Installation:**
   - **Name:** `Maven-3.9`
   - Check "Install automatically"
   - Select version: `3.9.6` (or latest 3.9.x)

2. **NodeJS Installation:**
   - **Name:** `Node-20`
   - Check "Install automatically"
   - Select version: `NodeJS 20.x`

---

## 3️⃣ Jenkins Credentials (Critical Step)
The deployment securely provisions Terraform and injects secrets natively so your codebase doesn't leak internal IDs. 

Go to **Manage Jenkins > Manage Credentials > System > Global credentials** and add the following three items matching the exact **ID** requested:

| Credential Type | ID Name | What it is |
| --- | --- | --- |
| **AWS Credentials** | `aws-credentials` | Your AWS Access Key ID and Secret Access Key. This grants Jenkins the authority to provision Terraform, authenticate ECR Docker images, and launch EC2s. |
| **Secret text** | `rds-password` | The secure master password for the AWS RDS MySQL database. Terraform passes this into the infrastructure natively. |
| **SSH Username with private key** | `ec2-ssh-key` | The exact `.pem` private key content you generated in AWS for the EC2 server (`ec2-user`). Ensures Jenkins can SSH inside and orchestrate Docker Compose automatically. |

---

## 4️⃣ How the DevOps Pipeline Works
Once configured, you simply point Jenkins to pull your repo and it handles **six sequential delivery stages** smoothly:

1. **📥 Checkout:** Checks out the latest state of the Git branch.
2. **🔐 AWS Setup:** Binds dynamic Account IDs ensuring secure multi-account ECR domains dynamically without hardcoding.
3. **🏗️ Terraform:** Automatically hooks up to the encrypted remote S3 State bucket, and provisions missing or altered VPCs, EC2s, Security Groups, and RDS databases autonomously.
4. **⚙️ Parallel Build:** Fires off the Java/Maven compilation (skipping tests for speed) while concurrently executing a production `npm run build` on Vite frontend.
5. **🐳 Docker Push:** Authenticates directly with AWS ECR, and ships versioned lightweight container images (with Nginx for frontend and Alpine standard for backend) off to AWS.
6. **🚀 Deployment to EC2:** Finally, Jenkins securely SSHs into the active EC2 Instance, gracefully injects environment variables, rebuilds `docker-compose.yml`, pulls your new containers natively, bounces traffic, and aggressively cleans up hanging Docker volumes.

---

### 🎉 Triggering a Build
Whenever you select "Build Now", Jenkins natively sets up the secure DB parameters (`jdbc:mysql://...`), automatically detects the correct endpoints mapping for the Terraform Outputs, builds the web application containerization, and updates your production app flawlessly!
