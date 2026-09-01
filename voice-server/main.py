"""Voice Over Studio API — Coqui XTTS v2 voice cloning backend."""

from __future__ import annotations

import os
import shutil
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
VOICES_DIR = BASE_DIR / "voices"
OUTPUTS_DIR = BASE_DIR / "outputs"

MODEL_NAME = "tts_models/multilingual/multi-dataset/xtts_v2"

LANGUAGES: list[dict[str, str]] = [
    {"code": "en", "name": "English"},
    {"code": "es", "name": "Spanish"},
    {"code": "fr", "name": "French"},
    {"code": "de", "name": "German"},
    {"code": "it", "name": "Italian"},
    {"code": "pt", "name": "Portuguese"},
    {"code": "pl", "name": "Polish"},
    {"code": "tr", "name": "Turkish"},
    {"code": "ru", "name": "Russian"},
    {"code": "nl", "name": "Dutch"},
    {"code": "cs", "name": "Czech"},
    {"code": "ar", "name": "Arabic"},
    {"code": "zh-cn", "name": "Chinese"},
    {"code": "ja", "name": "Japanese"},
    {"code": "hu", "name": "Hungarian"},
    {"code": "ko", "name": "Korean"},
    {"code": "hi", "name": "Hindi"},
]

LANGUAGE_CODES = {lang["code"] for lang in LANGUAGES}

_tts: Any | None = None
_model_error: str | None = None
_device: str = "cpu"


def _resolve_device() -> str:
    try:
        import torch

        if torch.cuda.is_available():
            return "cuda"
    except ImportError:
        pass
    return "cpu"


def _load_model() -> None:
    global _tts, _model_error, _device

    if _tts is not None:
        return

    try:
        from TTS.api import TTS

        _device = _resolve_device()
        _tts = TTS(MODEL_NAME).to(_device)
        _model_error = None
    except Exception as exc:  # noqa: BLE001
        _tts = None
        _model_error = str(exc)


def _ensure_model() -> None:
    if _tts is None:
        _load_model()
    if _tts is None:
        raise HTTPException(
            status_code=503,
            detail=_model_error or "TTS model is not loaded. Call POST /api/warmup first.",
        )


def _normalize_wav(src: Path, dest: Path) -> None:
    """Convert uploaded audio to mono 24 kHz WAV for XTTS."""
    data, sample_rate = sf.read(src, always_2d=False)
    if data.ndim > 1:
        data = np.mean(data, axis=1)

    target_rate = 24000
    if sample_rate != target_rate:
        try:
            import librosa

            data = librosa.resample(data.astype(np.float32), orig_sr=sample_rate, target_sr=target_rate)
            sample_rate = target_rate
        except ImportError:
            pass

    sf.write(dest, data, sample_rate, subtype="PCM_16")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    VOICES_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="Voice Over Studio API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class WarmupResponse(BaseModel):
    status: str
    device: str
    model: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str
    model: str
    error: str | None = None


class VoiceResponse(BaseModel):
    voice_id: str
    message: str


class SynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    voice_id: str
    language: str = "en"


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok" if _model_error is None else "degraded",
        model_loaded=_tts is not None,
        device=_device,
        model=MODEL_NAME,
        error=_model_error,
    )


@app.get("/api/languages")
async def languages() -> dict[str, list[dict[str, str]]]:
    return {"languages": LANGUAGES}


@app.post("/api/warmup", response_model=WarmupResponse)
async def warmup() -> WarmupResponse:
    _load_model()
    if _tts is None:
        raise HTTPException(status_code=503, detail=_model_error or "Failed to load model")
    return WarmupResponse(status="ready", device=_device, model=MODEL_NAME)


@app.post("/api/voices", response_model=VoiceResponse)
async def create_voice(
    audio: UploadFile = File(...),
    name: str | None = Form(default=None),
) -> VoiceResponse:
    if not audio.filename:
        raise HTTPException(status_code=400, detail="Audio file is required")

    voice_id = str(uuid.uuid4())
    voice_dir = VOICES_DIR / voice_id
    voice_dir.mkdir(parents=True, exist_ok=True)

    raw_path = voice_dir / "reference_raw"
    wav_path = voice_dir / "reference.wav"

    try:
        with raw_path.open("wb") as handle:
            shutil.copyfileobj(audio.file, handle)
        _normalize_wav(raw_path, wav_path)
    except Exception as exc:  # noqa: BLE001
        shutil.rmtree(voice_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=f"Invalid audio file: {exc}") from exc
    finally:
        raw_path.unlink(missing_ok=True)

    meta_path = voice_dir / "meta.txt"
    meta_path.write_text(name or voice_id, encoding="utf-8")

    return VoiceResponse(
        voice_id=voice_id,
        message="Voice sample saved. Ready for synthesis.",
    )


@app.post("/api/synthesize")
async def synthesize(payload: SynthesizeRequest) -> Response:
    _ensure_model()

    language = payload.language.lower()
    if language not in LANGUAGE_CODES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {payload.language}")

    voice_path = VOICES_DIR / payload.voice_id / "reference.wav"
    if not voice_path.exists():
        raise HTTPException(status_code=404, detail="Voice not found. Record and clone a voice first.")

    output_path = OUTPUTS_DIR / f"{uuid.uuid4()}.wav"

    try:
        _tts.tts_to_file(
            text=payload.text.strip(),
            speaker_wav=str(voice_path),
            language=language,
            file_path=str(output_path),
        )

        wav_bytes = output_path.read_bytes()
        return Response(
            content=wav_bytes,
            media_type="audio/wav",
            headers={"Content-Disposition": 'attachment; filename="voice-over-output.wav"'},
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {exc}") from exc
    finally:
        output_path.unlink(missing_ok=True)


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8765"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
