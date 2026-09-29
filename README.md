# 🚗 RepairTrace

**RepairTrace** is a next-generation, AI-powered auto repair shop management system. It modernizes the interaction between customers, service advisors, and technicians by integrating real-time communication, interactive 3D vehicle dashboards, and AI-driven damage detection using Gemini Vision.

## ✨ Key Features

*   **🤖 AI Damage Detection:** Technicians can upload photos of vehicles, and the system uses Gemini Vision AI to automatically detect issues, estimate severity, and recommend actions (tracked via `AIFinding` and `AIUsageLog`).
*   **🏎️ 3D Customer Dashboard:** Built with React Three Fiber, allowing customers to view a 3D model of their vehicle and interact with areas requiring maintenance or repair.
*   **⚡ Real-Time Updates:** WebSockets (Django Channels) keep customers and advisors in sync with real-time notifications, chat, and status updates.
*   **📱 QR Code Vehicle Check-in:** Generate and scan unique QR codes for vehicles to instantly access service history and check-in status.
*   **👥 Role-Based Access:** Dedicated interfaces and permission scopes for Customers, Service Advisors, and Technicians.
*   **💳 Subscription & Payment Tracking:** Manage customer loyalty points, subscription plans, and invoice statuses.

## 🛠️ Tech Stack

**Frontend (Vercel)**
*   React 19 + TypeScript
*   Vite
*   Tailwind CSS
*   React Three Fiber / Drei / Rapier (3D rendering and physics)
*   GSAP / Framer Motion (Animations)
*   Zustand (State Management)

**Backend (Render)**
*   Django 5.0 (Python 3.11)
*   Django REST Framework
*   Celery (Background Tasks)
*   Redis (Message Broker & Cache)
*   PostgreSQL (Primary Database)
*   Daphne (ASGI Server for WebSockets)

## 🚀 Deployment Instructions

This project is configured for a split deployment: the backend on Render and the frontend on Vercel.

### 1. Backend (Render)
The project includes a `render.yaml` blueprint for one-click deployment.
1. Sign in to Render and create a **New Blueprint**.
2. Connect this repository.
3. Render will automatically provision the PostgreSQL Database, Redis instance, Celery Worker, and Django Web Service.
4. Add the following Environment Variables to the `jango-backend` Web Service:
   * `AI_PROVIDER` (e.g., `gemini`)
   * `AI_API_KEY` (Your Google Gemini API Key)
   * `AI_MODEL` (e.g., `gemini-1.5-flash`)
   * `RESET_DB_ON_DEPLOY` (Set to `true` for the first deploy to initialize the DB, then remove it).

### 2. Frontend (Vercel)
The project includes a `vercel.json` optimized for Single Page Applications.
1. Sign in to Vercel and create a **New Project**.
2. Import this repository.
3. Set the **Root Directory** to `frontend`.
4. Add the following Environment Variable:
   * `VITE_API_URL` (Set to your deployed backend URL, e.g., `https://jango-backend.onrender.com/api/v1`)
5. Click **Deploy**.

## 💻 Local Development

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```
