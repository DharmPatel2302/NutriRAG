from pydantic import BaseModel, Field
from typing import List, Optional

class QueryRequest(BaseModel):
    query: str = Field(..., description="The user query or question")
    k: int = Field(default=5, ge=1, le=20, description="Top-k chunks to retrieve")

class SourceItem(BaseModel):
    id: Optional[int] = None
    page_number: int
    chunk_text: str
    chunk_char_count: Optional[int] = None
    chunk_word_count: Optional[int] = None
    chunk_token_count: Optional[float] = None
    similarity: Optional[float] = None

class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceItem]

class IngestResponse(BaseModel):
    inserted: int
    message: str = "Ingestion completed successfully"
