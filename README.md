# 🛡️ VisionPlus – Privacy-Preserving AI Surveillance System

<div align="center">

### AI-Powered Crowd Monitoring & Public Safety Analytics Platform

**An intelligent surveillance solution that detects crowd anomalies, suspicious activities, and safety threats while preserving user privacy.**

![React](https://img.shields.io/badge/Frontend-React-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![YOLO](https://img.shields.io/badge/AI-YOLO-red)
![OpenCV](https://img.shields.io/badge/Computer%20Vision-OpenCV-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

---

## 📌 Project Overview

VisionPlus is an AI-powered surveillance platform designed to improve public safety through intelligent video analytics. The system processes live CCTV streams or uploaded videos to detect crowd density, suspicious activities, and safety threats while protecting individual privacy by avoiding facial identification.

The platform provides real-time monitoring, AI-powered analytics, alert generation, investigation tools, and downloadable reports for security personnel and administrators.

---

## ✨ Key Features

### 🎥 Smart Surveillance
- Live CCTV Monitoring
- Video Upload & Analysis
- Real-time Person Detection
- Crowd Counting
- Multi-Camera Support

### 🤖 AI Analytics
- YOLO-based Person Detection
- Crowd Density Estimation
- Object Tracking
- Heatmap Generation
- Risk Score Calculation
- Suspicious Activity Detection
- Entry & Exit Counting

### 🔒 Privacy-Preserving AI
- No Facial Recognition
- Face Anonymization Support
- Behavior-Based Analysis
- Privacy-First Architecture

### 📊 Dashboard
- Live Analytics
- Crowd Statistics
- Risk Level Monitoring
- Active Alerts
- Camera Status
- AI Investigation Dashboard

### 📄 Reports
- PDF Report Generation
- CSV Export
- JSON Export
- Incident Summary
- Crowd Analytics

---

## 🏗️ Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- FastAPI
- SQLAlchemy
- JWT Authentication
- Alembic
- SQLite

### AI & Computer Vision
- YOLO
- OpenCV
- NumPy
- Pillow

### Deployment
- Vercel (Frontend)
- Render (Backend)
- Docker

---

## 📂 Project Structure

```text
VisionPlus/
│
├── backend/
│   ├── app/
│   ├── ai_models/
│   ├── uploads/
│   ├── reports/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/G-JAYASEELAN17/VISIONPLUS-SAFEVISION.git
cd VisionPlus
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Live Demo

**Frontend:** https://visionplus-safevision-eight.vercel.app

**Backend API:** https://visionplus-safevision.onrender.com

**API Documentation:** https://visionplus-safevision.onrender.com/docs

---

## 🔄 Workflow

```text
Video Input
      │
      ▼
YOLO Person Detection
      │
      ▼
Object Tracking
      │
      ▼
Crowd Analysis
      │
      ▼
Risk Assessment
      │
      ▼
Alert Generation
      │
      ▼
Dashboard & Reports
```

---

## 🎯 Applications

- Smart Cities
- Railway Stations
- Airports
- Shopping Malls
- Stadiums
- Educational Institutions
- Public Events
- Industrial Facilities

---

## 🚀 Future Enhancements

- Weapon Detection
- Fire & Smoke Detection
- Fall Detection
- Multi-Camera Analytics
- Mobile Application
- Edge AI Deployment
- Predictive Crowd Risk Analysis

---

# 👨‍💻 Team VisionForge

| Name | Role |
|------|------|
| **Jayaseelan G** | AI & Backend Development |
| **Sakthivel S** | Frontend Development |
| **Dinesh M** | AI Integration & Testing |
| **Guna M** | Frontend Development & UI|UX |

---

## 🙏 Acknowledgements

- FastAPI
- React
- OpenCV
- YOLO
- Docker
- Vercel
- Render

---

## 📜 License

This project is licensed under the MIT License.

---

<div align="center">

### ⭐ If you found this project interesting, please consider giving it a Star!

**Built with ❤️ by Team VisionForge**

</div>
