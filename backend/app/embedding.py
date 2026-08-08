import os
import requests
from typing import List, Any
from .config import HF_TOKEN

_embedding_model: Any = None

def embed_text(text: str) -> List[float]:
    """
    Generates a 768-dimensional vector embedding.
    Uses Hugging Face Inference API if HF_TOKEN is present (0 MB RAM on server).
    Falls back to local SentenceTransformers if HF_TOKEN is not set.
    """
    if HF_TOKEN:
        url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2"
        headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        response = requests.post(url, headers=headers, json={"inputs": [text]})
        if response.status_code == 200:
            res = response.json()
            # If HF returns [[vector]]
            if isinstance(res, list) and len(res) > 0:
                if isinstance(res[0], list):
                    return res[0]
                return res
        print(f"HF API Warning ({response.status_code}): {response.text}. Falling back to local model...")

    # Local fallback
    global _embedding_model
    if _embedding_model is None:
        import torch
        from sentence_transformers import SentenceTransformer
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _embedding_model = SentenceTransformer("all-mpnet-base-v2", device=device)

    embedding = _embedding_model.encode(text, convert_to_numpy=True)
    return embedding.tolist()


def embed_texts(texts: List[str], batch_size: int = 32) -> List[List[float]]:
    """Generates 768-dimensional vector embeddings in batches."""
    if HF_TOKEN:
        url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2"
        headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        response = requests.post(url, headers=headers, json={"inputs": texts})
        if response.status_code == 200:
            res = response.json()
            if isinstance(res, list) and len(res) == len(texts):
                return res
        print(f"HF API Batch Warning ({response.status_code}): {response.text}. Falling back to local model...")

    global _embedding_model
    if _embedding_model is None:
        import torch
        from sentence_transformers import SentenceTransformer
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _embedding_model = SentenceTransformer("all-mpnet-base-v2", device=device)

    embeddings = _embedding_model.encode(texts, batch_size=batch_size, show_progress_bar=False, convert_to_numpy=True)
    return embeddings.tolist()