# 🚀 Google Cloud Run Deployment Guide — Aumveda

This guide outlines the production deployment of the **Aumveda Web Application** onto **Google Cloud Run**.

---

## 🏗️ Architecture & Settings Overview

- **Runtime**: Node.js 20 (Linux Debian Slim container with OpenSSL & Prisma engines)
- **Container Output**: Next.js 14 `output: "standalone"`
- **Host & Port**: Binds to `0.0.0.0` with dynamic port binding via `$PORT` (defaults to `8080`)
- **Lifecycle**: Graceful shutdown on `SIGTERM` / `SIGINT` (10s drain window)
- **Health Check Endpoint**: `/api/health`
- **Recommended Cloud Run Parameters**:
  - Memory: `1 GiB`
  - CPU: `1 vCPU`
  - Concurrency: `80`
  - Startup CPU Boost: `Enabled` (reduces cold start latency by up to 50%)
  - Min instances: `0` (or `1` for zero cold-start latency)
  - Max instances: `10`

---

## 📋 Prerequisites

1. Install Google Cloud SDK (`gcloud` CLI):
   ```bash
   gcloud --version
   ```
2. Login to Google Cloud:
   ```bash
   gcloud auth login
   ```
3. Set your active Google Cloud project:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

---

## 🚀 Option 1: 1-Click Deployment via Deployment Script

### On Linux / macOS / Cloud Shell:
```bash
chmod +x deploy/cloudrun-deploy.sh
./deploy/cloudrun-deploy.sh
```

### On Windows PowerShell:
```powershell
.\deploy\cloudrun-deploy.ps1
```

---

## ⚡ Option 2: Direct `gcloud` Command

Deploy directly from source code in the `App` directory:

```bash
gcloud run deploy aumveda-web \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 80 \
  --cpu-boost \
  --set-env-vars "NODE_ENV=production,HOSTNAME=0.0.0.0"
```

---

## 🔨 Option 3: Google Cloud Build CI/CD

Trigger deployment via Google Cloud Build using `cloudbuild.yaml`:

```bash
gcloud builds submit --config=cloudbuild.yaml
```

---

## 🔑 Secret Manager & Cloud SQL Configuration

### 1. Provision Secrets via Script
Run `deploy/setup-secrets.sh` to initialize all secrets in Google Secret Manager and grant the Cloud Run compute service account access:

```bash
chmod +x deploy/setup-secrets.sh
./deploy/setup-secrets.sh
```

### 2. Populate Secret Values
Add values to the provisioned secrets:
```bash
echo -n "postgresql://..." | gcloud secrets versions add DATABASE_URL --data-file=-
echo -n "postgresql://..." | gcloud secrets versions add DIRECT_URL --data-file=-
echo -n "super-secret-hex" | gcloud secrets versions add NEXTAUTH_SECRET --data-file=-
echo -n "eyJ..." | gcloud secrets versions add SUPABASE_SERVICE_ROLE_KEY --data-file=-
echo -n "AIzaSy..." | gcloud secrets versions add GEMINI_API_KEY --data-file=-
echo -n "n8n-auth-token" | gcloud secrets versions add N8N_WEBHOOK_SECRET --data-file=-
echo -n "EAAB..." | gcloud secrets versions add META_CAPI_ACCESS_TOKEN --data-file=-
echo -n "ga4_secret_val" | gcloud secrets versions add GA4_API_SECRET --data-file=-
```

### 3. Connect to Google Cloud SQL (PostgreSQL)
When using Cloud SQL:
1. Attach instance via `--add-cloudsql-instances=PROJECT_ID:REGION:INSTANCE_NAME`
2. Set `DATABASE_URL` to Unix socket path:
   `postgresql://USER:PASSWORD@/DB_NAME?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME`

---

## 📡 Server-Side GTM Container & Attribution (`gtm.aumveda.com/collect`)

A dedicated GTM Server Container routes deduplicated events to **Meta Conversions API (CAPI)** and **Google Analytics 4 (GA4)**:

1. **Ingestion Endpoint**: `POST /api/v1/track/event` (and `/api/track/event`)
2. **GTM Server Endpoint**: `https://gtm.aumveda.com/collect` (configured via `GTM_SERVER_URL`)
3. **Core Events**:
   - `course_enrolled`: Course purchase & enrollment attribution
   - `purchase`: E-commerce & crystal shop orders
   - `daily_dose_completed`: Daily ritual completions
   - `portal_completed`: Astro-somatic intake completions
4. **Deduplication Mechanism**:
   - Web client emits `event_id` (CUID/UUID).
   - Server-side dispatcher sends the exact same `event_id` to GTM Server / Meta CAPI / GA4.
   - Meta & GA4 deduplicate identical client and server event IDs within a 48-hour window.
5. **Privacy Compliance (DPDP Act / GDPR)**:
   - PII (`em`, `ph`, `fn`, `ln`) is SHA-256 hashed on the server before dispatch.

---

## 🤖 Self-Hosted n8n Lifecycle Automations

Workflows located in `deploy/n8n/workflows/`:
1. `wf2_daily_dose_broadcast.json`: WhatsApp Daily Dose broadcast at 05:45 AM IST with audio snippets.
2. `wf5_course_reengagement.json`: Re-engagement nudges for students stalled $>4$ days.
3. `wf4_crystal_fulfillment.json`: Dispatches crystal orders to Shiprocket and emails personalized activation rituals.

To deploy n8n alongside Cloud Run, refer to `deploy/n8n/README.md`.

---

## 🌐 Custom Domain Mapping (e.g. `app.aumveda.com`)

1. Go to **Google Cloud Console** > **Cloud Run** > **Custom Domains**.
2. Click **Add Mapping** and select service `aumveda-web`.
3. Enter your domain (e.g. `app.aumveda.com` or `aumveda.com`).
4. Update your DNS records (CNAME / A / AAAA) with the Google-provided records.
5. Google Cloud automatically provisions and renews SSL certificates (Let's Encrypt / Google Trust Services).
