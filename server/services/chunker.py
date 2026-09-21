"""
Text chunker — splits extracted text into clause/section chunks.
Stage 2.
"""
import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

def chunk_text(text: str, filename: str = "") -> list[dict[str, Any]]:
    """
    Splits text into clause-level chunks with section references.
    Uses regex heuristics to find common legal document boundaries.
    
    Returns list of:
      {
        "section_ref": str,
        "title": str,
        "text": str,
        "page_ref": str,
        "chunk_index": int,
      }
    """
    # Regex to match common section headers like:
    # "1. ", "1.1 ", "Section 1", "Article I", "A. "
    # Must be at the start of a line.
    section_pattern = re.compile(
        r"^(?:"
        r"(?:Section|Article|Clause)\s+[0-9A-Z]+[\.\:]?\s*|" # Section 1, Article I
        r"^[0-9]+(?:\.[0-9]+)*[\.\)]\s+|"                    # 1. 1.1. 1)
        r"^[A-Z][\.\)]\s+"                                   # A. B)
        r")([^\n]+)?",
        re.IGNORECASE | re.MULTILINE
    )
    
    chunks = []
    lines = text.split("\n")
    
    current_section_ref = "General"
    current_title = "Document Start"
    current_text_buffer = []
    chunk_index = 0
    
    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
            
        match = section_pattern.search(line)
        # If we hit a new section and we have accumulated text
        if match and match.start() == 0 and current_text_buffer:
            chunks.append({
                "section_ref": current_section_ref,
                "title": current_title,
                "text": "\n".join(current_text_buffer).strip(),
                "page_ref": None, # Complex to track page exactly during regex split, keeping simple
                "chunk_index": chunk_index,
            })
            chunk_index += 1
            current_text_buffer = []
            
        if match and match.start() == 0:
            # Extract section ref and title
            full_match = match.group(0).strip()
            title_part = match.group(1)
            
            # Simple heuristic: the whole line might be the title
            current_section_ref = full_match
            if title_part and len(title_part.strip()) > 3:
                current_title = title_part.strip()
            else:
                current_title = line_clean
                
            current_text_buffer.append(line_clean)
        else:
            current_text_buffer.append(line_clean)
            
    # Add the last chunk
    if current_text_buffer:
        chunks.append({
            "section_ref": current_section_ref,
            "title": current_title,
            "text": "\n".join(current_text_buffer).strip(),
            "page_ref": None,
            "chunk_index": chunk_index,
        })
        
    # If regex failed to find any sections, fallback to a size-based chunker
    if len(chunks) == 1 and len(chunks[0]["text"]) > 2000:
        logger.info("Regex chunker failed to find sections for %s. Falling back to size-based chunking.", filename)
        return _fallback_chunker(text)
        
    logger.info("Chunked %s into %d clauses.", filename, len(chunks))
    return chunks

def _fallback_chunker(text: str) -> list[dict[str, Any]]:
    """Splits text by double newlines, grouping paragraphs into ~1000 character chunks."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    
    current_text = ""
    chunk_index = 0
    
    for p in paragraphs:
        if len(current_text) + len(p) > 1000 and current_text:
            chunks.append({
                "section_ref": f"Chunk {chunk_index + 1}",
                "title": f"Document Section {chunk_index + 1}",
                "text": current_text.strip(),
                "page_ref": None,
                "chunk_index": chunk_index,
            })
            chunk_index += 1
            current_text = p
        else:
            current_text += "\n\n" + p if current_text else p
            
    if current_text:
        chunks.append({
            "section_ref": f"Chunk {chunk_index + 1}",
            "title": f"Document Section {chunk_index + 1}",
            "text": current_text.strip(),
            "page_ref": None,
            "chunk_index": chunk_index,
        })
        
    return chunks
