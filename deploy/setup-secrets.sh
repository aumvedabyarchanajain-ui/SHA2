#!/usr/bin/env bash
# ==============================================================================
# Aumveda - Google Cloud Secret Manager Provisioning & IAM Binding
# ==============================================================================
set -e

PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Google Cloud Project ID not set in gcloud config."
  echo "👉 Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "🔐 Configuring Google Cloud Secret Manager for project: ${PROJECT_ID}"

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com --quiet

SECRETS=(
  "DATABASE_URL"
  "DIRECT_URL"
  "NEXTAUTH_SECRET"
  "SUPABASE_SERVICE_ROLE_KEY"
  "GEMINI_API_KEY"
  "N8N_WEBHOOK_SECRET"
  "META_CAPI_ACCESS_TOKEN"
  "GA4_API_SECRET"
  "EMAIL_SERVER_PASSWORD"
  "RAZORPAY_KEY_SECRET"
  "CASHFREE_SECRET_KEY"
)

echo "📦 Creating secrets if they do not already exist..."
for SECRET in "${SECRETS[@]}"; do
  if ! gcloud secrets describe "${SECRET}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
    echo "  ➕ Creating secret: ${SECRET}"
    gcloud secrets create "${SECRET}" \
      --replication-policy="automatic" \
      --project="${PROJECT_ID}" \
      --quiet
  else
    echo "  ✔️ Secret already exists: ${SECRET}"
  fi
done

# Grant Cloud Run default compute service account access to read secrets
PROJECT_NUMBER=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')
RUN_SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "🔑 Binding Secret Accessor role to Cloud Run Service Account: ${RUN_SERVICE_ACCOUNT}"
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${RUN_SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet

# If Cloud SQL is used, bind Cloud SQL client role
echo "🗄️ Binding Cloud SQL Client role to Cloud Run Service Account..."
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${RUN_SERVICE_ACCOUNT}" \
  --role="roles/cloudsql.client" \
  --quiet

echo "✨ Secret Manager provisioning and IAM configuration complete!"
echo "💡 To add a new secret value version: echo -n 'value' | gcloud secrets versions add SECRET_NAME --data-file=-"
