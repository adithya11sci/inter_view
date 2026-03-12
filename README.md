# Sona: Professional Interview Assistant 🎙️🤖

Sona is a state-of-the-art 3D Virtual AI Assistant designed to help professionals and students prepare for technical and behavioral interviews. Combining the power of local LLMs with advanced 3D character animation and high-quality voice synthesis, Sona provides an immersive mock interview experience.

---

## ✨ Features

- **Professional Persona**: Highly experienced technical interviewer persona powered by DeepSeek-R1.
- **3D Interactive Avatar**: Realistic 3D character with lip-sync and dynamic facial expressions.
- **Voice Synthesis**: Premium AI voices powered by ElevenLabs.
- **Local & Fast**: Logic runs locally using Ollama for privacy and speed.
- **Responsive Web UI**: Built with React, Three.js, and TailwindCSS for a premium feel.

---

## 🛠️ Technology Stack

- **Frontend**: React, React Three Fiber (Three.js), TailwindCSS, Vite.
- **Backend (Logic)**: Node.js (Express) for orchestration.
- **Backend (AI)**: FastAPI (Python) for LLM management.
- **Intelligence**: DeepSeek-R1 (via Ollama).
- **Voice**: ElevenLabs API with `eleven_multilingual_v2` support.
- **Lip-Sync**: Rhubarb Lip Sync.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)
- **Ollama**: [Download here](https://ollama.com/)
- **Rhubarb Lip-Sync**: Ensure the binary is available.

### 2. Setup Ollama
Pull the required model:
```bash
ollama pull deepseek-r1:1.5b
```

### 3. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd "Sona - BACKEND"
# Install Python dependencies
python -m venv venv
./venv/Scripts/activate # Windows
pip install -r requirements.txt

# Install Node dependencies
npm install
```

Create a `.env` file in `Sona - BACKEND`:
```properties
ELEVEN_LABS_API_KEY=your_api_key_here
```

### 4. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd "Sona - FRONTEND"
npm install
```

---

## 🚦 Running the Application

You need to start three services:

1. **Python AI Server**:
   ```bash
   cd "Sona - BACKEND"
   ./venv/Scripts/activate
   python main.py
   ```

2. **Node Orchestrator**:
   ```bash
   cd "Sona - BACKEND"
   npm run dev
   ```

3. **Web Interface**:
   ```bash
   cd "Sona - FRONTEND"
   npm run dev
   ```

Open **[http://localhost:5173](http://localhost:5173)** to start your interview practice!

---

## 📸 Screenshots & Demo

Watch Sona in action and view her 3D capabilities:

[![Sona Demo Video](https://github.com/Addhithya/Sona/blob/main/Sona%20-%20FRONTEND/public/Screenshot%202024-08-10%20at%2022.29.15.png)](https://github.com/Addhithya/Sona/blob/main/Sona%20-%20FRONTEND/public/3D%20chatbot%20demo720p.mp4)

---

## 📄 License
This project is licensed under the MIT License.
