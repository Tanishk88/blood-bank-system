#!/usr/bin/env bash
set -e

PROJECT_ID=${1:-""}
MONGO_URI=${2:-""}
REGION=${3:-"us-central1"}
JWT_SECRET=${4:-"prod_secret_token_123"}

if [ -z "$PROJECT_ID" ] || [ -z "$MONGO_URI" ]; then
    echo "Usage: ./deploy-cloudrun.sh <GCP_PROJECT_ID> <MONGODB_ATLAS_URI> [REGION] [JWT_SECRET]"
    exit 1
fi

echo "==> Configuring GCP Project: $PROJECT_ID..."
gcloud config set project "$PROJECT_ID"

echo "==> Enabling Cloud Run API..."
gcloud services enable run.googleapis.com artifactregistry.googleapis.com

echo "==> Deploying Backend API to Cloud Run..."
cd ../../server
gcloud run deploy blood-bank-api \
    --source . \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --set-env-vars "NODE_ENV=production,PORT=8080,MONGODB_URI=$MONGO_URI,JWT_SECRET=$JWT_SECRET"

API_URL=$(gcloud run services describe blood-bank-api --platform managed --region "$REGION" --format 'value(status.url)')
echo "==> API Deployed at: $API_URL"

echo "==> Deploying Frontend Web to Cloud Run..."
cd ../client
gcloud run deploy blood-bank-web \
    --source . \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --set-env-vars "VITE_API_URL=$API_URL/api"

WEB_URL=$(gcloud run services describe blood-bank-web --platform managed --region "$REGION" --format 'value(status.url)')
echo "==> Web Portal Deployed at: $WEB_URL"
