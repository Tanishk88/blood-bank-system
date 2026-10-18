# 🩸 HemoSync - Cloud-Native Blood Bank Management System

**HemoSync** is a production-ready, full-stack Cloud Blood Bank Management System built with the **MERN Stack** (MongoDB, Express.js, React 18, Node.js 20) and containerized with **Docker** for deployment on **AWS (ECS Fargate)**, **Google Cloud Run**, or any container platform.

---

## 🌟 Key Features

### 1. 🛡️ Role-Based Access Control (RBAC)
- **Administrator**: Full oversight of bank inventory, threshold controls, donor approval, and requisition authorizations.
- **Hospital / Clinic**: Instant emergency blood request submissions tagged by urgency (`Normal`, `Urgent`, `Critical`), real-time tracking, and fulfillment confirmation.
- **Volunteer Donor**: Profile management, donation history tracking, and medical eligibility verification.

### 2. 🧪 Automated Blood Inventory Tracking
- Real-time stock levels for all 8 standard ABO and Rh blood groups (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`).
- Configurable minimum reserve thresholds with automated low-stock and critical-shortage warning alerts.
- Automated stock decrementing upon request approval and stock incrementing upon verified donation intake.
- Interactive blood group compatibility matrix (who can donate to whom and who can receive from whom).

### 3. 👥 Donor Registry & Safety Compliance
- Medical criteria enforcement: age restrictions (18–65), minimum body weight (45 kg), and the standard **56-day medical deferral rule** between whole-blood donations.
- Clinical session logging: Hemoglobin level (g/dL), blood pressure, and session notes.

### 4. 🚑 Emergency Blood Request Workflow
- Triage queues prioritized by urgency level.
- Automated inventory check prevents approving requisitions exceeding available blood storage.
- Audit trail recording timestamps and administrative notes.

### 5. 📊 Real-Time Analytics & Dashboards
- Supply vs. demand distribution charts.
- Key performance metrics: hospital fulfillment rate, active emergency surge count, and donor registry growth.

### 6. ☁️ Cloud & Container Ready
- **Multi-stage Docker builds** for optimized image size and security (non-root runner).
- Production **Nginx** configuration for frontend Single-Page Application (SPA) routing and reverse proxying.
- Pre-configured deployment scripts for **AWS ECS Fargate** and **Google Cloud Run**.
- Zero-downtime health probe endpoint at `/health`.

---

## 🏗️ Architecture & Project Structure

```
blood-bank-system/
├── server/                    # Express.js REST API Backend
│   ├── Dockerfile             # Multi-stage production container
│   ├── .env.example           # Environment variable template
│   └── src/
│       ├── config/            # Mongoose DB connection & Atlas support
│       ├── models/            # User, BloodStock, Donor, Donation, BloodRequest
│       ├── middleware/        # JWT auth & error handling
│       ├── controllers/       # Business logic & automated stock deductions
│       ├── routes/            # REST API endpoints
│       ├── seeds/             # Database initialization script
│       └── index.js           # Express application entry & /health probe
├── client/                    # React 18 + Vite + Tailwind CSS Frontend
│   ├── Dockerfile             # Multi-stage Nginx container build
│   ├── nginx.conf             # Nginx SPA router & API proxy configuration
│   └── src/
│       ├── context/           # AuthContext (JWT session state)
│       ├── services/          # Axios API service
│       ├── components/        # Navbar, Sidebar, StatCards, Modals
│       └── pages/             # Dashboard, Inventory, Donors, Requests, Analytics, Cloud Guide
└── cloud/                     # Cloud Deployment Blueprints
    ├── docker-compose.yml     # Full-stack local / EC2 deployment
    ├── aws-ecs/               # AWS ECS Task Definition & deploy scripts
    ├── gcp-cloudrun/          # Cloud Run deploy scripts & Cloud Build CI/CD
    └── README.md              # Cloud deployment documentation
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

### 1. Database Seeding (Pre-loads Demo Accounts & Inventory)
```bash
cd server
npm install
npm run seed
```

This seeds the system with demo accounts:
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@bloodbank.org` | `admin123` |
| **Hospital** | `hospital@citycare.org` | `hospital123` |
| **Donor** | `donor@example.com` | `donor123` |

### 2. Start the Backend API
```bash
cd server
npm run dev
```
*API runs on `http://localhost:5000` with health probe at `http://localhost:5000/health`.*

### 3. Start the Frontend Web Portal
In a new terminal:
```bash
cd client
npm install
npm run dev
```
*Web Portal runs on `http://localhost:3000`.*

---

## ☁️ Cloud Deployment Blueprints

Detailed instructions with step-by-step commands are available in the [cloud/README.md](file:///C:/Users/Suryavanshi%20Tanishk/.gemini/antigravity/scratch/blood-bank-system/cloud/README.md) file and within the interactive **Cloud Deployment** tab in the web application.

### A. Deploy to Google Cloud Run (Serverless)
```bash
# 1. Deploy API
cd server
gcloud run deploy blood-bank-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI="<YOUR_MONGODB_ATLAS_URI>",JWT_SECRET="<SECRET>"

# 2. Deploy Web Portal
cd ../client
gcloud run deploy blood-bank-web \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars VITE_API_URL="<DEPLOYED_API_URL>/api"
```

### B. Deploy to AWS ECS (Fargate)
```bash
# Automated PowerShell deployment
cd cloud/aws-ecs
./deploy-aws.ps1 -AwsAccountId <YOUR_ACCOUNT_ID> -Region us-east-1
```

### C. Deploy via Docker Compose (Cloud VM / EC2)
```bash
cd cloud
docker compose up -d --build
```

---

## 📋 API Reference

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/health` | Container health check probe | Public |
| `POST` | `/api/auth/register` | Register new Donor or Hospital | Public |
| `POST` | `/api/auth/login` | User login (returns JWT) | Public |
| `GET` | `/api/inventory` | View all blood stocks & low-stock alerts | Public |
| `PUT` | `/api/inventory/:bloodGroup` | Adjust units or threshold | Admin |
| `GET` | `/api/donors` | List donors with search & filters | Authenticated |
| `POST` | `/api/donors` | Register a new donor | Authenticated |
| `POST` | `/api/donors/:id/donate` | Log donation (increments stock) | Admin |
| `GET` | `/api/requests` | List blood requests | Authenticated |
| `POST` | `/api/requests` | Submit emergency blood request | Hospital / Admin |
| `PUT` | `/api/requests/:id/status` | Approve/Reject request (deducts stock) | Admin |
| `GET` | `/api/analytics/dashboard` | Dashboard metrics & supply stats | Authenticated |
