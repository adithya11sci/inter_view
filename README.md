# Sona: Professional Interview Assistant 🎙️🤖

Sona is a 3D virtual interview coach that helps users practice technical and behavioral interviews through voice-based, animated conversations.

## ✨ Features
- 3D avatar with real-time facial animation and lip sync
- Professional interview-style responses powered by Groq LLM APIs
- Voice generation using Microsoft Edge TTS voices
- Full-stack architecture with React frontend + Node/FastAPI backend

## 🧱 Project Structure
```text
Sona - FRONTEND/   # React + Vite + React Three Fiber UI
Sona - BACKEND/    # Node.js orchestrator + FastAPI LLM service
```

## 🛠️ Tech Stack
- Frontend: React, Vite, TailwindCSS, Three.js (@react-three/fiber, @react-three/drei)
- Backend API: Node.js + Express
- AI Service: FastAPI + Groq SDK
- TTS: `edge-tts` CLI
- Lip Sync: Rhubarb Lip Sync (optional fallback supported)

## ✅ Prerequisites
- Node.js 18+
- Python 3.9+
- FFmpeg + FFprobe (must be available in `PATH`)
- `edge-tts` CLI (install via pip)
- Rhubarb Lip Sync (optional, for higher quality lip sync)

## 🔐 Environment Variables
Create `Sona - BACKEND/.env` with:

```env
GROQ_API_KEY=your_groq_api_key
```

> `GROQ_API_KEY` is required for `main.py` to generate responses.

## 🚀 Setup

### 1) Backend setup (Node + Python)
```bash
cd "Sona - BACKEND"

# Node dependencies
npm install

# Python environment
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Ensure edge-tts is installed
pip install edge-tts
```

### 2) Frontend setup
```bash
cd "Sona - FRONTEND"
npm install
```

## ▶️ Run the App
Start all 3 processes in separate terminals.

1. FastAPI LLM service (port `8000`)
```bash
cd "Sona - BACKEND"
venv\Scripts\activate
python main.py
```

2. Node orchestration API (port `3000`)
```bash
cd "Sona - BACKEND"
npm run dev
```

3. Frontend app (default Vite port `5173`)
```bash
cd "Sona - FRONTEND"
npm run dev
```

Open: http://localhost:5173

## 🔌 Main API Endpoints
- `GET /` — health check
- `GET /voices` — available TTS voices
- `POST /chat` — interview response + audio + lipsync payload

## 🧪 Troubleshooting
- If TTS fails, verify `edge-tts` is installed and available in `PATH`.
- If lip sync file generation fails, install Rhubarb or rely on the built-in basic lip-sync fallback.
- If AI calls fail, confirm `GROQ_API_KEY` is set and FastAPI is running on port `8000`.

## 📄 License
MIT
