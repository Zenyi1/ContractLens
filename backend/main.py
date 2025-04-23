import os
import uuid
import traceback
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from process import extract_text, transform_clauses, compute_diffs, annotate_pdf, process_documents_sync
import base64

# Load environment variables from .env file if not in Docker
if not os.getenv("DOCKER_ENVIRONMENT"):
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

app = FastAPI()

# Configure CORS for both Docker and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": "docker" if os.getenv("DOCKER_ENVIRONMENT") else "local"
    }

@app.post("/process")
async def process_documents(
    seller_tc: UploadFile = File(...),
    buyer_tc: UploadFile = File(...)
):
    try:
        # Create unique directory for this request
        request_id = str(uuid.uuid4())
        tmp_dir = f"/tmp/{request_id}"
        os.makedirs(tmp_dir, exist_ok=True)

        # Save uploaded files
        seller_path = f"{tmp_dir}/seller.pdf"
        buyer_path = f"{tmp_dir}/buyer.pdf"
        
        with open(seller_path, "wb") as f:
            f.write(await seller_tc.read())
        with open(buyer_path, "wb") as f:
            f.write(await buyer_tc.read())

        # Process the documents
        annotated_pdf, change_summary = process_documents_sync(buyer_path, seller_path)

        # Clean up temporary files
        os.remove(seller_path)
        os.remove(buyer_path)
        os.rmdir(tmp_dir)

        # Return both the PDF and summary
        return JSONResponse(
            content={
                "pdf": base64.b64encode(annotated_pdf).decode('utf-8'),
                "summary": change_summary
            }
        )

    except Exception as e:
        print(f"Error processing documents: {str(e)}")
        print("Full traceback:")
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "traceback": traceback.format_exc()}
        ) 