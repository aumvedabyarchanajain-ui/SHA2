#!/usr/bin/env bash
# ==============================================================================
# Aumveda - Google Cloud Run Deployment Script (Bash)
# ==============================================================================
set -e

SERVICE_NAME="${SERVICE_NAME:-aumveda-web}"
REGION="${REGION:-asia-south1}"
CLOUD_SQL_INSTANCE="${CLOUD_SQL_INSTANCE:-}"
GTM_SERVER_URL="${GTM_SERVER_URL:-https://gtm.aumveda.com/collect}"
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Google Cloud Project ID not set in gcloud config."
  echo "👉 Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "🚀 Starting Google Cloud Run deployment for ${SERVICE_NAME} in ${REGION} (Project: ${PROJECT_ID})..."

# 1. Enable required GCP APIs
echo "🔌 Ensuring required GCP APIs are enabled..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com \
  --quiet

# 2. Prepare Cloud SQL flag if specified
SQL_FLAG=""
if [ -n "$CLOUD_SQL_INSTANCE" ]; then
  SQL_FLAG="--add-cloudsql-instances=${CLOUD_SQL_INSTANCE}"
fi

# 3. Deploy directly from source to Cloud Run
echo "🏗️ Building container image and deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 80 \
  --cpu-boost \
  ${SQL_FLAG} \
  --set-env-vars "NODE_ENV=production,HOSTNAME=0.0.0.0,GTM_SERVER_URL=${GTM_SERVER_URL}" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,DIRECT_URL=DIRECT_URL:latest,NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest,N8N_WEBHOOK_SECRET=N8N_WEBHOOK_SECRET:latest,META_CAPI_ACCESS_TOKEN=META_CAPI_ACCESS_TOKEN:latest,GA4_API_SECRET=GA4_API_SECRET:latest"

# 4. Retrieve service URL
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --region "${REGION}" --format='value(status.url)')
echo "✨ Deployment successful!"
echo "🌐 Aumveda Service URL: ${SERVICE_URL}"
