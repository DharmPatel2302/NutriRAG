from typing import List, Dict, Any, Optional
from .config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
from .embedding import embed_text

_supabase_client: Any = None

def get_supabase_client() -> Any:
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your .env file."
            )
        from supabase import create_client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _supabase_client

def retrieve_chunks(query: str, k: int = 5) -> List[Dict[str, Any]]:
    """
    Embeds the user query and calls Supabase match_chunks RPC function.
    """
    client = get_supabase_client()
    query_embedding = embed_text(query)
    
    response = client.rpc(
        "match_chunks",
        {
            "query_embedding": query_embedding,
            "match_count": k
        }
    ).execute()
    
    return response.data if response.data else []