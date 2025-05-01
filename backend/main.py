import os
import uuid
import traceback
from fastapi import FastAPI, File, UploadFile, HTTPException, Request, Depends, status, BackgroundTasks
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from process import extract_text, transform_clauses, process_documents_sync
import base64
import logging
from datetime import timedelta
import uvicorn

# Import database modules
from database import get_db, engine, Base, init_db
import models
import schemas
import db_crud as crud
import auth

# Create database tables
Base.metadata.create_all(bind=engine)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Load environment variables from .env file if not in Docker
if not os.getenv("DOCKER_ENVIRONMENT"):
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

app = FastAPI(
    title="ContractLens API",
    description="API for analyzing and comparing legal contracts",
    version="1.0.0",
)

# CORS middleware configuration
origins = [
    "http://localhost",
    "http://localhost:3000",  # Typical React frontend
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MongoDB connection at startup
@app.on_event("startup")
async def startup_db_client():
    await init_db([
        models.User,
        models.CompanyProfile, 
        models.CompanyDocument, 
        models.AnalysisHistory
    ])
    print("MongoDB connection initialized")

@app.get("/")
async def root():
    return {"message": "ContractLens API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

# Middleware to log requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Skip logging for common health check endpoints
    if request.url.path not in ["/", "/health", "/favicon.ico"]:
        logger.info(f"Request: {request.method} {request.url.path}")
    response = await call_next(request)
    return response

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head>
            <title>ContractLens API</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1 { color: #4A7CFF; }
                code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
            </style>
        </head>
        <body>
            <h1>ContractLens API</h1>
            <p>This is the API backend for ContractLens, a legal contract analysis tool.</p>
            <h2>Available Endpoints:</h2>
            <ul>
                <li><code>GET /health</code> - Check API health</li>
                <li><code>POST /token</code> - User authentication</li>
                <li><code>POST /users</code> - Create a new user</li>
                <li><code>GET /users/me</code> - Get current user profile</li>
                <li><code>POST /process</code> - Upload and analyze contracts</li>
            </ul>
            <p>For more information, visit the <a href="http://localhost:3000">ContractLens Web App</a>.</p>
        </body>
    </html>
    """

# Authentication endpoints
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# User management endpoints
@app.post("/users", response_model=schemas.User)
async def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_username = crud.get_user_by_username(db, username=user.username)
    if db_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    return crud.create_user(db=db, user=user)

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@app.put("/users/me", response_model=schemas.User)
async def update_user(
    user_update: schemas.UserUpdate, 
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if email is being updated and is already taken
    if user_update.email and user_update.email != current_user.email:
        db_user = crud.get_user_by_email(db, email=user_update.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username is being updated and is already taken
    if user_update.username and user_update.username != current_user.username:
        db_user = crud.get_user_by_username(db, username=user_update.username)
        if db_user:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    return crud.update_user(db=db, user_id=current_user.id, user=user_update)

# Company profile endpoints
@app.post("/companies", response_model=schemas.CompanyProfile)
async def create_company(
    company: schemas.CompanyProfileCreate, 
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if company already exists
    db_company = crud.get_company_by_name(db, name=company.name)
    if db_company:
        raise HTTPException(status_code=400, detail="Company name already registered")
    
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create companies")
    
    return crud.create_company(db=db, company=company)

@app.get("/companies/{company_id}", response_model=schemas.CompanyProfile)
async def read_company(
    company_id: int, 
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    db_company = crud.get_company(db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Check if user belongs to this company or is admin
    if current_user.company_id != company_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this company")
    
    return db_company

@app.put("/companies/{company_id}", response_model=schemas.CompanyProfile)
async def update_company(
    company_id: int,
    company: schemas.CompanyProfileUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can update companies")
    
    db_company = crud.get_company(db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return crud.update_company(db=db, company_id=company_id, company=company)

# Document upload and management
@app.post("/documents", response_model=schemas.CompanyDocument)
async def upload_document(
    document_type: str,
    description: str = None,
    is_primary_template: bool = False,
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if user belongs to a company
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="User must belong to a company")
    
    # Validate file is PDF
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Read file content
    file_content = await file.read()
    
    # Create document in DB
    document_data = schemas.CompanyDocumentCreate(
        filename=file.filename,
        document_type=document_type,
        description=description,
        is_primary_template=is_primary_template,
        company_id=current_user.company_id
    )
    
    return crud.create_document(db=db, document=document_data, file_content=file_content)

@app.get("/documents", response_model=list[schemas.CompanyDocument])
async def get_company_documents(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if user belongs to a company
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="User must belong to a company")
    
    return crud.get_documents_by_company(db, company_id=current_user.company_id, skip=skip, limit=limit)

async def validate_pdf(file: UploadFile):
    """Validate that the uploaded file is a PDF."""
    # Check file extension
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    # Check file size (10MB limit)
    MAX_SIZE = 10 * 1024 * 1024  # 10MB
    content = await file.read()
    await file.seek(0)  # Reset file pointer
    
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
    
    # Basic PDF header check
    if not content.startswith(b'%PDF-'):
        raise HTTPException(status_code=400, detail="Invalid PDF file")
    
    return content

def save_analysis_history(db: Session, user_id: int, company_doc: str, client_doc: str, summary: str):
    """Save the analysis history to the database"""
    analysis = schemas.AnalysisHistoryCreate(
        user_id=user_id,
        company_doc_filename=company_doc,
        client_doc_filename=client_doc,
        summary=summary
    )
    crud.create_analysis(db=db, analysis=analysis)

@app.post("/process")
async def process_documents(
    background_tasks: BackgroundTasks,
    seller_tc: UploadFile = File(...),
    buyer_tc: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Processing documents: {seller_tc.filename} and {buyer_tc.filename}")
        
        # Validate files
        await validate_pdf(seller_tc)
        await validate_pdf(buyer_tc)
        
        # Create unique directory for this request
        request_id = str(uuid.uuid4())
        tmp_dir = f"/tmp/{request_id}"
        os.makedirs(tmp_dir, exist_ok=True)
        logger.info(f"Created temporary directory: {tmp_dir}")

        try:
            # Save uploaded files
            seller_path = f"{tmp_dir}/seller.pdf"
            buyer_path = f"{tmp_dir}/buyer.pdf"
            
            with open(seller_path, "wb") as f:
                f.write(await seller_tc.read())
            with open(buyer_path, "wb") as f:
                f.write(await buyer_tc.read())
            
            logger.info("Files saved to temporary directory")

            # Process the documents
            logger.info("Processing documents...")
            annotated_pdf, change_summary = process_documents_sync(buyer_path, seller_path)
            logger.info("Documents processed successfully")
            
            # Add to analysis history in the background
            background_tasks.add_task(
                save_analysis_history, 
                db, 
                current_user.id, 
                seller_tc.filename, 
                buyer_tc.filename, 
                change_summary
            )

            # Return both the PDF and summary
            return JSONResponse(
                content={
                    "pdf": base64.b64encode(annotated_pdf).decode('utf-8'),
                    "summary": change_summary
                }
            )
        finally:
            # Clean up temporary files
            if os.path.exists(seller_path):
                os.remove(seller_path)
            if os.path.exists(buyer_path):
                os.remove(buyer_path)
            if os.path.exists(tmp_dir):
                os.rmdir(tmp_dir)
            logger.info("Temporary files cleaned up")

    except HTTPException:
        # Re-raise validation errors
        raise
    except Exception as e:
        logger.error(f"Error processing documents: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={"error": "An error occurred while processing your documents", "details": str(e)}
        )

@app.get("/analyses", response_model=list[schemas.AnalysisHistory])
async def get_user_analyses(
    skip: int = 0,
    limit: int = 20,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_user_analyses(db, user_id=current_user.id, skip=skip, limit=limit)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 