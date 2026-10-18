# ☁️ Cloud Deployment Guide - Blood Bank Management System (HemoSync)

This guide walks you through deploying **HemoSync** to production cloud environments: **AWS ECS (Fargate)**, **Google Cloud Run**, and containerized virtual machines via **Docker Compose**.

---

## 🏛️ Cloud Architecture Overview

```
                      +-----------------------------+
                      |   Cloud CDN / DNS (Route53) |
                      +--------------+--------------+
                                     |
                                     v
                  +-----------------------------------+
                  |  Application Load Balancer / SSL  |
                  +------------------+----------------+
                                     |
             +-----------------------+-----------------------+
             |                                               |
             v                                               v
+--------------------------+                   +--------------------------+
| Frontend Web Container   |                   | Backend API Container    |
| (Nginx + React SPA)      |                   | (Express.js on Node 20)  |
| Port: 80                 |                   | Port: 5000 / 8080        |
+--------------------------+                   +-------------+------------+
                                                             |
                                                             v
                                               +--------------------------+
                                               | Cloud Database           |
                                               | (MongoDB Atlas / DocDB)  |
                                               +--------------------------+
```

---

## 🚀 Option 1: Google Cloud Run (Recommended for Speed & Cost)

Google Cloud Run is a fully managed serverless container runtime. It scales to zero when idle (extremely cost effective).

### Step 1: Install & Login to Google Cloud SDK
```bash
gcloud auth login
gcloud config set project <YOUR_GCP_PROJECT_ID>
gcloud services enable run.googleapis.com artifactregistry.googleapis.com
```

### Step 2: Deploy Backend API
```bash
cd server
gcloud run deploy blood-bank-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=8080,MONGODB_URI="<YOUR_MONGODB_ATLAS_URI>",JWT_SECRET="<YOUR_SECRET>"
```

Retrieve your backend API URL from the output (e.g., `https://blood-bank-api-xyz.a.run.app`).

### Step 3: Deploy Frontend Web
```bash
cd ../client
gcloud run deploy blood-bank-web \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars VITE_API_URL="https://blood-bank-api-xyz.a.run.app/api"
```

---

## 🚀 Option 2: AWS ECS Fargate + Amazon ECR

AWS ECS with Fargate runs containers without provisioning EC2 servers.

### Step 1: Create ECR Repositories
```bash
aws ecr create-repository --repository-name blood-bank-server --region us-east-1
aws ecr create-repository --repository-name blood-bank-client --region us-east-1
```

### Step 2: Build and Push Docker Images
```bash
# ECR Authentication
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Server image
docker build -t blood-bank-server ./server
docker tag blood-bank-server:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/blood-bank-server:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/blood-bank-server:latest

# Client image
docker build -t blood-bank-client ./client
docker tag blood-bank-client:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/blood-bank-client:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/blood-bank-client:latest
```

### Step 3: Register Task Definition & Update Service
1. Update `<AWS_ACCOUNT_ID>` and `<AWS_REGION>` in `cloud/aws-ecs/task-definition.json`.
2. Register and deploy:
```bash
aws ecs register-task-definition --cli-input-json file://cloud/aws-ecs/task-definition.json
aws ecs update-service --cluster blood-bank-cluster --service blood-bank-service --force-new-deployment
```

---

## 🚀 Option 3: Single-Command Docker Compose (EC2 / VM)

To host on a standard cloud virtual machine (e.g. AWS EC2 t3.small, DigitalOcean Droplet, or Linode):

1. SSH into the cloud VM.
2. Clone the repository and navigate to `cloud/`:
```bash
cd cloud
docker compose up -d --build
```
3. The stack starts:
   - **Client**: Port `80` (accessible via public IP / domain)
   - **Server**: Port `5000` (internal network & proxied)
   - **MongoDB**: Port `27017` (isolated internal network with persistent storage)

---

## 🗄️ Database Setup: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register for the free shared cluster (M0).
2. Create a Database User (e.g., `bloodbank_admin`).
3. In **Network Access**, add `0.0.0.0/0` (Allow access from anywhere) or whitelist your Cloud Run/ECS IP ranges.
4. Copy the connection string:
   ```
   mongodb+srv://bloodbank_admin:<password>@cluster0.abcde.mongodb.net/blood_bank?retryWrites=true&w=majority
   ```
5. Set this connection string as `MONGODB_URI` in your cloud environment variables.

---

## 🩺 Health Check & Monitoring
Both ECS and Cloud Run use the backend's `/health` endpoint to monitor application liveness:
```bash
curl https://<YOUR_DEPLOYED_URL>/health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-10-11T16:45:00.000Z",
  "service": "Blood Bank Management System API",
  "uptime": 1248.5
}
```
