# 🔄 Self-Hosted n8n Lifecycle Automations for Aumveda

This directory contains the production workflows and infrastructure manifests for Aumveda's self-hosted **n8n automation cluster**.

---

## 📁 Workflow Inventory

| Workflow | File | Trigger | Description |
| :--- | :--- | :--- | :--- |
| **WF-2** | `workflows/wf2_daily_dose_broadcast.json` | Cron `05:45 AM IST` | Fetches daily prescription from Aumveda API and dispatches rich WhatsApp template with playable audio snippet. |
| **WF-5** | `workflows/wf5_course_reengagement.json` | Cron `10:00 AM IST` | Queries students with $>4$ days inactivity midway through course and sends encouraging voice memo/text from Sejal Jain. |
| **WF-4** | `workflows/wf4_crystal_fulfillment.json` | Webhook `Order Paid` | Dispatches orders containing physical crystals to Shiprocket warehouse API and emails personalized activation ritual based on natal chakra. |

---

## 🚀 Deployment Options

### Option A: Local / Docker Compose
1. Copy `.env.example` values into your environment:
   ```bash
   export N8N_HOST="n8n.aumveda.com"
   export POSTGRES_PASSWORD="your-secure-password"
   export WHATSAPP_PHONE_NUMBER_ID="your_phone_id"
   export WHATSAPP_CLOUD_API_TOKEN="your_token"
   export SHIPROCKET_API_TOKEN="your_token"
   ```
2. Start the cluster:
   ```bash
   cd deploy/n8n
   docker-compose up -d
   ```
3. Open `http://localhost:5678` and follow the on-screen admin setup.

### Option B: Google Cloud Run
Deploy using the Knative service specification:
```bash
gcloud run services replace deploy/n8n/cloudrun-n8n.yaml --region asia-south1
```

---

## 📥 Importing Workflows into n8n
1. Open your n8n Dashboard.
2. Click **Workflows** > **Import from File...**
3. Select `deploy/n8n/workflows/wf2_daily_dose_broadcast.json`, `wf5_course_reengagement.json`, and `wf4_crystal_fulfillment.json`.
4. Enable the workflows.

---

## 🔗 Integrated Webhook Endpoints

The Aumveda web application exposes dedicated endpoints protected by Bearer `N8N_WEBHOOK_SECRET`:
- `GET/POST /api/n8n/daily-dose-broadcast`
- `GET/POST /api/n8n/course-reengagement?days=4`
- `POST /api/n8n/crystal-fulfillment`
