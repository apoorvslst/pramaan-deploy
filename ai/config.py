"""
PRAMAN AI Microservice — Application Settings & Constants
Loads environment variables and defines global configuration.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    # --- Server ---
    PORT: int = Field(default=8000, description="FastAPI server port")
    HOST: str = Field(default="0.0.0.0", description="Server host")
    ENVIRONMENT: str = Field(default="development")

    # --- LLM: Groq ---
    GROQ_API_KEY: str = Field(default="", description="Groq Cloud API key")
    GROQ_MODEL: str = Field(default="openai/gpt-oss-120b")
    FALLBACK_GROQ_MODEL: str = Field(default="qwen/qwen3.8-27b")

    # --- LLM: Gemini ---
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API key")
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash")

    # --- LLM: Ollama (Local Fallback) ---
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434")
    OLLAMA_MODEL: str = Field(default="llama3.1")

    # --- RAG: Vector Store ---
    CHROMA_PERSIST_DIRECTORY: str = Field(default="./data/chromadb")
    EMBEDDING_MODEL_NAME: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2"
    )

    # --- Forensics Thresholds ---
    CONFIDENCE_THRESHOLD: float = Field(
        default=0.85,
        description="Minimum OCR confidence to accept extraction without manual review",
    )
    TAMPER_RISK_CUTOFF: float = Field(
        default=0.70,
        description="Tamper confidence above this triggers CRITICAL alert",
    )

    # --- Upload & Temp Paths ---
    UPLOAD_DIR: str = Field(default="./data/uploads")
    TEMP_DIR: str = Field(default="./data/temp")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


# Singleton settings instance
settings = Settings()

# --- Constants ---

# Document type enum values (must match backend BidSubmission.uploadedDocuments.docType)
DOCUMENT_TYPES = [
    "GST_CERTIFICATE",
    "UDYAM_CERTIFICATE",
    "PAN_CARD",
    "ITR_ACKNOWLEDGEMENT",
    "CA_TURNOVER_CERTIFICATE",
    "EPFO_REGISTRATION",
    "ESIC_REGISTRATION",
    "DEBARMENT_AFFIDAVIT",
    "OEM_AUTHORIZATION",
    "LOCAL_CONTENT_DECLARATION",
]

# Required certificate types from the Tender schema
REQUIRED_CERTIFICATE_TYPES = [
    "GST_CERTIFICATE",
    "UDYAM_CERTIFICATE",
    "PAN_CARD",
    "ITR_ACKNOWLEDGEMENT",
    "CA_TURNOVER_CERTIFICATE",
    "EPFO_REGISTRATION",
    "ESIC_REGISTRATION",
    "DEBARMENT_AFFIDAVIT",
    "OEM_AUTHORIZATION",
    "LOCAL_CONTENT_DECLARATION",
]

# Forbidden editing software signatures for forensic detection
FORBIDDEN_SOFTWARE_SIGNATURES = [
    "photoshop",
    "canva",
    "coreldraw",
    "illustrator",
    "gimp",
    "pdfescape",
    "sejda",
    "ilovepdf",
    "nitro",
    "foxit phantom",
]

# Portal names for ground-truth verification
PORTAL_NAMES = ["GSTN", "UDYAM", "INCOME_TAX_NSDL", "MCA21", "EPFO", "GEM_DEBAR"]

# Verification statuses
VERIFICATION_STATUSES = [
    "MATCH",
    "MISMATCH",
    "PORTAL_UNAVAILABLE",
    "TAMPERED",
    "UNREADABLE",
]

# Audit action types
AUDIT_ACTION_TYPES = [
    "TENDER_CREATED",
    "TENDER_RULES_UPDATED",
    "BID_SUBMITTED",
    "FORENSIC_FLAG_RAISED",
    "OCR_EXTRACTION_COMPLETED",
    "PORTAL_VERIFIED",
    "SCORE_CALCULATED",
    "COLLUSION_DETECTED",
    "OFFICER_OVERRIDE",
    "FINAL_AWARD_DECISION",
]
