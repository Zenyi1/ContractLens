import os
import pdfplumber
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import yellow, red
from diff_match_patch import diff_match_patch
import openai
from dotenv import load_dotenv

load_dotenv()

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

def extract_text(pdf_path: str) -> str:
    """Extract text content from a PDF file."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def transform_clauses(buyer_text: str, seller_text: str) -> str:
    """Transform buyer's clauses to align with seller's model using GPT-4."""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert in legal document transformation. Transform the buyer's T&Cs to align with the seller's model while preserving the core legal meaning."
                },
                {
                    "role": "user",
                    "content": f"Seller's T&Cs:\n{seller_text}\n\nBuyer's T&Cs:\n{buyer_text}\n\nTransform the buyer's T&Cs to match the seller's structure while preserving legal meaning."
                }
            ],
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Error in GPT-4 transformation: {str(e)}")

def compute_diffs(original_text: str, transformed_text: str) -> list:
    """Compute differences between original and transformed text."""
    dmp = diff_match_patch()
    diffs = dmp.diff_main(original_text, transformed_text)
    dmp.diff_cleanupSemantic(diffs)
    return diffs

def annotate_pdf(original_pdf_path: str, diffs: list) -> bytes:
    """Create an annotated PDF with highlighted changes."""
    # This is a stub - in a real implementation, you would:
    # 1. Create a new PDF
    # 2. Copy original content
    # 3. Add highlights for changes
    # 4. Add a legend explaining the annotations
    
    # For now, just return the original PDF bytes
    with open(original_pdf_path, "rb") as f:
        return f.read() 