import os
# Force PyTorch backend to prevent Transformers from attempting TensorFlow/Keras 3 imports
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"

from typing import List, Any

_embedding_model: Any = None

def get_embedding_model() -> Any:
    global _embedding_model
    if _embedding_model is None:
        import torch
        from sentence_transformers import SentenceTransformer
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _embedding_model = SentenceTransformer("all-mpnet-base-v2", device=device)
    return _embedding_model

def embed_text(text: str) -> List[float]:
    """Generates a 768-dimensional vector embedding for a single text."""
    model = get_embedding_model()
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()

def embed_texts(texts: List[str], batch_size: int = 32) -> List[List[float]]:
    """Generates 768-dimensional vector embeddings in optimized batches."""
    model = get_embedding_model()
    embeddings = model.encode(texts, batch_size=batch_size, show_progress_bar=False, convert_to_numpy=True)
    return embeddings.tolist()