from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Tuple, Any
import os

from .config import FRONTEND_URL
from .models import QueryRequest, QueryResponse, IngestResponse
from .retrieval import retrieve_chunks
from .prompt import prompt_formatter
from .llm import generate_answer
from .ingest import ingest_pdf

app = FastAPI(
    title="NutriRAG Backend",
    description="FastAPI backend for Retrieval-Augmented Generation using Supabase pgvector and Groq API",
    version="1.0.0"
)

# In-memory query response cache (Fast sub-millisecond responses for repeated questions)
_query_cache: Dict[Tuple[str, int], QueryResponse] = {}
MAX_CACHE_ENTRIES = 500

# CORS middleware configuration - allow all origins so Vercel can always communicate smoothly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "cached_queries": len(_query_cache)}

@app.post("/query", response_model=QueryResponse, tags=["RAG Pipeline"])
def query_rag(request: QueryRequest):
    try:
        cache_key = (request.query.strip().lower(), request.k)
        
        # 1. Return from in-memory cache if available (0.001s response time)
        if cache_key in _query_cache:
            return _query_cache[cache_key]
            
        # 2. Vector search & LLM generation
        context_items = retrieve_chunks(request.query, request.k)
        prompt = prompt_formatter(request.query, context_items)
        answer = generate_answer(prompt)
        
        response = QueryResponse(answer=answer, sources=context_items)
        
        # 3. Store in cache (evict oldest if cache exceeds max size)
        if len(_query_cache) >= MAX_CACHE_ENTRIES:
            first_key = next(iter(_query_cache))
            del _query_cache[first_key]
            
        _query_cache[cache_key] = response
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query execution failed: {str(e)}"
        )

@app.post("/ingest", response_model=IngestResponse, tags=["Document Processing"])
async def ingest_document(
    file: Optional[UploadFile] = File(None),
    file_path: Optional[str] = Form(None)
):
    try:
        if file is not None:
            contents = await file.read()
            result = ingest_pdf(contents)
        elif file_path is not None:
            if not os.path.exists(file_path):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"File not found at path: {file_path}"
                )
            result = ingest_pdf(file_path)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must provide either an uploaded PDF file or a valid server file_path."
            )
            
        # Clear query cache on new document ingestion
        _query_cache.clear()
        
        return IngestResponse(
            inserted=result.get("inserted", 0),
            message=result.get("message", "Document ingested successfully")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document ingestion failed: {str(e)}"
        )