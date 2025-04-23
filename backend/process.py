import os
import pdfplumber
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import yellow, red
from diff_match_patch import diff_match_patch
from openai import OpenAI
from dotenv import load_dotenv
import io
import json

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Debug: Print environment variables
print("Current working directory:", os.getcwd())
print("Environment file path:", os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
print("OPENAI_API_KEY exists:", "OPENAI_API_KEY" in os.environ)
if "OPENAI_API_KEY" in os.environ:
    print("OPENAI_API_KEY length:", len(os.environ["OPENAI_API_KEY"]))

# Initialize OpenAI client with explicit configuration
client = OpenAI()

def extract_text(pdf_path: str) -> str:
    """Extract text content from a PDF file."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def preprocess_text(text: str) -> str:
    """Clean and preprocess text to reduce token count."""
    # Remove multiple spaces
    text = ' '.join(text.split())
    # Remove multiple newlines
    text = '\n'.join(line for line in text.split('\n') if line.strip())
    return text

def split_into_chunks(text: str, max_tokens: int = 3000) -> list[str]:
    """Split text into chunks of approximately max_tokens size."""
    # Rough estimate: 1 token ≈ 4 characters
    chunk_size = max_tokens * 4
    chunks = []
    current_chunk = ""
    
    # Split by sections (assuming sections are separated by multiple newlines)
    sections = text.split('\n\n')
    
    for section in sections:
        if len(current_chunk) + len(section) < chunk_size:
            current_chunk += section + '\n\n'
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            # If a single section is too large, split it by sentences
            if len(section) > chunk_size:
                sentences = section.split('. ')
                current_chunk = ""
                for sentence in sentences:
                    if len(current_chunk) + len(sentence) < chunk_size:
                        current_chunk += sentence + '. '
                    else:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                        current_chunk = sentence + '. '
            else:
                current_chunk = section + '\n\n'
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

def transform_clauses(buyer_text: str, seller_text: str) -> str:
    """Transform buyer's clauses to align with seller's model using GPT-3.5-turbo."""
    try:
        # Preprocess texts to reduce token count
        buyer_text = preprocess_text(buyer_text)
        seller_text = preprocess_text(seller_text)
        
        print(f"Buyer text length after preprocessing: {len(buyer_text)} characters")
        print(f"Seller text length after preprocessing: {len(seller_text)} characters")
        
        # Split texts into chunks
        buyer_chunks = split_into_chunks(buyer_text, max_tokens=3000)
        seller_chunks = split_into_chunks(seller_text, max_tokens=3000)
        
        print(f"Split into {len(buyer_chunks)} buyer chunks and {len(seller_chunks)} seller chunks")
        
        transformed_chunks = []
        max_retries = 3
        retry_delay = 30
        
        # Process each chunk with retry logic
        for i, (buyer_chunk, seller_chunk) in enumerate(zip(buyer_chunks, seller_chunks)):
            print(f"Processing chunk {i+1}/{len(buyer_chunks)}")
            print(f"Chunk sizes - Buyer: {len(buyer_chunk)}, Seller: {len(seller_chunk)}")
            
            for attempt in range(max_retries):
                try:
                    response = client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {
                                "role": "system",
                                "content": """You are an expert legal counsel specializing in equipment rental agreements. You represent the equipment owner/lessor (the Seller) who is renting out specialized equipment to customers (the Buyer). Your primary responsibility is to protect the Seller's interests and ensure the rental agreement properly reflects the rental nature of the transaction.

CRITICAL CONTEXT:
- This is a RENTAL agreement, not a sale
- The Seller owns and maintains the equipment
- The Buyer is renting the equipment for temporary use
- The Seller must be protected from misuse, damage, and non-payment
- The Seller must maintain control over the equipment at all times

ANALYSIS FRAMEWORK:
For each significant clause, analyze:
1. CURRENT SITUATION:
   - What does the Buyer's clause say?
   - What does the Seller's clause say?
   - Where exactly is the misalignment?

2. IMPACT ANALYSIS:
   - Why is this difference problematic for the Seller?
   - What specific risks does it create?
   - What could go wrong if this isn't fixed?

3. RECOMMENDED SOLUTION:
   - What specific changes are needed?
   - Why is this the right solution?
   - What exact wording should be used?

KEY AREAS TO FOCUS ON:
1. Payment Terms:
   - Standard payment periods (e.g., "120 days is unacceptable; must be 30 days")
   - Late payment penalties
   - Security deposits

2. Equipment Control:
   - Ownership retention
   - Inspection rights
   - Maintenance responsibilities
   - Return conditions

3. Liability:
   - Damage responsibility
   - Insurance requirements
   - Indemnification

4. Usage Terms:
   - Authorized users
   - Usage restrictions
   - Training requirements

FORMAT REQUIREMENTS:
- Use clear, numbered sections
- Be specific about clause locations
- Provide exact wording for changes
- Explain the business rationale
- Focus on protecting the Seller's interests

EXAMPLE FORMAT:
---
CLAUSE: Payment Terms
Location: Section 4.2

CURRENT SITUATION:
Buyer's Version: "Payment shall be made within 120 days of invoice"
Seller's Version: "Payment shall be made within 30 days of invoice"

IMPACT ANALYSIS:
- 120-day payment term creates significant cash flow issues for Seller
- Increases risk of non-payment
- Not standard in equipment rental industry
- Could impact Seller's ability to maintain equipment fleet

RECOMMENDED SOLUTION:
Change to: "Payment shall be made within 30 days of invoice. Late payments shall incur interest at 1.5% per month."
Rationale: Standard rental industry practice, protects Seller's cash flow, provides incentive for timely payment.
---"""
                            },
                            {
                                "role": "user",
                                "content": f"""Please analyze these contract sections with the above framework. Focus on protecting the Seller's interests in this equipment rental agreement.

SELLER'S TERMS (Equipment Owner/Lessor):
{seller_chunk}

BUYER'S TERMS (Equipment Renter):
{buyer_chunk}

Provide a detailed analysis of all significant differences, focusing on protecting the Seller's interests in this rental arrangement."""
                            }
                        ],
                        temperature=0.1,  # Lower temperature for more consistent output
                        max_tokens=2000
                    )
                    transformed_chunks.append(response.choices[0].message.content)
                    print(f"Successfully processed chunk {i+1}")
                    break  # Success, exit retry loop
                except Exception as e:
                    if "rate_limit_exceeded" in str(e) and attempt < max_retries - 1:
                        print(f"Rate limit hit, waiting {retry_delay} seconds before retry {attempt + 1}")
                        import time
                        time.sleep(retry_delay)
                        retry_delay *= 2  # Exponential backoff
                    else:
                        print(f"Error processing chunk {i+1}: {str(e)}")
                        raise Exception(f"Error in GPT-3.5-turbo transformation: {str(e)}")
            
            # Add a small delay between chunks to avoid rate limits
            if i < len(buyer_chunks) - 1:
                import time
                time.sleep(2)  # Reduced delay between chunks
        
        # Combine all transformed chunks
        result = "\n\n".join(transformed_chunks)
        print(f"Transformation complete. Final text length: {len(result)} characters")
        return result
    except Exception as e:
        print(f"Final error: {str(e)}")
        raise Exception(f"Error in GPT-3.5-turbo transformation: {str(e)}")

