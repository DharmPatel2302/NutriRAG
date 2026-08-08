import os
from typing import List, Any

# Enforce PyTorch backend & single-thread execution to minimize server RAM footprint (< 180MB)
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

import torch
torch.set_num_threads(1)
torch.set_num_interop_threads(1)

_embedding_model: Any = None

def get_embedding_model() -> Any:
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer("all-mpnet-base-v2", device="cpu")
    return _embedding_model

def embed_text(text: str) -> List[float]:
    """Generates a 768-dimensional vector embedding with single-thread CPU low-RAM footprint."""
    model = get_embedding_model()
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()

def embed_texts(texts: List[str], batch_size: int = 32) -> List[List[float]]:
    """Generates 768-dimensional vector embeddings in optimized batches."""
    model = get_embedding_model()
    embeddings = model.encode(texts, batch_size=batch_size, show_progress_bar=False, convert_to_numpy=True)
    return embeddings.tolist()