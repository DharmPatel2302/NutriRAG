import os
from typing import List, Any

# Enforce PyTorch backend & single-thread execution to minimize server RAM footprint (< 150MB)
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

import torch
torch.set_num_threads(1)
torch.set_num_interop_threads(1)

from .config import HF_TOKEN

_embedding_model: Any = None

def get_embedding_model() -> Any:
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer("all-mpnet-base-v2", device="cpu")
    return _embedding_model

def embed_text(text: str) -> List[float]:
    """Generates a 768-dimensional vector embedding with low RAM footprint."""
    if HF_TOKEN:
        try:
            import requests
            url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2"
            headers = {"Authorization": f"Bearer {HF_TOKEN}"}
            response = requests.post(url, headers=headers, json={"inputs": [text]}, timeout=5)
            if response.status_code == 200:
                res = response.json()
                if isinstance(res, list) and len(res) > 0:
                    return res[0] if isinstance(res[0], list) else res
        except Exception as e:
            print(f"HF API Notice: {e}. Using local memory-optimized embedder...")

    model = get_embedding_model()
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()

def embed_texts(texts: List[str], batch_size: int = 32) -> List[List[float]]:
    """Generates 768-dimensional vector embeddings in optimized batches."""
    if HF_TOKEN:
        try:
            import requests
            url = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2"
            headers = {"Authorization": f"Bearer {HF_TOKEN}"}
            response = requests.post(url, headers=headers, json={"inputs": texts}, timeout=5)
            if response.status_code == 200:
                res = response.json()
                if isinstance(res, list) and len(res) == len(texts):
                    return res
        except Exception as e:
            print(f"HF API Batch Notice: {e}. Using local memory-optimized embedder...")

    model = get_embedding_model()
    embeddings = model.encode(texts, batch_size=batch_size, show_progress_bar=False, convert_to_numpy=True)
    return embeddings.tolist()