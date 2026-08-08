FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

# Avoid prompt during package installation
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Explicitly install PyTorch CUDA 12.1 wheel first for bitsandbytes GPU support
RUN pip3 install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cu121

# Install python requirements
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Download spaCy English model
RUN python3 -m spacy download en_core_web_sm

# Copy application source
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]