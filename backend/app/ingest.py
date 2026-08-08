import fitz  # PyMuPDF
from typing import Dict, Any, Union
from .chunking import chunk_pdf_to_sentence_chunks
from .embedding import embed_texts
from .retrieval import get_supabase_client

BATCH_SIZE = 100
EMBED_BATCH_SIZE = 64

def ingest_pdf(pdf_source: Union[str, bytes]) -> Dict[str, Any]:
    """
    Parses PDF from file path or bytes, extracts text per page, chunks sentences,
    embeds chunks in optimized matrix batches, and batch-inserts into Supabase document_chunks.
    """
    if isinstance(pdf_source, bytes):
        doc = fitz.open(stream=pdf_source, filetype="pdf")
    else:
        doc = fitz.open(pdf_source)
        
    pages = []
    for i, page in enumerate(doc):
        # 1-based page numbering for display readability
        pages.append({
            "page_number": i + 1,
            "text": page.get_text()
        })
    doc.close()
    
    # Process text into sentence chunks
    chunks = chunk_pdf_to_sentence_chunks(pages)
    
    if not chunks:
        return {"inserted": 0, "message": "No valid text chunks were extracted from PDF."}

    print(f"Extracted {len(chunks)} sentence chunks from {len(pages)} pages. Encoding embeddings...")

    # Batch encode embeddings for maximum speed
    texts = [c["sentence_chunk"] for c in chunks]
    embeddings = embed_texts(texts, batch_size=EMBED_BATCH_SIZE)

    # Format database rows
    rows = []
    for c, emb in zip(chunks, embeddings):
        rows.append({
            "page_number": c["page_number"],
            "chunk_text": c["sentence_chunk"],
            "chunk_char_count": c["chunk_char_count"],
            "chunk_word_count": c["chunk_word_count"],
            "chunk_token_count": float(c["chunk_token_count"]),
            "embedding": emb
        })
        
    # Batch insert into Supabase
    client = get_supabase_client()
    total_inserted = 0
    
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        result = client.table("document_chunks").insert(batch).execute()
        if result.data:
            total_inserted += len(result.data)
            
    return {"inserted": total_inserted, "message": f"Successfully ingested {total_inserted} document chunks."}