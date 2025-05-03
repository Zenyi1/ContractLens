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
import time
from io import BytesIO
import tempfile

load_dotenv(
    dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
)

# Debug: Print environment variables
print("Current working directory:", os.getcwd())
print(
    "Environment file path:",
    os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
)
print("OPENAI_API_KEY exists:", "OPENAI_API_KEY" in os.environ)
if "OPENAI_API_KEY" in os.environ:
    print("OPENAI_API_KEY length:", len(os.environ["OPENAI_API_KEY"]))

# Initialize OpenAI client with explicit configuration
client = OpenAI()


def extract_text(pdf_content: bytes) -> str:
    """Extract text content from PDF bytes."""
    text = ""
    with io.BytesIO(pdf_content) as pdf_bytes:
        with pdfplumber.open(pdf_bytes) as pdf:
            print(f"Processing PDF with {len(pdf.pages)} pages")
            for page_num, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
                    print(f"Extracted {len(page_text)} characters from page {page_num}")
                else:
                    print(f"Warning: No text extracted from page {page_num}")
    print(f"Total extracted text length: {len(text)} characters")
    return text


def preprocess_text(text: str) -> str:
    """Clean and preprocess text to reduce token count."""
    # Remove multiple spaces
    text = " ".join(text.split())
    # Remove multiple newlines
    text = "\n".join(line for line in text.split("\n") if line.strip())
    return text


def split_into_chunks(text: str, max_tokens: int = 3000) -> list[str]:
    """Split text into chunks of approximately max_tokens size."""
    # Rough estimate: 1 token ≈ 4 characters
    chunk_size = max_tokens * 4
    chunks = []
    current_chunk = ""

    print(f"\nSplitting text of length {len(text)} into chunks")
    print(f"Target chunk size: {chunk_size} characters")

    # Split by sections (assuming sections are separated by multiple newlines)
    sections = text.split("\n\n")
    print(f"Found {len(sections)} sections")

    for section_num, section in enumerate(sections, 1):
        if len(current_chunk) + len(section) < chunk_size:
            current_chunk += section + "\n\n"
        else:
            if current_chunk:
                print(
                    f"Created chunk {len(chunks) + 1} with {len(current_chunk)} characters"
                )
                chunks.append(current_chunk.strip())
            # If a single section is too large, split it by sentences
            if len(section) > chunk_size:
                print(
                    f"Section {section_num} is too large ({len(section)} chars), splitting by sentences"
                )
                sentences = section.split(". ")
                current_chunk = ""
                for sentence in sentences:
                    if len(current_chunk) + len(sentence) < chunk_size:
                        current_chunk += sentence + ". "
                    else:
                        if current_chunk:
                            print(
                                f"Created chunk {len(chunks) + 1} with {len(current_chunk)} characters"
                            )
                            chunks.append(current_chunk.strip())
                        current_chunk = sentence + ". "
            else:
                current_chunk = section + "\n\n"

    if current_chunk:
        print(
            f"Created final chunk {len(chunks) + 1} with {len(current_chunk)} characters"
        )
        chunks.append(current_chunk.strip())

    print(f"Total chunks created: {len(chunks)}")
    total_chars = sum(len(chunk) for chunk in chunks)
    print(f"Total characters in all chunks: {total_chars}")
    print(f"Original text length: {len(text)}")
    print(f"Character difference: {len(text) - total_chars}")

    return chunks


