FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    NODE_ENV=production \
    PORT=10000

# Install Python 3, pip, and native C-libraries required by pyzbar, OpenCV, and RapidOCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    libzbar0 \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    poppler-utils \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies first for Docker layer caching
COPY package*.json ./
RUN npm install

# Install Python AI microservice dependencies
COPY ai/requirements.txt ./ai/
RUN python3 -m pip install --no-cache-dir --break-system-packages -r ai/requirements.txt

# Copy application source
COPY . .

EXPOSE 10000

CMD ["node", "server.js"]
