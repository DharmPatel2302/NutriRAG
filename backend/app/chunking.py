import re
from typing import List, Dict, Any

_nlp: Any = None

def get_spacy_nlp():
    global _nlp
    if _nlp is None:
        from spacy.lang.en import English
        nlp = English()
        nlp.add_pipe("sentencizer")
        _nlp = nlp
    return _nlp

def split_list(input_list: List[Any], slice_size: int = 10) -> List[List[Any]]:
    """Splits a list into sub-lists of a specified slice size."""
    return [input_list[i : i + slice_size] for i in range(0, len(input_list), slice_size)]

def chunk_pdf_to_sentence_chunks(pages: List[Dict[str, Any]], slice_size: int = 10, min_token_length: int = 30) -> List[Dict[str, Any]]:
    """
    Splits text from pages into sentence groups, cleans formatting,
    filters by token count, and returns chunk objects.
    """
    nlp = get_spacy_nlp()
    chunks = []
    for page in pages:
        page_number = page.get("page_number", 0)
        text = page.get("text", "")
        
        doc = nlp(text)
        sentences = [str(s) for s in doc.sents]
        sentence_groups = split_list(sentences, slice_size=slice_size)
        
        for group in sentence_groups:
            joined = "".join(group)
            # Regex cleanup for missing spaces after periods
            joined = re.sub(r"\.([A-Z])", r". \1", joined)
            
            char_count = len(joined)
            word_count = len(joined.split())
            token_count = char_count / 4.0  # Estimated token count
            
            if token_count >= min_token_length:
                chunks.append({
                    "page_number": page_number,
                    "sentence_chunk": joined,
                    "chunk_char_count": char_count,
                    "chunk_word_count": word_count,
                    "chunk_token_count": token_count
                })
                
    return chunks
