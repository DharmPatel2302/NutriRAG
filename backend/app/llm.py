from typing import Any
from .config import GROQ_API_KEY

_groq_client: Any = None

def get_groq_client() -> Any:
    global _groq_client
    if _groq_client is None:
        if not GROQ_API_KEY:
            raise ValueError(
                "GROQ_API_KEY is not set in backend/.env. Please get a free API key at https://console.groq.com and set GROQ_API_KEY=gsk_..."
            )
        from groq import Groq
        _groq_client = Groq(api_key=GROQ_API_KEY)
    return _groq_client

def generate_answer(prompt: str, max_new_tokens: int = 1024) -> str:
    """
    Generates text response using Groq API (llama-3.3-70b-versatile).
    Instructs the LLM to insert inline citation tags [1], [2] matching source numbers.
    """
    client = get_groq_client()
    
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are NutriRAG, an expert nutrition AI assistant. You MUST include inline citation tags like [1], [2], etc., whenever citing facts from sources."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.4,
        max_tokens=max_new_tokens,
    )
    
    return completion.choices[0].message.content.strip()