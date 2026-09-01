# Voice Over Studio

Self-hosted voice cloning app powered by [Coqui XTTS v2](https://github.com/idiap/coqui-ai-TTS). Record a short voice sample, clone it locally, enter a script in one of 17 languages, and download the generated WAV.

## Features

- **Record or upload** a 6–20 second reference clip
- **Clone** your voice with XTTS v2 (runs on your machine)
- **17 languages**: English, Spanish, French, German, Italian, Portuguese, Polish, Turkish, Russian, Dutch, Czech, Arabic, Chinese, Japanese, Hungarian, Korean, Hindi
- **Generate & download** WAV output
- **Modern UI** — React + Vite + Tailwind CSS 4

## Requirements

- **Node.js** 18+ and npm
- **Python** 3.10+
- ~4 GB RAM (8 GB + NVIDIA GPU recommended for faster synthesis)
- First server run downloads the XTTS v2 model (~1.8 GB)

## Setup (Windows)

### 1. Clone this repository

```powershell
git clone -b voice-over-studio https://github.com/wongchinpangray-FantasySports/wongchinpangray.git voice-over-studio
cd voice-over-studio
```

Or if using a dedicated repo URL, replace the clone URL above.

### 2. Install frontend dependencies

```powershell
npm install
```

### 3. Set up the Python voice server

```powershell
cd voice-server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

> **Note:** Installing `coqui-tts` may take several minutes. A CUDA-enabled PyTorch build speeds up synthesis if you have an NVIDIA GPU.

## Run locally

Open **two terminals** from the project root.

### Terminal 1 — Voice server (port 8765)

```powershell
cd voice-server
.venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8765
```

### Terminal 2 — Frontend dev server

```powershell
npm run dev
```

Open **http://localhost:5173** in your browser.

The Vite dev server proxies `/api` requests to `http://localhost:8765/api`.

## Usage flow

1. Confirm the server status badge shows **online** (click **Load model** if needed).
2. **Record** or **upload** a WAV reference clip (at least 3 seconds; 6–20 seconds recommended).
3. Click **Clone voice** to register your reference.
4. Choose a **language**, enter your **script**, and click **Generate speech**.
5. **Preview** or **Download WAV**.

## Project structure

```
voice-over-studio/
├── README.md
├── package.json
├── vite.config.js
├── index.html
├── public/
│   └── favicon.svg
├── voice-server/
│   ├── main.py
│   ├── requirements.txt
│   ├── README.md
│   └── .gitignore
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── lib/
    │   ├── voiceApi.js
    │   ├── recordWav.js
    │   └── strings.js
    ├── components/
    │   ├── VoiceRecorder.jsx
    │   ├── ScriptEditor.jsx
    │   ├── GeneratedAudio.jsx
    │   └── ServerStatus.jsx
    └── pages/
        └── VoiceStudio.jsx
```

## Production build

```powershell
npm run build
npm run preview
```

For production, serve the `dist/` folder and run the voice server separately. Configure your reverse proxy to forward `/api` to the FastAPI server on port 8765.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Server shows offline | Start uvicorn on port 8765 |
| Model load fails | Ensure Python 3.10+, enough disk/RAM; check terminal logs |
| Microphone denied | Allow mic access in browser settings |
| Chinese not working | Use language code `zh-cn` (handled automatically in UI) |
| Slow synthesis | Use a GPU; first generation is slower while model warms up |

## License

MIT — Coqui TTS is subject to its own license (see [Coqui TTS](https://github.com/idiap/coqui-ai-TTS)).
