#!/bin/bash

# Deploy ETL Service to Cloud Functions
# Usage: ./deploy.sh [project_id]

PROJECT_ID=${1:-"cail-backend-prod"}

echo "🚀 Deploying ETL Service to project: $PROJECT_ID"

gcloud functions deploy etl \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=. \
  --entry-point=etl \
  --trigger-http \
  --allow-unauthenticated \
  --memory=256MB \
  --timeout=60s \
  --project=$PROJECT_ID

if [ $? -eq 0 ]; then
  echo "✅ Deployment successful!"
  echo "📍 URL: https://us-central1-$PROJECT_ID.cloudfunctions.net/etl"
else
  echo "❌ Deployment failed"
  exit 1
fi
