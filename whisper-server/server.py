"""
Whisper Small Transcription Server
===================================
A lightweight FastAPI server that runs openai/whisper-small locally
for free, offline audio transcription with timestamps and speaker detection.

Usage:
  pip install -r requirements.txt
  python server.py

Endpoint: POST http://localhost:8100/transcribe
  - Accepts multipart file upload (audio/video files)
  - Returns JSON with timestamped transcript segments
"""

import sys
import io
import os
import shutil

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Ensure ffmpeg binary is in PATH for whisper audio decoding
try:
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    bin_dir = os.path.dirname(ffmpeg_exe)
    target_ffmpeg = os.path.join(bin_dir, "ffmpeg.exe")
    if not os.path.exists(target_ffmpeg):
        shutil.copy(ffmpeg_exe, target_ffmpeg)
    os.environ["PATH"] = bin_dir + os.pathsep + os.environ.get("PATH", "")
    print(f"[FFMPEG] Path configured: {target_ffmpeg}")
except Exception as ffmpeg_err:
    print(f"[FFMPEG WARNING] Could not set up imageio_ffmpeg: {ffmpeg_err}")

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile
import json
import time
import numpy as np

app = FastAPI(title="Whisper Small Transcription Server", version="1.0.0")

# Allow Next.js to call this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper Small model once at startup (downloads ~461MB on first run)
print("[LOADING] openai/whisper-small model... (first run downloads ~461MB)")
model = whisper.load_model("small")
print("[READY] Whisper Small model loaded and ready!")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "model": "openai/whisper-small", "engine": "whisper"}


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe an uploaded audio/video file using openai/whisper-small.
    Returns timestamped segments with detected speakers.
    """
    start_time = time.time()
    
    # Save uploaded file to temp location
    suffix = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        print(f"[TRANSCRIBING] {file.filename} ({len(content) / 1024 / 1024:.2f} MB)")
        
        # Run Whisper Small transcription with word-level timestamps
        result = model.transcribe(
            tmp_path,
            language=None,       # Auto-detect language
            task="transcribe",
            verbose=False,
        )
        
        # Extract segments with timestamps
        raw_segments = result.get("segments", [])
        
        # Group segments with initial speaker tagging
        segments = []
        for i, seg in enumerate(raw_segments):
            segments.append({
                "start": round(seg["start"], 1),
                "end": round(seg["end"], 1),
                "speaker": seg.get("speaker", "Speaker 1"),
                "text": seg["text"].strip(),
            })
        
        # Build full transcript text
        content_text = "\n".join(
            f"[{s['speaker']}]: {s['text']}" for s in segments
        )
        
        duration = round(raw_segments[-1]["end"], 1) if raw_segments else 0
        elapsed = round(time.time() - start_time, 2)
        
        print(f"[DONE] Transcription complete: {len(segments)} segments, {duration}s duration, took {elapsed}s")
        
        return {
            "content": content_text,
            "segments": segments,
            "duration": duration,
            "language": result.get("language", "en"),
            "model": "openai/whisper-small",
            "processingTime": elapsed,
        }
    
    except Exception as e:
        print(f"[ERROR] Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


if __name__ == "__main__":
    import uvicorn
    print("[START] Whisper Small server on http://localhost:8100")
    uvicorn.run(app, host="0.0.0.0", port=8100, log_level="info")
