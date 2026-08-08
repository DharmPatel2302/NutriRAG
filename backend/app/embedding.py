import os
from typing import List, Any
from .config import HF_TOKEN

# Enforce PyTorch single-thread CPU execution as fallback
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

_embedding_model: Any = None

def embed_text(text: str) -> List[float]:
    """
    Generates a 768-dimensional vector embedding for a single query.
    Uses Hugging Face InferenceClient if HF_TOKEN is present (0 MB RAM on server).
    Falls back to local SentenceTransformers if HF_TOKEN is not set.
    """
    if HF_TOKEN:
        try:
            from huggingface_hub import InferenceClient
            client = InferenceClient(api_key=HF_TOKEN)
            res = client.feature_extraction(text, model="sentence-transformers/all-mpnet-base-v2")
            if hasattr(res, "tolist"):
                res = res.tolist()
            if isinstance(res, list) and len(res) > 0:
                return res[0] if isinstance(res[0], list) else res
        except Exception as e:
            print(f"HF InferenceClient Notice: {e}. Using local embedder...")

    # Local single-thread fallback
    global _embedding_model
    if _embedding_model is None:
        import torch
        torch.set_num_threads(1)
        torch.set_num_interop_threads(1)
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer("all-mpnet-base-v2", device="cpu")

    embedding = _embedding_model.encode(text, convert_to_numpy=True)
    return embedding.tolist()


def embed_texts(texts: List[str], batch_size: int = 32) -> List[List[float]]:
    """Generates 768-dimensional vector embeddings in batches."""
    if HF_TOKEN:
        try:
            from huggingface_hub import InferenceClient
            client = InferenceClient(api_key=HF_TOKEN)
            res = client.feature_extraction(texts, model="sentence-transformers/all-mpnet-base-v2")
            if hasattr(res, "tolist"):
                res = res.tolist()
            if isinstance(res, list) and len(res) == len(texts):
                return res
        except Exception as e:
            print(f"HF InferenceClient Batch Notice: {e}. Using local embedder...")

    global _embedding_model
    if _embedding_model is None:
        import torch
        torch.set_num_threads(1)
        torch.set_num_interop_threads(1)
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer("all-mpnet-base-v2", device="cpu")

    embeddings = _embedding_model.encode(texts, batch_size=batch_size, show_progress_bar=False, convert_to_numpy=True)
    return embeddings.tolist()