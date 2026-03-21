// =============================================================
//  JENKINSFILE — CI/CD Pipeline for Student Management System
// =============================================================
//
//  WHAT THIS PIPELINE DOES (6 stages):
//  ------------------------------------
//  1. Checkout     → Pulls code from GitHub
//  2. Terraform    → Creates/updates AWS infrastructure
//  3. Build        → Compiles backend JAR + frontend dist
//  4. Docker       → Builds Docker images
//  5. Push to ECR  → Pushes images to AWS ECR
//  6. Deploy       → SSHs into EC2 and restarts containers
//
//  PREREQUISITES (set up in Jenkins BEFORE running):
//  -------------------------------------------------
//  1. Credentials:
//     - 'aws-credentials'  → AWS Access Key + Secret Key
//     - 'rds-password'     → Secret text (RDS master password)
//     - 'ec2-ssh-key'      → SSH private key for EC2
//
//  2. Plugins:
//     - Pipeline
//     - SSH Agent
//     - AWS Credentials
//
//  3. Tools (Global Tool Configuration):
//     - Maven  → name: 'Maven-3.9'
//     - NodeJS → name: 'Node-20'
//
// =============================================================

pipeline {
    agent any

    // ---------------------------------------------------------
    // TOOLS — Jenkins auto-installs these
    // ---------------------------------------------------------
    tools {
        maven 'Maven-3.9'
        nodejs 'Node-20'
    }

    // ---------------------------------------------------------
    // ENVIRONMENT — Global variables used across stages
    // ---------------------------------------------------------
    environment {
        AWS_REGION      = 'ap-south-1'
        PROJECT_NAME    = 'dcmusic'
    }

    // ---------------------------------------------------------
    // PIPELINE STAGES
    // ---------------------------------------------------------
    stages {

        // =====================================================
        // STAGE 1: CHECKOUT CODE
        // =====================================================
        stage('Checkout') {
            steps {
                echo '📥 Pulling latest code from GitHub...'
                checkout scm
            }
        }

        // =====================================================
        // STAGE 2: GET AWS ACCOUNT ID
        // =====================================================
        stage('AWS Setup') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                                  credentialsId: 'aws-credentials',
                                  accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                                  secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {
                    script {
                        // Get the AWS Account ID dynamically
                        env.AWS_ACCOUNT_ID = sh(
                            script: "aws sts get-caller-identity --query Account --output text",
                            returnStdout: true
                        ).trim()

                        // Update ECR URLs with actual account ID
                        env.ECR_BACKEND  = "${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com/${env.PROJECT_NAME}-backend"
                        env.ECR_FRONTEND = "${env.AWS_ACCOUNT_ID}.dkr.ecr.${env.AWS_REGION}.amazonaws.com/${env.PROJECT_NAME}-frontend"

                        echo "✅ AWS Account ID: ${env.AWS_ACCOUNT_ID}"
                        echo "✅ Backend ECR:    ${env.ECR_BACKEND}"
                        echo "✅ Frontend ECR:   ${env.ECR_FRONTEND}"
                    }
                }
            }
        }

        // =====================================================
        // STAGE 3: TERRAFORM — Provision AWS Infrastructure
        // =====================================================
        stage('Terraform') {
            steps {
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: 'aws-credentials',
                     accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                     secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'],
                    string(credentialsId: 'rds-password', variable: 'DB_PASSWORD')
                ]) {
                    dir('terraform') {
                        echo '🏗️ Initializing Terraform with S3 remote state...'
                        // -backend-config overrides the bucket name in provider.tf
                        // so we can dynamically use the AWS Account ID
                        sh """
                            terraform init \
                              -backend-config="bucket=dcmusic-tf-state-${env.AWS_ACCOUNT_ID}" \
                              -backend-config="key=dev/terraform.tfstate" \
                              -backend-config="region=${AWS_REGION}" \
                              -backend-config="dynamodb_table=dcmusic-tf-lock" \
                              -backend-config="encrypt=true"
                        """

                        echo '📋 Planning infrastructure changes...'
                        sh """
                            terraform plan \
                              -var="db_password=${DB_PASSWORD}" \
                              -var="ec2_key_name=my-key-pair" \
                              -out=tfplan
                        """

                        echo '🚀 Applying infrastructure...'
                        sh 'terraform apply -auto-approve tfplan'

                        // Capture EC2 IP for deployment stage
                        script {
                            env.EC2_IP = sh(
                                script: "terraform output -raw ec2_public_ip",
                                returnStdout: true
                            ).trim()
                            echo "✅ EC2 Public IP: ${env.EC2_IP}"
                        }
                    }
                }
            }
        }

        // =====================================================
        // STAGE 4: BUILD — Compile backend & frontend
        // =====================================================
        stage('Build') {
            parallel {
                // Backend: Maven build
                stage('Backend Build') {
                    steps {
                        dir('backend') {
                            echo '☕ Building Spring Boot backend...'
                            sh 'mvn clean package -DskipTests'
                            echo '✅ Backend JAR ready!'
                        }
                    }
                }

                // Frontend: npm build
                stage('Frontend Build') {
                    steps {
                        dir('frontend') {
                            echo '⚛️ Building React frontend...'
                            sh 'npm install'
                            sh 'npm run build'
                            echo '✅ Frontend dist ready!'
                        }
                    }
                }
            }
        }

        // =====================================================
        // STAGE 5: DOCKER BUILD & PUSH TO ECR
        // =====================================================
        stage('Docker Build & Push') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                                  credentialsId: 'aws-credentials',
                                  accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                                  secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']]) {

                    echo '🔐 Logging into AWS ECR...'
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin \
                        ${env.AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    """

                    echo '🐳 Building & pushing Backend image...'
                    dir('backend') {
                        sh "docker build -t ${env.ECR_BACKEND}:latest ."
                        sh "docker push ${env.ECR_BACKEND}:latest"
                    }

                    echo '🐳 Building & pushing Frontend image...'
                    dir('frontend') {
                        sh "docker build -t ${env.ECR_FRONTEND}:latest ."
                        sh "docker push ${env.ECR_FRONTEND}:latest"
                    }

                    echo '✅ Both images pushed to ECR!'
                }
            }
        }

        // =====================================================
        // STAGE 6: DEPLOY — SSH into EC2 and restart containers
        // =====================================================
        stage('Deploy to EC2') {
            steps {
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: 'aws-credentials',
                     accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                     secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'],
                    sshUserPrivateKey(credentialsId: 'ec2-ssh-key',
                                     keyFileVariable: 'SSH_KEY_FILE',
                                     usernameVariable: 'SSH_USER')
                ]) {
                    echo "🚀 Deploying to EC2 at ${env.EC2_IP}..."
                    sh """
                        chmod 400 "\$SSH_KEY_FILE"
                        ssh -o StrictHostKeyChecking=no -i "\$SSH_KEY_FILE" ec2-user@${env.EC2_IP} << 'DEPLOY_SCRIPT'
                            # Login to ECR
                            aws ecr get-login-password --region ${AWS_REGION} | \\
                              docker login --username AWS --password-stdin \\
                              ${env.AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                            # Pull latest images
                            cd /home/ec2-user/app
                            docker-compose pull

                            # Restart containers with new images
                            docker-compose down
                            docker-compose up -d

                            # Clean up old images
                            docker image prune -f

                            echo "✅ App deployed successfully!"
DEPLOY_SCRIPT
                    """
                }
            }
        }
    }

    // ---------------------------------------------------------
    // POST ACTIONS — Run after pipeline finishes
    // ---------------------------------------------------------
    post {
        success {
            echo """
            ✅ ====================================
            ✅  PIPELINE COMPLETED SUCCESSFULLY!
            ✅ ====================================
            ✅  App URL:  http://${env.EC2_IP}
            ✅  API URL:  http://${env.EC2_IP}:8080
            ✅ ====================================
            """
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above for details.'
        }
        always {
            // Clean up Docker images from Jenkins server
            sh 'docker image prune -f || true'
        }
    }
}
