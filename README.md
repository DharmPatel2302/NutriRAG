# NutriRAG — Retrieval-Augmented Generation with Supabase & Local Gemma 2B

A production-style RAG pipeline for Human Nutrition powered by **FastAPI**, **Supabase (`pgvector`)**, **sentence-transformers**, local 4-bit quantized **Gemma-2b-it**, and a **Vite React** frontend.

---

## Architecture Overview

```
React Frontend (Vercel)  --->  FastAPI Backend (GPU Host)  --->  Supabase Postgres (pgvector)
```

1. **Supabase Postgres (`pgvector`)**: Stores sentence chunks and 768-dimensional embeddings in `document_chunks`. Vector similarity search is executed using the `match_chunks` PostgreSQL RPC function with cosine distance (`<=>`).
2. **FastAPI Backend**: Provides `/ingest` for processing PDF documents (spaCy 10-sentence chunking, regex fix, sentence-transformers embedding) and `/query` for context retrieval and local 4-bit Gemma generation.
3. **React Frontend**: Modern single-page app displaying answer responses with collapsible source attribution (chunk excerpt & page numbers) and optional PDF ingestion controls.

---

## Prerequisites

- **Python**: 3.10+
- **Node.js**: 18+
- **Supabase Account**: With a project created.
- **Hugging Face Account**:
  > ⚠️ **IMPORTANT**: `google/gemma-2b-it` is a gated model. You MUST visit [google/gemma-2b-it on Hugging Face](https://huggingface.co/google/gemma-2b-it), accept the license agreement, and generate a User Access Token tied to your account for `HF_TOKEN`.

---

## Setup Instructions

### 1. Database Setup (Supabase)

1. Open your [Supabase Dashboard](https://database.new) and navigate to the **SQL Editor**.
2. Paste and run the contents of [`supabase/schema.sql`](file:///supabase/schema.sql).
3. This creates:
   - `vector` extension
   - `document_chunks` table with `embedding vector(768)`
   - `ivfflat` index on `embedding` using `vector_cosine_ops`
   - `match_chunks` RPC function using `<=>` cosine distance

### 2. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On Linux/macOS:
   source .venv/bin/activate

   # Install CUDA PyTorch wheels (for GPU & bitsandbytes 4-bit quantization support):
   pip install torch --index-url https://download.pytorch.org/whl/cu121

   # Install remaining packages & spaCy model:
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```
3. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Fill in your `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `HF_TOKEN`.

4. Start the backend dev server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   Backend will be running at `http://localhost:8000`. Test `/health` at `http://localhost:8000/health`.

### 3. Frontend Setup (React / Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_API_URL=http://localhost:8000`.

4. Start the frontend dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## Deployment Strategy

### Backend (GPU Hosting required)
Because Gemma-2b-it and 4-bit quantization require GPU acceleration:
- **RunPod Serverless** or **Modal.com**: Deploy the backend as a container using the provided [`backend/Dockerfile`](file:///backend/Dockerfile).
- Set environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `HF_TOKEN`, `FRONTEND_URL`) on your GPU host dashboard.

### Frontend (Static/Serverless Hosting)
- **Vercel** / **Netlify** / **Cloudflare Pages**:
  - Deploy the `frontend/` folder.
  - Add build environment variable `VITE_API_URL=https://your-gpu-backend-domain.com`.

---

## API Endpoints

- `GET /health` — Service health status check.
- `POST /query` — Body: `{"query": "string", "k": 5}`. Returns `{ "answer": "string", "sources": [...] }`.
- `POST /ingest` — Form-data with file upload (`file`) or server path (`file_path`). Ingests PDF into Supabase vector database.
