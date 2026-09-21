import httpx
import asyncio
import io
from PIL import Image
import time

async def main():
    # 1. Test low-quality image (should fail confidence check)
    print("--- Testing Low Quality Image ---")
    img = Image.new('RGB', (100, 100), color='white')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    async with httpx.AsyncClient() as client:
        res = await client.post("http://localhost:8000/documents/upload", files={"file": ("test.jpg", img_bytes, "image/jpeg")})
        doc_data = res.json()
        doc_id = doc_data["document_id"]
        print(f"Uploaded low quality image, doc_id: {doc_id}")
        
        for _ in range(10):
            await asyncio.sleep(1)
            res = await client.get(f"http://localhost:8000/documents/{doc_id}")
            status_data = res.json()
            print(f"Status: {status_data['status']}")
            if status_data["status"] == "error":
                print("Error Response Shape:")
                print(status_data)
                break
                
    # 2. Test PDF (should proceed to chunks, but might fail later in pipeline if Stage 3 is a stub)
    print("\n--- Testing PDF ---")
    # create a dummy PDF using PyMuPDF
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Article I: This is a test document.")
    pdf_bytes = doc.write()
    
    async with httpx.AsyncClient() as client:
        res = await client.post("http://localhost:8000/documents/upload", files={"file": ("test.pdf", pdf_bytes, "application/pdf")})
        doc_data = res.json()
        doc_id = doc_data["document_id"]
        print(f"Uploaded PDF, doc_id: {doc_id}")
        
        for _ in range(10):
            await asyncio.sleep(1)
            res = await client.get(f"http://localhost:8000/documents/{doc_id}")
            status_data = res.json()
            print(f"Status: {status_data['status']}")
            if status_data["status"] != "processing":
                print("Response Shape:")
                print(status_data)
                break
                
if __name__ == "__main__":
    asyncio.run(main())
