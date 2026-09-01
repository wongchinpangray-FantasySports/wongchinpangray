# Voice Over Studio — Server

Self-hosted voice cloning API powered by [Coqui XTTS v2](https://github.com/idiap/coqui-ai-TTS) (multilingual, 17 languages).

## Requirements

- Python 3.10+
- ~4 GB RAM (8 GB + NVIDIA GPU recommended for faster synthesis)
- First run downloads the XTTS v2 model (~1.8 GB)

## Setup (Windows)

```powershell
cd voice-server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```powershell
uvicorn main:app --host 0.0.0.0 --port 8765
```

Or:

```powershell
python main.py
```

The API listens on `http://localhost:8765`.

## Warmup

Load the model before first synthesis (optional — synthesis auto-loads if needed):

```powershell
curl -X POST http://localhost:8765/api/warmup
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server and model status |
| GET | `/api/languages` | Supported XTTS v2 languages |
| POST | `/api/warmup` | Pre-load the TTS model |
| POST | `/api/voices` | Upload reference audio (`audio` file field) |
| POST | `/api/synthesize` | Generate speech from text + cloned voice |

### Create voice

```powershell
curl -X POST http://localhost:8765/api/voices -F "audio=@reference.wav"
```

### Synthesize

```powershell
curl -X POST http://localhost:8765/api/synthesize ^
  -H "Content-Type: application/json" ^
  -d "{\"text\":\"Hello world\",\"voice_id\":\"<uuid>\",\"language\":\"en\"}" ^
  --output output.wav
```

## Frontend Integration

The Vite dev server proxies `/api` → `http://localhost:8765/api`. Start both:

```powershell
# Terminal 1 — backend
cd voice-server
.venv\Scripts\activate
uvicorn main:app --port 8765

# Terminal 2 — frontend
npm run dev
```

Open `http://localhost:5173`.

## Notes

- Reference audio works best at 6–20 seconds of clean speech.
- Chinese language code is `zh-cn`, not `zh`.
- Voice samples are stored locally in `voices/` (gitignored).
