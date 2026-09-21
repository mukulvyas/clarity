"""
Text extraction service — Stage 2.
pdfplumber for text PDFs; pytesseract OCR fallback for scanned/image docs.
Confidence scoring determines whether to proceed or surface the error state.
"""
import io
import logging
from typing import Any

import pdfplumber
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import docx

logger = logging.getLogger(__name__)

async def extract_text_with_confidence(
    file_bytes: bytes,
    filename: str,
) -> dict[str, Any]:
    """
    Extracts text from PDF, DOCX, or Image files.
    Returns:
      {
        "text": str,           -- extracted full text
        "confidence": float,   -- 0–100 extraction confidence score
        "page_count": int,
        "method": str,         -- "pdfplumber" | "ocr" | "docx" | "image_ocr"
        "pages": [{"page": int, "text": str}]
      }
    """
    suffix = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    
    if suffix in ("doc", "docx"):
        return _extract_docx(file_bytes, filename)
    elif suffix in ("png", "jpg", "jpeg", "webp", "tiff"):
        return _extract_image(file_bytes, filename)
    else:
        # Default to PDF
        return _extract_pdf(file_bytes, filename)

def _extract_docx(file_bytes: bytes, filename: str) -> dict[str, Any]:
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        
        text = "\n".join(full_text)
        confidence = 100.0 if text.strip() else 0.0
        
        return {
            "text": text,
            "confidence": confidence,
            "page_count": 1,
            "method": "docx",
            "pages": [{"page": 1, "text": text}],
        }
    except Exception as e:
        logger.error("Failed to extract DOCX %s: %s", filename, e)
        return {"text": "", "confidence": 0.0, "page_count": 1, "method": "docx", "pages": []}

def _extract_image(file_bytes: bytes, filename: str) -> dict[str, Any]:
    try:
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        # For OCR, confidence is a heuristic based on text length and valid characters
        # Pytesseract can output confidence per word, but for simplicity we'll assign a base score
        # A real system would parse tesseract's TSV output for average confidence
        confidence = 70.0 if len(text.strip()) > 50 else 30.0
        
        return {
            "text": text,
            "confidence": confidence,
            "page_count": 1,
            "method": "image_ocr",
            "pages": [{"page": 1, "text": text}],
        }
    except Exception as e:
        logger.error("Failed to extract Image OCR %s: %s", filename, e)
        return {"text": "", "confidence": 0.0, "page_count": 1, "method": "image_ocr", "pages": []}

def _extract_pdf(file_bytes: bytes, filename: str) -> dict[str, Any]:
    pages_data = []
    full_text = ""
    page_count = 0
    method = "pdfplumber"
    
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            page_count = len(pdf.pages)
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    full_text += page_text + "\n"
                    pages_data.append({"page": i + 1, "text": page_text})
                else:
                    pages_data.append({"page": i + 1, "text": ""})
                    
        # If pdfplumber didn't find much text, it's probably a scanned PDF. Fallback to OCR.
        if len(full_text.strip()) < 50 * page_count:
            logger.info("PDF %s lacks embedded text, falling back to OCR", filename)
            method = "ocr"
            full_text = ""
            pages_data = []
            
            # Use PyMuPDF to convert PDF pages to images, then OCR
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            page_count = len(doc)
            for i in range(page_count):
                page = doc.load_page(i)
                pix = page.get_pixmap(dpi=150) # 150 DPI for OCR balance
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                page_text = pytesseract.image_to_string(img)
                full_text += page_text + "\n"
                pages_data.append({"page": i + 1, "text": page_text})
                
            confidence = 75.0 if len(full_text.strip()) > 50 * page_count else 40.0
        else:
            confidence = 95.0
            
        return {
            "text": full_text,
            "confidence": confidence,
            "page_count": page_count,
            "method": method,
            "pages": pages_data,
        }
    except Exception as e:
        logger.error("Failed to extract PDF %s: %s", filename, e)
        return {"text": "", "confidence": 0.0, "page_count": page_count, "method": "error", "pages": []}