def transform_clauses(
    buyer_text: str, seller_text: str, company_name: str = "Seller"
) -> str:
    """Transform buyer's clauses to align with seller's model using GPT-3.5-turbo."""
    try:
        # Preprocess texts to reduce token count
        buyer_text = preprocess_text(buyer_text)
        seller_text = preprocess_text(seller_text)

        print(f"\nBuyer text length after preprocessing: {len(buyer_text)} characters")
        print(f"Seller text length after preprocessing: {len(seller_text)} characters")

        # Split texts into chunks
        buyer_chunks = split_into_chunks(buyer_text, max_tokens=3000)
        seller_chunks = split_into_chunks(seller_text, max_tokens=3000)

        print(
            f"\nSplit into {len(buyer_chunks)} buyer chunks and {len(seller_chunks)} seller chunks"
        )

        transformed_chunks = []
        max_retries = 3
        retry_delay = 30

        # Process each chunk with retry logic
        for i, (buyer_chunk, seller_chunk) in enumerate(
            zip(buyer_chunks, seller_chunks)
        ):
            print(f"\nProcessing chunk {i+1}/{len(buyer_chunks)}")
            print(f"Buyer chunk size: {len(buyer_chunk)} characters")
            print(f"Seller chunk size: {len(seller_chunk)} characters")

            for attempt in range(max_retries):
                try:
                    response = client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {
                                "role": "system",
                                "content": f"""You are an expert legal counsel specializing in equipment rental agreements. You represent the equipment owner/lessor (the {company_name}) who is renting out specialized equipment to customers (the Buyer). Your primary responsibility is to protect the {company_name}'s interests and ensure the rental agreement properly reflects the rental nature of the transaction.

CRITICAL CONTEXT:
- This is a RENTAL agreement, not a sale
- The {company_name} owns and maintains the equipment
- The Buyer is renting the equipment for temporary use
- The {company_name} must be protected from misuse, damage, and non-payment
- The {company_name} must maintain control over the equipment at all times

ANALYSIS FRAMEWORK:
For each significant clause, analyze:
1. CURRENT SITUATION:
   - What does the Buyer's clause say?
   - What does the {company_name}'s clause say?
   - Where exactly is the misalignment?

2. IMPACT ANALYSIS:
   - Why is this difference problematic for the {company_name}?
   - What specific risks does it create?
   - What could go wrong if this isn't fixed?

3. RECOMMENDED SOLUTION:
   - What specific changes are needed?
   - Why is this the right solution?
   - What exact wording should be used?

KEY AREAS TO FOCUS ON:

1. Contract Basics:
   - Parties and their roles
   - Effective date and term
   - Equipment description and specifications
   - Rental period and extensions

2. Payment Terms:
   - Rental rates and payment schedule
   - Standard payment periods (e.g., "120 days is unacceptable; must be 30 days")
   - Late payment penalties and interest
   - Security deposits and advance payments
   - Tax responsibilities
   - Currency and payment method
   - Batch payment scheduling (monthly/quarterly)
   - Payment term implications (e.g., 120-day terms)

3. Equipment Control:
   - Ownership retention
   - Inspection rights and frequency
   - Maintenance responsibilities
   - Return conditions and timing
   - Equipment modifications restrictions
   - Location restrictions
   - Access and monitoring rights

4. Liability and Insurance:
   - Damage responsibility
   - Insurance requirements and coverage
   - Professional liability insurance ($1,000,000 requirement)
   - Indemnification clauses
   - Force majeure provisions
   - Limitation of liability
   - Warranty disclaimers

5. Usage Terms:
   - Authorized users and operators
   - Usage restrictions
   - Training requirements
   - Safety protocols
   - Environmental compliance
   - Reporting requirements

6. Default and Remedies:
   - Events of default
   - Cure periods
   - {company_name}'s remedies
   - Equipment repossession rights
   - Damages and penalties
   - Termination cost calculation
   - Buyer's sole discretion in termination
   - Documentation requirements (30-day window)

7. Intellectual Property and Licensing:
   - IP rights and ownership
   - Source code delivery requirements
   - Sublicensing rights and restrictions
   - Open-source component usage
   - Software licenses
   - Data ownership
   - Confidentiality
   - Proprietary rights

8. Tooling and Support:
   - Long-term support obligations
   - Replacement parts availability (5-year post-production)
   - Tooling maintenance and support
   - Spare parts inventory requirements
   - Technical support terms

9. Delivery and Transfer:
   - Incoterms 2020 application
   - Title transfer points
   - Delivery responsibilities
   - Shipping and handling terms
   - Risk of loss provisions

10. Financial Security:
    - Parent company guaranty requirements
    - Financial condition triggers
    - Security for payment
    - Credit requirements
    - Financial reporting obligations

11. General Provisions:
    - Assignment and transfer restrictions
    - Governing law and jurisdiction
    - Dispute resolution
    - Notices and communications
    - Entire agreement clause
    - Severability
    - Waivers

FORMAT REQUIREMENTS:
- Use clear, numbered sections
- Be specific about clause locations
- Provide exact wording for changes
- Explain the business rationale
- Focus on protecting the {company_name}'s interests

EXAMPLE FORMAT:
---
CLAUSE: Payment Terms
Location: Section 4.2

CURRENT SITUATION:
Buyer's Version: "Payment shall be made within 120 days of invoice"
{company_name}'s Version: "Payment shall be made within 30 days of invoice"

IMPACT ANALYSIS:
- 120-day payment term creates significant cash flow issues for {company_name}
- Increases risk of non-payment
- Not standard in equipment rental industry
- Could impact {company_name}'s ability to maintain equipment fleet

RECOMMENDED SOLUTION:
Change to: "Payment shall be made within 30 days of invoice. Late payments shall incur interest at 1.5% per month."
Rationale: Standard rental industry practice, protects {company_name}'s cash flow, provides incentive for timely payment.
---""",
                            },
                            {
                                "role": "user",
                                "content": f"""Please analyze these contract sections with the above framework. Focus on protecting the {company_name}'s interests in this equipment rental agreement.

{company_name.upper()}'S TERMS (Equipment Owner/Lessor):
{seller_chunk}

BUYER'S TERMS (Equipment Renter):
{buyer_chunk}

Provide a detailed analysis of all significant differences, focusing on protecting the {company_name}'s interests in this rental arrangement.""",
                            },
                        ],
                        temperature=0.1,  # Lower temperature for more consistent output
                        max_tokens=2000,
                    )
                    transformed_chunks.append(response.choices[0].message.content)
                    print(f"Successfully processed chunk {i+1}")
                    print(
                        f"Response length: {len(response.choices[0].message.content)} characters"
                    )
                    break  # Success, exit retry loop
                except Exception as e:
                    if "rate_limit_exceeded" in str(e) and attempt < max_retries - 1:
                        print(
                            f"Rate limit hit, waiting {retry_delay} seconds before retry {attempt + 1}"
                        )
                        time.sleep(retry_delay)
                        retry_delay *= 2  # Exponential backoff
                    else:
                        print(f"Error processing chunk {i+1}: {str(e)}")
                        raise Exception(
                            f"Error in GPT-3.5-turbo transformation: {str(e)}"
                        )

            # Add a small delay between chunks to avoid rate limits
            if i < len(buyer_chunks) - 1:
                time.sleep(2)  # Reduced delay between chunks

        # Combine all transformed chunks
        result = "\n\n".join(transformed_chunks)
        print(f"\nTransformation complete. Final text length: {len(result)} characters")
        return result
    except Exception as e:
        print(f"Final error: {str(e)}")
        raise Exception(f"Error in GPT-3.5-turbo transformation: {str(e)}")


