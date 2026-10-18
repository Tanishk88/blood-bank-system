# Google Cloud Run Deployment Script (PowerShell)
param (
    [Parameter(Mandatory=$true)][string]$ProjectId,
    [Parameter(Mandatory=$false)][string]$Region = "us-central1",
    [Parameter(Mandatory=$true)][string]$MongoUri,
    [Parameter(Mandatory=$false)][string]$JwtSecret = "prod_secret_token_123"
)

Write-Host "==> Setting active Google Cloud Project to $ProjectId..." -ForegroundColor Cyan
gcloud config set project $ProjectId

Write-Host "==> Enabling required GCP services..." -ForegroundColor Cyan
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

Write-Host "==> Deploying Backend API to Cloud Run..." -ForegroundColor Cyan
cd ../../server
gcloud run deploy blood-bank-api `
    --source . `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --set-env-vars "NODE_ENV=production,PORT=8080,MONGODB_URI=$MongoUri,JWT_SECRET=$JwtSecret"

$ApiUrl = gcloud run services describe blood-bank-api --platform managed --region $Region --format 'value(status.url)'
Write-Host "==> API Deployed at: $ApiUrl" -ForegroundColor Green

Write-Host "==> Deploying Frontend Web to Cloud Run..." -ForegroundColor Cyan
cd ../client
gcloud run deploy blood-bank-web `
    --source . `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --set-env-vars "VITE_API_URL=$ApiUrl/api"

$WebUrl = gcloud run services describe blood-bank-web --platform managed --region $Region --format 'value(status.url)'
Write-Host "==> Web Portal Deployed at: $WebUrl" -ForegroundColor Green
