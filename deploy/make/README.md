# ⚡ Make.com & Cloud Scheduler Automation Workflows — Aumveda

This directory contains production blueprints and setup instructions for triggering Aumveda lifecycle workflows via **Make.com** or **Google Cloud Scheduler (Cron)**, dispatching **Device Push Notifications**, **Transactional Emails**, and **WhatsApp messages**.

---

## 📋 Scenarios & Cron Endpoints

| Workflow | Make.com Blueprint | Cron Endpoint | Channels Delivered |
| :--- | :--- | :--- | :--- |
| **Daily Dose Broadcast** | `make_wf2_daily_dose_broadcast.json` | `GET /api/cron/daily-dose-broadcast` (05:45 AM IST) | 📱 Device Push Notification<br>📧 Rich HTML Morning Email<br>💬 WhatsApp Audio Template |
| **Course Re-engagement** | `make_wf5_course_reengagement.json` | `GET /api/cron/course-reengagement?days=4` (10:00 AM IST) | 📱 Device Notification<br>📧 Sejal Jain Motivation Email |
| **Crystal Fulfillment** | `make_wf4_crystal_fulfillment.json` | `POST /api/cron/crystal-fulfillment` (Webhook) | 🚚 Shiprocket Logistics Dispatch<br>📱 Dispatch Push Notification<br>🔮 Natal Consecration Ritual Email |

---

## 🛠️ Configuration & Environment Variables

Ensure these environment variables are configured in `.env` / Cloud Run Secret Manager:
```env
CRON_SECRET="your-secure-cron-secret-token"
FCM_SERVER_KEY="your-firebase-cloud-messaging-server-key"
EMAIL_SERVER_HOST="smtp.hostinger.com"
EMAIL_SERVER_PORT="465"
EMAIL_SERVER_USER="support@aumveda.com"
EMAIL_SERVER_PASSWORD="your-smtp-password"
EMAIL_FROM="Aumveda <support@aumveda.com>"
```

---

## ⏰ Option 1: Google Cloud Scheduler Setup (Native 100% Serverless Cron)

### 1. Daily Dose Morning Broadcast (05:45 AM IST / 00:15 UTC):
```bash
gcloud scheduler jobs create http aumveda-daily-dose-broadcast \
  --location=asia-south1 \
  --schedule="15 0 * * *" \
  --time-zone="Asia/Kolkata" \
  --uri="https://app.aumveda.com/api/cron/daily-dose-broadcast" \
  --http-method=GET \
  --headers="Authorization=Bearer YOUR_CRON_SECRET"
```

### 2. Course Re-engagement Monitor (Daily at 10:00 AM IST / 04:30 UTC):
```bash
gcloud scheduler jobs create http aumveda-course-reengagement \
  --location=asia-south1 \
  --schedule="30 4 * * *" \
  --time-zone="Asia/Kolkata" \
  --uri="https://app.aumveda.com/api/cron/course-reengagement?days=4" \
  --http-method=GET \
  --headers="Authorization=Bearer YOUR_CRON_SECRET"
```

---

## 🧩 Option 2: Make.com Setup (Visual Scenarios)

1. Log into your [Make.com](https://make.com) dashboard.
2. Click **Create a new scenario**.
3. In the bottom toolbar, click **... (More Options)** > **Import Blueprint**.
4. Select the JSON file (`make_wf2_daily_dose_broadcast.json`, `make_wf5_course_reengagement.json`, or `make_wf4_crystal_fulfillment.json`).
5. Set `AUMVEDA_APP_URL` and `CRON_SECRET` variables in the HTTP module.
6. Turn the scenario **ON**.
