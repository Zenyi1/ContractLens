import os
import uuid
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .process import extract_text, transform_clauses, compute_diffs, annotate_pdf

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

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
        seller_text = extract_text(seller_path)
        buyer_text = extract_text(buyer_path)
        transformed_text = transform_clauses(buyer_text, seller_text)
        diffs = compute_diffs(seller_text, transformed_text)
        annotated_pdf = annotate_pdf(seller_path, diffs)

        # Clean up temporary files
        os.remove(seller_path)
        os.remove(buyer_path)
        os.rmdir(tmp_dir)

        # Return the annotated PDF
        return Response(
            content=annotated_pdf,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=annotated.pdf"
            }
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        ) 