def compute_diffs(original_text: str, transformed_text: str) -> list:
    """Compute differences between original and transformed text."""
    dmp = diff_match_patch()
    diffs = dmp.diff_main(original_text, transformed_text)
    dmp.diff_cleanupSemantic(diffs)
    return diffs

def annotate_pdf(original_pdf_path: str, diffs: list) -> bytes:
    """Create an annotated PDF with highlighted changes."""
    reader = PdfReader(original_pdf_path)
    writer = PdfWriter()
    
    # Create a canvas for annotations
    packet = io.BytesIO()
    can = canvas.Canvas(packet)
    
    # Set up colors for different types of changes
    can.setFillColorRGB(1, 1, 0)  # Yellow for modifications
    can.setStrokeColorRGB(0, 0, 0)
    
    # Process each page
    for page_num in range(len(reader.pages)):
        page = reader.pages[page_num]
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        
        # Create a new page with the same dimensions
        can.setPageSize((width, height))
        
        # Process diffs and add annotations
        y_position = height - 50  # Start from top
        for diff in diffs:
            if diff[0] == 1:  # Insertion
                can.setFillColorRGB(0, 1, 0)  # Green for additions
            elif diff[0] == -1:  # Deletion
                can.setFillColorRGB(1, 0, 0)  # Red for deletions
            else:
                continue
                
            # Add highlight
            can.rect(50, y_position, width - 100, 20, fill=1)
            can.setFillColorRGB(0, 0, 0)
            can.drawString(50, y_position + 5, diff[1])
            y_position -= 30
            
        can.showPage()
    
    can.save()
    packet.seek(0)
    
    # Merge the annotations with the original PDF
    new_pdf = PdfReader(packet)
    for page_num in range(len(reader.pages)):
        page = reader.pages[page_num]
        if page_num < len(new_pdf.pages):
            page.merge_page(new_pdf.pages[page_num])
        writer.add_page(page)
    
    # Write the result to a bytes object
    output = io.BytesIO()
    writer.write(output)
    output.seek(0)
    return output.read()

def generate_change_summary(buyer_text: str, transformed_text: str) -> str:
    """Generate a human-readable summary of the legal differences."""
    # The transformed text now contains a structured analysis
    # We'll format it to highlight the key points while preserving the structure
    
    # Split into sections based on the "---" delimiter
    sections = transformed_text.split('---')
    
    # Filter out empty sections and format each one
    formatted_sections = []
    for section in sections:
        section = section.strip()
        if section:
            # Add some spacing and formatting
            formatted_sections.append(f"\n{section}\n")
    
    if not formatted_sections:
        # If no clear sections found, return the original analysis
        return transformed_text
    
    # Add a header and combine the sections
    return "=== CONTRACT ANALYSIS REPORT ===\n" + "\n".join(formatted_sections)

def process_documents_sync(buyer_path: str, seller_path: str) -> tuple[bytes, str]:
    """Process documents and return both annotated PDF and change summary."""
    seller_text = extract_text(seller_path)
    buyer_text = extract_text(buyer_path)
    transformed_text = transform_clauses(buyer_text, seller_text)
    diffs = compute_diffs(buyer_text, transformed_text)
    annotated_pdf = annotate_pdf(buyer_path, diffs)
    change_summary = generate_change_summary(buyer_text, transformed_text)
    return annotated_pdf, change_summary 