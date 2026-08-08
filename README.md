# 🥗 NutriRAG — Nutrition Science AI Assistant

NutriRAG is a full-stack, production-grade Retrieval-Augmented Generation (RAG) system built over *Human Nutrition (2020 Edition)* (1,200+ pages, 1,688 ingested vector chunks). 

It combines **FastAPI**, **Groq Llama-3.3-70B**, **Supabase pgvector (HNSW Indexing)**, and a **Vite React SPA** to deliver sub-second (<0.5s) domain-specific answers with interactive, click-to-pin citation tooltips.

---

## 🌐 Live Production Links

- **Frontend Application (Vercel Edge)**: [https://nutri-rag.vercel.app](https://nutri-rag.vercel.app)
- **Backend API Docs (Render)**: [https://nutrirag-backend.onrender.com/docs](https://nutrirag-backend.onrender.com/docs)
- **API Health Check**: [https://nutrirag-backend.onrender.com/health](https://nutrirag-backend.onrender.com/health)

---

## 🗺️ Complete End-to-End RAG Architecture

```
[1. User Input] ➔ [2. Vite React SPA (Vercel)] ➔ [3. FastAPI REST API (Render)] ➔ [4. Supabase pgvector]
                                                                                          │
                                                                                          ▼
[7. Typewriter UI] ⬅️ [6. Groq Llama-3.3 Engine] ⬅️ [5. RAG Prompt Formatter] ⬅️ [Top 5 HNSW Chunks]
```

### Step-by-Step Data Flow ("Who Does What")

1. **User Query (Vite React - Vercel Edge)**:
   - User enters a nutrition question (*"What are macronutrients vs micronutrients?"*).
   - React sends an asynchronous HTTP `POST` request to `https://nutrirag-backend.onrender.com/query` with `{ "query": "...", "k": 5 }`.

2. **Embedding Generation (FastAPI - Render)**:
   - FastAPI receives the text question string.
   - Converts the text into a 768-dimensional dense vector using `sentence-transformers/all-mpnet-base-v2`.

3. **Vector Similarity Search (Supabase pgvector)**:
   - Queries 1,688 pre-indexed textbook chunks in Supabase.
   - Executes the `match_chunks` RPC function using the **HNSW (Hierarchical Navigable Small World)** graph index and **Cosine Distance operator (`<=>`)**.
   - Returns the **top 5 most relevant textbook passages** in `< 15ms`.

4. **Prompt Augmentation (FastAPI - Render)**:
   - Combines the user query with the 5 retrieved textbook passages into a strict RAG prompt requiring inline citation markers `[1]`, `[2]`.

5. **LLM Generation (Groq Cloud API)**:
   - Sends the augmented prompt to Groq's high-speed Llama-3.3-70B inference engine (`llama-3.3-70b-versatile`).
   - Generates a cited markdown answer in `< 0.5s`.

6. **Streaming UI & Interactive Tooltips (Vite React - Vercel Edge)**:
   - `useChat.js` streams the answer with a ~20ms typewriter effect.
   - `AnswerRenderer.jsx` and `CitationTag.jsx` parse `[1]`, `[2]` tags into glowing interactive citation pills (`1 p.47`).
   - Hovering or clicking a citation badge opens a popover displaying page numbers, match %, and textbook chunk excerpts.

---

## ⚡ Why HNSW Indexing?

Instead of brute-force `Flat` vector search (`O(N)` time complexity), NutriRAG utilizes an **HNSW (Hierarchical Navigable Small World)** graph index in PostgreSQL:

- **Highway Analogy**: Uses multi-layered graphs (Express highways at top layers down to Local streets at the bottom layer) to navigate directly to vector clusters.
- **Performance**: Reduces search time from seconds to **`< 15 milliseconds`** (`O(log N)` complexity) with `>98%` recall accuracy.
- **Dynamic Growth**: Handles incremental row insertions smoothly starting from 0 rows up to millions of vectors.

---

## 📊 Component Responsibility Matrix

| Layer | Component | Technology | Primary Function |
| :--- | :--- | :--- | :--- |
| **Presentation** | Frontend SPA | Vite React (Vercel) | UI rendering, Theme state, Typewriter effect, Interactive popovers |
| **Application** | Backend Service | FastAPI (Render) | Request routing, In-memory LRU query caching, CORS control |
| **Embedding** | Dense Vector Model | `all-mpnet-base-v2` | Maps text strings to 768-dimensional vector space |
| **Database** | Vector Storage | Supabase (`pgvector`) | Stores 1,688 textbook chunks + HNSW cosine vector search |
| **LLM Engine** | Inference Engine | Groq (`llama-3.3-70b`) | Generates natural language answers with `[1]` citations |

---

## 🛠️ Tech Stack & Dependencies

- **Frontend**: React 18, Vite, Lucide SVG Icons, CSS Design Tokens
- **Backend**: Python 3.11, FastAPI, Uvicorn, SentenceTransformers, PyMuPDF, spaCy
- **Database**: PostgreSQL 15, `pgvector`, HNSW Indexing
- **Inference**: Groq API (`llama-3.3-70b-versatile`)
- **Hosting & Infrastructure**: Vercel Edge (Frontend), Render (Backend), Cron-job.org (24/7 Keep-Alive Ping)

---

## 💻 Local Setup & Development

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- Interactive API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Live Local App: `http://localhost:5173`

---

## 📜 License

Distributed under the MIT License. Built for education and portfolio showcase.
