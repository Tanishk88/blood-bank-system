# AWS ECS Automated Deployment Script (PowerShell)
param (
    [Parameter(Mandatory=$true)][string]$AwsAccountId,
    [Parameter(Mandatory=$false)][string]$Region = "us-east-1",
    [Parameter(Mandatory=$false)][string]$ClusterName = "blood-bank-cluster",
    [Parameter(Mandatory=$false)][string]$ServiceName = "blood-bank-service"
)

Write-Host "==> Logging in to Amazon ECR..." -ForegroundColor Cyan
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$AwsAccountId.dkr.ecr.$Region.amazonaws.com"

Write-Host "==> Building and Pushing Backend Server Image..." -ForegroundColor Cyan
docker build -t blood-bank-server ../../server
docker tag blood-bank-server:latest "$AwsAccountId.dkr.ecr.$Region.amazonaws.com/blood-bank-server:latest"
docker push "$AwsAccountId.dkr.ecr.$Region.amazonaws.com/blood-bank-server:latest"

Write-Host "==> Building and Pushing Frontend Client Image..." -ForegroundColor Cyan
docker build -t blood-bank-client ../../client
docker tag blood-bank-client:latest "$AwsAccountId.dkr.ecr.$Region.amazonaws.com/blood-bank-client:latest"
docker push "$AwsAccountId.dkr.ecr.$Region.amazonaws.com/blood-bank-client:latest"

Write-Host "==> Registering Task Definition..." -ForegroundColor Cyan
aws ecs register-task-definition --cli-input-json file://task-definition.json

Write-Host "==> Updating ECS Service with New Deployment..." -ForegroundColor Cyan
aws ecs update-service --cluster $ClusterName --service $ServiceName --force-new-deployment --region $Region

Write-Host "==> Deployment initiated successfully!" -ForegroundColor Green
