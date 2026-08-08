from typing import List, Dict, Any

def prompt_formatter(query: str, context_items: List[Dict[str, Any]]) -> str:
    """
    Formats context items into numbered sources [1], [2], etc., and instructs
    the model to cite source numbers inline in the answer text.
    """
    formatted_context = []
    for idx, item in enumerate(context_items):
        page = item.get("page_number", "N/A")
        text = item.get("chunk_text", "")
        formatted_context.append(f"--- Source [{idx + 1}] (Page {page}) ---\n{text}")
        
    context_block = "\n\n".join(formatted_context)
    
    prompt = f"""You are NutriRAG, an expert nutrition AI assistant. Answer the user's question based strictly on the provided context sources.

CRITICAL INSTRUCTIONS:
1. Cite your sources inline using tags like [1], [2], etc., immediately after stating a fact from that source.
2. Structure your answer using markdown formatting (numbered lists, bold headers, bullet points).
3. Do not include conversational intros like "Based on the context" or "Sure, here is".
4. If the context is insufficient, state: "I cannot answer this question based on the provided context."

Context Sources:
{context_block}

User Question: {query}
Answer:"""
    return prompt
