# Production Dockerfile for Whisper Small Transcription Server
FROM python:3.11-slim

# Prevent Python from writing .pyc files & buffer stdout/stderr
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install system dependencies (FFmpeg & build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt imageio-ffmpeg

# Pre-download Whisper Small model weights during build for instant container startup
RUN python -c "import whisper; whisper.load_model('small')"

# Copy server application code
COPY . .

# Expose port 8100
EXPOSE 8100

# Start FastAPI server with uvicorn (reads PORT env var or defaults to 8100)
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8100}"]
