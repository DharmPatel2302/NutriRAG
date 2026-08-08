-- Enable the vector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create document_chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    page_number INT NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_char_count INT NOT NULL,
    chunk_word_count INT NOT NULL,
    chunk_token_count REAL NOT NULL,
    embedding VECTOR(768) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop old ivfflat index if exists
DROP INDEX IF EXISTS document_chunks_embedding_cosine_idx;

-- Create HNSW vector index (supports dynamic inserts & works from 0 rows)
CREATE INDEX IF NOT EXISTS document_chunks_embedding_hnsw_idx 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- Drop function if existing signature differs
DROP FUNCTION IF EXISTS match_chunks(vector(768), int);
DROP FUNCTION IF EXISTS match_chunks(vector, int);

-- Match function using cosine distance (<=>)
CREATE OR REPLACE FUNCTION match_chunks (
    query_embedding VECTOR(768),
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id BIGINT,
    page_number INT,
    chunk_text TEXT,
    chunk_char_count INT,
    chunk_word_count INT,
    chunk_token_count REAL,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        document_chunks.id,
        document_chunks.page_number,
        document_chunks.chunk_text,
        document_chunks.chunk_char_count,
        document_chunks.chunk_word_count,
        document_chunks.chunk_token_count,
        (1 - (document_chunks.embedding <=> query_embedding))::FLOAT AS similarity
    FROM document_chunks
    ORDER BY document_chunks.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;