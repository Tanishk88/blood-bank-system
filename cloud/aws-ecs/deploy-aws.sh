#!/usr/bin/env bash
set -e

AWS_ACCOUNT_ID=${1:-""}
AWS_REGION=${2:-"us-east-1"}
CLUSTER_NAME=${3:-"blood-bank-cluster"}
SERVICE_NAME=${4:-"blood-bank-service"}

if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "Usage: ./deploy-aws.sh <AWS_ACCOUNT_ID> [REGION] [CLUSTER_NAME] [SERVICE_NAME]"
    exit 1
fi

echo "==> Authenticating with AWS ECR..."
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

echo "==> Building and Pushing Server Container..."
docker build -t blood-bank-server ../../server
docker tag blood-bank-server:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/blood-bank-server:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/blood-bank-server:latest"

echo "==> Building and Pushing Client Container..."
docker build -t blood-bank-client ../../client
docker tag blood-bank-client:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/blood-bank-client:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/blood-bank-client:latest"

echo "==> Registering ECS Task Definition..."
aws ecs register-task-definition --cli-input-json file://task-definition.json

echo "==> Rolling deployment on ECS Cluster..."
aws ecs update-service --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" --force-new-deployment --region "$AWS_REGION"

echo "==> Deployment initiated successfully!"
