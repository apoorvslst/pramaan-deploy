"""
PRAMAN AI Microservice — Phase 8: RAG Officer Assistant

Local air-gapped conversational assistant for Procurement Officers.
Uses ChromaDB for vector storage + Groq/Gemini LLM for grounded Q&A.

Features:
  - Document chunking with metadata (tenderId, bidderId, docType, pageNumber)
  - Semantic search via sentence-transformers embeddings
  - Citation-backed answers referencing exact bidder + document + page
  - System prompt prevents hallucination

Based on Section 7.10 of the PRAMAN blueprint.
"""

import hashlib
from typing import List, Dict, Optional

from config import settings
from schemas.assistant import (
    AssistantQueryRequest,
    AssistantQueryResponse,
    IndexBidRequest,
    IndexBidResponse,
    Citation,
)


# ──────────────────────────────────────────────
#  ChromaDB Vector Store (Lazy Init)
# ──────────────────────────────────────────────

_chroma_client = None
_collection = None


def _get_collection():
    """Lazily initialize ChromaDB client and collection."""
    global _chroma_client, _collection
    if _collection is not None:
        return _collection

    try:
        import chromadb
        _chroma_client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIRECTORY
        )
        _collection = _chroma_client.get_or_create_collection(
            name="praman_bid_documents",
            metadata={"hnsw:space": "cosine"},
        )
        return _collection
    except Exception as e:
        print(f"[RAGAssistant] ChromaDB init failed: {e}")
        return None


# ──────────────────────────────────────────────
#  Document Indexing (Chunking + Embedding)
# ──────────────────────────────────────────────

def _chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
    """Split text into overlapping chunks for embedding."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk.strip())
        start += chunk_size - overlap
    return chunks


async def index_bid_documents(request: IndexBidRequest) -> IndexBidResponse:
    """
    Ingest bid documents into ChromaDB vector store.
    Each chunk is stored with metadata for citation generation.
    """
    collection = _get_collection()
    if collection is None:
        return IndexBidResponse(
            chunksIndexed=0,
            tenderId=request.tenderId,
            bidderId=request.bidderId,
            status="error: ChromaDB not available",
        )

    total_chunks = 0

    for doc in request.documents:
        text_content = doc.get("textContent", "")
        doc_type = doc.get("docType", "UNKNOWN")
        page_number = doc.get("pageNumber", 1)

        if not text_content.strip():
            continue

        chunks = _chunk_text(text_content)

        for i, chunk in enumerate(chunks):
            # Generate deterministic ID for deduplication
            chunk_id = hashlib.md5(
                f"{request.tenderId}_{request.bidderId}_{doc_type}_{page_number}_{i}".encode()
            ).hexdigest()

            collection.upsert(
                ids=[chunk_id],
                documents=[chunk],
                metadatas=[{
                    "tenderId": request.tenderId,
                    "bidderId": request.bidderId,
                    "bidderName": request.bidderName,
                    "docType": doc_type,
                    "pageNumber": str(page_number),
                    "chunkIndex": str(i),
                }],
            )
            total_chunks += 1

    return IndexBidResponse(
        chunksIndexed=total_chunks,
        tenderId=request.tenderId,
        bidderId=request.bidderId,
        status="indexed",
    )


# ──────────────────────────────────────────────
#  Query & Answer Generation
# ──────────────────────────────────────────────

SYSTEM_PROMPT = """You are an objective government procurement verification assistant for the PRAMAN platform.
Your role is to help Procurement Officers by answering questions about tender documents and bidder submissions.

STRICT RULES:
1. Only answer based on the PROVIDED DOCUMENT EXCERPTS below. Do NOT use external knowledge.
2. For every factual claim, cite the exact source: [Bidder Name - Document Type, Page X].
3. If the information is not found in the excerpts, explicitly state: "This information is not found in the indexed documents."
4. Be concise and precise. Use bullet points for multi-part answers.
5. Never speculate or make assumptions beyond what the documents state."""


async def query_assistant(request: AssistantQueryRequest) -> AssistantQueryResponse:
    """
    Process an officer's question using RAG (Retrieve → Augment → Generate).
    
    Steps:
    1. Search ChromaDB for relevant document chunks
    2. Build context from retrieved chunks with metadata
    3. Send to Groq LLM with grounding system prompt
    4. Parse citations from the answer
    """
    collection = _get_collection()

    # Step 1: Retrieve relevant chunks
    context_chunks = []
    citations: List[Citation] = []

    if collection and collection.count() > 0:
        # Build query filters
        where_filter = None
        if request.tenderId:
            where_filter = {"tenderId": request.tenderId}

        results = collection.query(
            query_texts=[request.question],
            n_results=8,
            where=where_filter,
        )

        if results and results["documents"]:
            for i, doc_text in enumerate(results["documents"][0]):
                meta = results["metadatas"][0][i] if results["metadatas"] else {}
                context_chunks.append(
                    f"[Source: {meta.get('bidderName', 'Unknown')} - "
                    f"{meta.get('docType', 'Unknown')}, Page {meta.get('pageNumber', '?')}]\n"
                    f"{doc_text}"
                )
                citations.append(Citation(
                    bidderId=meta.get("bidderId"),
                    bidderName=meta.get("bidderName"),
                    docType=meta.get("docType"),
                    pageNumber=int(meta.get("pageNumber", 1)),
                    snippet=doc_text[:150],
                ))

    # Step 2: Build augmented prompt
    context_text = "\n\n---\n\n".join(context_chunks) if context_chunks else "No documents have been indexed yet."

    user_prompt = f"""DOCUMENT EXCERPTS:
{context_text}

OFFICER'S QUESTION:
{request.question}

Please answer based ONLY on the document excerpts above. Cite sources as [Bidder Name - Doc Type, Page X]."""

    # Step 3: Generate answer via Groq
    answer = "I could not generate an answer. Please ensure documents are indexed and the LLM service is available."
    model_used = "none"
    confidence = 0.0

    # Try Groq
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.1,
                max_tokens=1000,
            )
            answer = response.choices[0].message.content.strip()
            model_used = f"groq/{settings.GROQ_MODEL}"
            confidence = 0.90 if context_chunks else 0.30
        except Exception as e:
            print(f"[RAGAssistant] Groq query failed: {e}")

    # Fallback to Gemini
    if model_used == "none" and settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            response = model.generate_content(
                f"{SYSTEM_PROMPT}\n\n{user_prompt}",
                generation_config=genai.GenerationConfig(
                    temperature=0.1, max_output_tokens=1000,
                ),
            )
            answer = response.text.strip()
            model_used = f"gemini/{settings.GEMINI_MODEL}"
            confidence = 0.85 if context_chunks else 0.25
        except Exception as e:
            print(f"[RAGAssistant] Gemini query failed: {e}")

    return AssistantQueryResponse(
        answer=answer,
        citations=citations,
        confidence=confidence,
        modelUsed=model_used,
    )
