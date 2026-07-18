# 🩺 MedPulse AI

**MedPulse AI** is a metric-guided clinical profiling and diagnostic reasoning portal. It parses acute symptoms alongside vital signs — Blood Pressure (BP), Sugar Levels, Heart Rate, and Oxygen Saturation — to map clinical priority paths using a serverless AI reasoning layer.

🔗 **Live Demo:** [medical-analysis-chatbot.vercel.app](https://medical-analysis-chatbot.vercel.app/)

---

## ✨ Features

- 🧠 **AI-Powered Symptom Analysis** — Correlates reported symptoms with vital signs to generate clinical priority insights
- 📊 **Vital Sign Parsing** — Structured intake of BP, blood sugar, heart rate, and SpO2
- ⚡ **Serverless Architecture** — Fast, scalable API layer deployed on Vercel
- 💬 **Conversational Interface** — Chat-driven UX for natural symptom reporting
- 🔒 **Decoupled Monorepo** — Independent frontend/backend services for clean separation of concerns

---

## 🏗️ Project Architecture

This repository is structured as a monorepo containing decoupled frontend and backend services:

```text
Medical-Analysis-Chatbot/
├── backend-updated/
│   └── backend/             # Express.js Serverless Engine
│       ├── config/          # DB & environment configuration
│       ├── controllers/     # Request handling & AI reasoning logic
│       ├── routes/          # API endpoint routes (/api/analyze)
│       ├── server.js        # Vercel entry point (ES Module)
│       └── vercel.json      # Serverless rewrite configuration
└── frontend-updated/         # Vite + React Client Portal
    ├── src/
    │   ├── components/      # UI components
    │   ├── pages/            # Route-level views
    │   └── App.jsx
    └── vite.config.js
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js (Serverless) |
| Deployment | Vercel (Frontend + Backend) |
| AI Reasoning | LLM-based symptom-to-priority mapping |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/yarnagulagauravdeep-cyber/Medical-Analysis-Chatbot.git
cd Medical-Analysis-Chatbot
```

### 2. Setup Backend
```bash
cd backend-updated/backend
npm install
# Add your environment variables (.env)
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend-updated
npm install
npm run dev
```

---

## ⚠️ Disclaimer

MedPulse AI is built for **educational and demonstrational purposes only**. It does **not** provide medical advice, diagnosis, or treatment, and should never be used as a substitute for professional medical consultation. Always seek the advice of a qualified healthcare provider for any medical concerns.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