def generate_change_summary(
    buyer_text: str, transformed_text: str, company_name: str = "Seller"
) -> str:
    """Generate a human-readable summary of the legal differences."""
    # Replace any remaining "Seller" references with company name
    transformed_text = transformed_text.replace("Seller's", f"{company_name}'s")
    transformed_text = transformed_text.replace("Seller ", f"{company_name} ")

    # The transformed text now contains a structured analysis
    # We'll format it to highlight the key points while preserving the structure

    # Split into sections based on the "---" delimiter
    sections = transformed_text.split("---")

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
    return f"=== CONTRACT ANALYSIS REPORT FOR {company_name.upper()} ===\n" + "\n".join(
        formatted_sections
    )


def process_documents_sync(
    seller_text: str,
    buyer_text: str,
    seller_filename: str,
    buyer_filename: str,
    company_name: str = "Seller",
) -> dict:
    """Process documents synchronously and return the summary."""
    print(
        f"Processing documents: {buyer_filename} and {seller_filename} for {company_name}"
    )

    # Transform buyer's contract
    transformed_text = transform_clauses(buyer_text, seller_text, company_name)

    # Generate changes summary
    summary = generate_change_summary(buyer_text, transformed_text, company_name)

    # Return just the summary without PDF content
    return {"summary": summary}
