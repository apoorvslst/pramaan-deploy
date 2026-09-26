"""
PRAMAN (प्रमाण) — AI Microservice Entry Point
FastAPI application bootstrap with CORS, health check, and router mounts.

Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from config import settings
from routers import (
    tender_routes,
    document_routes,
    forensics_routes,
    cartel_routes,
    assistant_routes,
    pipeline_routes,
    signature_routes,
)


# ──────────────────────────────────────────────
#  Application Lifespan (startup/shutdown)
# ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup: Create required directories
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.TEMP_DIR, exist_ok=True)
    os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
    print("=" * 60)
    print("  🚀 PRAMAN AI Microservice Starting...")
    print(f"  📡 Environment: {settings.ENVIRONMENT}")
    print(f"  🤖 Primary LLM: Groq ({settings.GROQ_MODEL})")
    print(f"  🔮 Fallback LLM: Gemini ({settings.GEMINI_MODEL})")
    print(f"  📂 Uploads: {os.path.abspath(settings.UPLOAD_DIR)}")
    print("=" * 60)
    yield
    # Shutdown
    print("  🛑 PRAMAN AI Microservice shutting down...")


# ──────────────────────────────────────────────
#  FastAPI Application
# ──────────────────────────────────────────────

app = FastAPI(
    title="PRAMAN AI Microservice",
    description=(
        "Next-Gen AI-Powered Statutory Verification, Forensics & Cartel Detection "
        "for GeM & Public Procurement. Provides OCR extraction, document forensics, "
        "QR verification, collusion graph analysis, and RAG-based officer assistance."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ──────────────────────────────────────────────
#  CORS Middleware (allow frontend & backend)
# ──────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite React frontend
        "http://localhost:5000",   # Express backend
        "http://localhost:3000",   # Alternate frontend port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
#  Health Check
# ──────────────────────────────────────────────

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for monitoring and backend connectivity tests."""
    return {
        "status": "ok",
        "service": "PRAMAN AI Microservice",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "llm": {
            "primary": f"groq/{settings.GROQ_MODEL}",
            "fallback": f"gemini/{settings.GEMINI_MODEL}",
        },
    }


# ──────────────────────────────────────────────
#  Mount Routers
# ──────────────────────────────────────────────

# Phase 2: Tender Rule Extraction
app.include_router(
    tender_routes.router,
    prefix="/api/v1/tender",
    tags=["Tender Rule Extraction"],
)

# Phase 3: Document Classification & OCR
app.include_router(
    document_routes.router,
    prefix="/api/v1/document",
    tags=["Document Intelligence & OCR"],
)

# Phase 4+5: Forensics & QR Verification
app.include_router(
    forensics_routes.router,
    prefix="/api/v1/forensics",
    tags=["Forensics & Tampering Detection"],
)

# Phase 6: Cartel & Collusion Detection
app.include_router(
    cartel_routes.router,
    prefix="/api/v1/cartel",
    tags=["Cartel & Collusion Detection"],
)

# Phase 8: RAG Officer Assistant
app.include_router(
    assistant_routes.router,
    prefix="/api/v1/assistant",
    tags=["RAG Officer Assistant"],
)

# Phase 9: Unified Verification Pipeline
app.include_router(
    pipeline_routes.router,
    prefix="/api/v1/pipeline",
    tags=["Unified Verification Pipeline"],
)

# Signature Intelligence & Collusion Verification
app.include_router(
    signature_routes.router,
    prefix="/api/v1/signature",
    tags=["Signature Intelligence & Verification"],
)


# ──────────────────────────────────────────────
#  Run directly with: python main.py
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
