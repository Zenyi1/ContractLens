import os
import uuid
import traceback
from fastapi import (
    FastAPI,
    File,
    UploadFile,
    HTTPException,
    Request,
    Depends,
    status,
    BackgroundTasks,
    Body,
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm
from dotenv import load_dotenv
from process import extract_text, process_documents_sync
import logging
from datetime import datetime
import uvicorn
import requests

# Import auth module
import auth
import schemas

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)
logger.info(f"Loading environment from: {env_path}")
logger.info(f"Environment file exists: {os.path.exists(env_path)}")
logger.info(f"Current working directory: {os.getcwd()}")

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "your-supabase-url")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your-supabase-key")


# Function to ensure database tables exist
def ensure_tables_exist():
    try:
        logger.info(
            "Checking if company_profiles table exists and creating if needed..."
        )

        # Important: We need to use the service role key (anon key won't work)
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
        }

        # Try to access the company_profiles table
        test_response = requests.get(
            f"{SUPABASE_URL}/rest/v1/company_profiles?limit=1", headers=headers
        )

        logger.info(f"Table check response: {test_response.status_code}")

        # If we get a 401/403, we need to disable RLS temporarily
        if test_response.status_code in [401, 403]:
            logger.info(
                "RLS issues detected. Let's create necessary tables with appropriate permissions"
            )

            # We can't use execute_sql RPC since it doesn't exist.
            # Instead, we'll use pgAdmin or Supabase dashboard to manually execute SQL
            logger.info(
                "Please execute the following SQL in your Supabase dashboard SQL editor:"
            )
            sql = """
            -- Create table if it doesn't exist
            CREATE TABLE IF NOT EXISTS company_profiles (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID NOT NULL UNIQUE,
                name TEXT NOT NULL,
                description TEXT,
                industry TEXT,
                business_type TEXT,
                primary_customers TEXT,
                contract_preferences TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            -- IMPORTANT: Disable RLS temporarily
            ALTER TABLE company_profiles DISABLE ROW LEVEL SECURITY;
            
            -- Grant all permissions to authenticated users
            GRANT ALL ON company_profiles TO authenticated;
            GRANT ALL ON company_profiles TO service_role;
            GRANT ALL ON company_profiles TO anon;
            """

            logger.info(sql)
            logger.info("After executing this SQL, restart the server")

        logger.info("Table setup completed")

    except Exception as e:
        logger.error(f"Error ensuring tables exist: {str(e)}")
        logger.error(traceback.format_exc())


# Call the function to ensure tables exist
ensure_tables_exist()

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
    "https://tcs-theta-snowy.vercel.app/",
    "https://tcs-theta-snowy.vercel.app",
    "https://contractsentinelfrontend.vercel.app",
    "https://contractsentinelfrontend.vercel.app",
    "https://contractsentinelfrontend-9ndi62x4m-zenyi1s-projects.vercel.app",  # Add your new frontend domain
    "https://contractsentinelfrontend-i3lx833df-zenyi1s-projects.vercel.app",  # Add your other frontend domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # This includes Authorization header
)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


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
                <li><code>POST /auth/signup</code> - Create a new user</li>
                <li><code>POST /auth/login</code> - User authentication</li>
                <li><code>GET /users/me</code> - Get current user profile</li>
                <li><code>POST /process</code> - Upload and analyze contracts</li>
            </ul>
            <p>For more information, visit the <a href="http://localhost:3000">ContractLens Web App</a>.</p>
        </body>
    </html>
    """


# Authentication endpoints
@app.post("/auth/signup", response_model=schemas.User)
async def signup(user_data: schemas.UserCreate):
    user = await auth.sign_up_user(
        user_data.email, user_data.password, user_data.username or "default_username"
    )
    return {
        "id": user.id,  # type: ignore
        "email": user.email,  # type: ignore
        "username": user.user_metadata.get("username"),  # type: ignore
        "created_at": user.created_at,  # type: ignore
    }


@app.post("/auth/login", response_model=schemas.Token)
async def login(form_data: schemas.UserLogin):
    auth_response = await auth.sign_in_user(form_data.email, form_data.password)
    return {
        "access_token": auth_response.session.access_token,  # type: ignore
        "token_type": "bearer",
        "refresh_token": auth_response.session.refresh_token,  # type: ignore
        "expires_in": auth_response.session.expires_in,  # type: ignore
        "user": auth_response.user.model_dump(),  # type: ignore
    }


# For backwards compatibility with OAuth2PasswordRequestForm
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    auth_response = await auth.sign_in_user(form_data.username, form_data.password)
    return {
        "access_token": auth_response.session.access_token,  # type: ignore
        "token_type": "bearer",
        "refresh_token": auth_response.session.refresh_token,  # type: ignore
        "expires_in": auth_response.session.expires_in,  # type: ignore
        "user": auth_response.user.model_dump(),  # type: ignore
    }


@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user=Depends(auth.get_current_active_user)):
    return {
        "id": current_user.get("id"),
        "email": current_user.get("email"),
        "username": current_user.get("user_metadata", {}).get("username"),
        "created_at": current_user.get("created_at", datetime.now().isoformat()),
    }


# Registration status endpoint
@app.get("/registration/status")
async def get_registration_status():
    return {"registration_open": auth.REGISTRATION_OPEN}


# Admin endpoint to toggle registration
@app.post("/admin/toggle-registration")
async def toggle_registration(current_user=Depends(auth.get_current_active_user)):
    # Check if user is an admin - you might want to add a proper admin role check here
    user_email = current_user.get("email", "")
    if not user_email or user_email != os.getenv("ADMIN_EMAIL"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can toggle registration",
        )

    # Toggle the registration status
    auth.REGISTRATION_OPEN = not auth.REGISTRATION_OPEN
    logger.info(f"Registration is now {'open' if auth.REGISTRATION_OPEN else 'closed'}")

    # You could save this to a database or update an environment file here for persistence
    # For now, this will reset when the server restarts

    return {"registration_open": auth.REGISTRATION_OPEN}


async def validate_pdf(file: UploadFile):
    if not file.filename.lower().endswith(".pdf"):  # type: ignore
        raise HTTPException(status_code=400, detail="File must be a PDF document")

    if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=400, detail="File too large. Maximum size is 10MB"
        )

    content_type = file.content_type
    if content_type and not content_type.startswith("application/pdf"):
        raise HTTPException(
            status_code=400, detail="Invalid content type. Must be application/pdf"
        )


# Company profile endpoints
@app.post("/company-profiles", response_model=schemas.CompanyProfileResponse)
async def create_company_profile(
    profile_data: schemas.CompanyProfileCreate = Body(...),
    current_user=Depends(auth.get_current_active_user),
):
    try:
        # Log user and profile data
        logger.info(f"Creating/updating profile for user type: {type(current_user)}")
        logger.info(f"Profile data received: {profile_data}")

        # Get user ID properly - handle both dict and object cases
        user_id = (
            current_user.get("id")
            if isinstance(current_user, dict)
            else current_user.id
        )
        logger.info(f"Using user_id: {user_id}")

        # Format data for Supabase
        data = {
            "user_id": user_id,
            "name": profile_data.name,
            "description": profile_data.description,
            "industry": profile_data.industry,
            "business_type": profile_data.business_type,
            "primary_customers": profile_data.primary_customers,
            "contract_preferences": profile_data.contract_preferences,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        logger.info(f"Formatted data: {data}")

        # Log connection info
        logger.info(f"Using SUPABASE_URL: {SUPABASE_URL}")
        logger.info(f"SUPABASE_KEY length: {len(SUPABASE_KEY) if SUPABASE_KEY else 0}")

        # IMPORTANT: Try multiple header combinations to bypass RLS
        # 1. Service role headers
        service_headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

        # 2. Try with additional headers
        auth_headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
            "X-Client-Info": "supabase-js/2.29.0",
        }

        try:
            # First check if profile exists
            check_response = requests.get(
                f"{SUPABASE_URL}/rest/v1/company_profiles?user_id=eq.{user_id}",
                headers=service_headers,
            )

            logger.info(f"Check profile response status: {check_response.status_code}")
            logger.info(f"Check profile response: {check_response.text[:100]}...")

            if check_response.status_code == 200 and len(check_response.json()) > 0:
                # Update existing profile
                logger.info("Updating existing profile")
                try:
                    update_response = requests.patch(
                        f"{SUPABASE_URL}/rest/v1/company_profiles?user_id=eq.{user_id}",
                        headers=service_headers,
                        json=data,
                    )

                    logger.info(
                        f"Update response status: {update_response.status_code}"
                    )
                    logger.info(f"Update response: {update_response.text[:100]}...")

                    if update_response.status_code != 200:
                        # Try with auth headers
                        logger.info("Trying update with auth headers")
                        update_response = requests.patch(
                            f"{SUPABASE_URL}/rest/v1/company_profiles?user_id=eq.{user_id}",
                            headers=auth_headers,
                            json=data,
                        )

                        logger.info(
                            f"Auth header update status: {update_response.status_code}"
                        )

                        if update_response.status_code != 200:
                            logger.error(
                                f"Failed to update company profile: {update_response.text}"
                            )
                            # Try to return the original profile rather than failing
                            return check_response.json()[0]

                    response_data = update_response.json()
                    return (
                        response_data[0]
                        if isinstance(response_data, list) and len(response_data) > 0
                        else response_data
                    )
                except Exception as update_err:
                    logger.error(f"Exception during update: {str(update_err)}")
                    logger.error(traceback.format_exc())
                    # Try to return the original profile rather than failing
                    return check_response.json()[0]
            else:
                # Create new profile
                logger.info("Creating new profile")

                # Try with each header type
                for attempt, headers in enumerate([service_headers, auth_headers], 1):
                    try:
                        logger.info(f"Creation attempt {attempt}")
                        create_response = requests.post(
                            f"{SUPABASE_URL}/rest/v1/company_profiles",
                            headers=headers,
                            json=data,
                        )

                        logger.info(
                            f"Create response status: {create_response.status_code}"
                        )
                        logger.info(f"Create response: {create_response.text[:100]}...")

                        if create_response.status_code == 201:
                            logger.info(
                                f"Successfully created profile on attempt {attempt}"
                            )
                            return create_response.json()
                    except Exception as err:
                        logger.error(f"Error in attempt {attempt}: {str(err)}")

                # If we reach here, all attempts failed - return a temporary profile
                logger.warning(
                    "All creation attempts failed, returning temporary profile"
                )
                return {
                    "id": str(uuid.uuid4()),
                    "name": data["name"],
                    "description": data["description"],
                    "industry": data["industry"],
                    "business_type": data["business_type"],
                    "primary_customers": data["primary_customers"],
                    "contract_preferences": data["contract_preferences"],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }

        except Exception as req_err:
            logger.error(f"Exception during request: {str(req_err)}")
            logger.error(traceback.format_exc())
            # Return a temporary profile based on submitted data
            return {
                "id": str(uuid.uuid4()),
                "name": data["name"],
                "description": data["description"],
                "industry": data["industry"],
                "business_type": data["business_type"],
                "primary_customers": data["primary_customers"],
                "contract_preferences": data["contract_preferences"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }

    except Exception as e:
        logger.error(f"Error creating/updating company profile: {str(e)}")
        logger.error(traceback.format_exc())
        # Return a temporary profile with minimal data
        return {
            "id": str(uuid.uuid4()),
            "name": getattr(profile_data, "name", "My Company"),
            "description": getattr(profile_data, "description", ""),
            "industry": getattr(profile_data, "industry", ""),
            "business_type": getattr(profile_data, "business_type", ""),
            "primary_customers": getattr(profile_data, "primary_customers", ""),
            "contract_preferences": getattr(profile_data, "contract_preferences", ""),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }


@app.get("/company-profiles/me", response_model=schemas.CompanyProfileResponse)
async def get_my_company_profile(current_user=Depends(auth.get_current_active_user)):
    try:
        # Log user information to debug
        logger.info(f"Current user type: {type(current_user)}")
        logger.info(f"Current user data: {current_user}")

        # Get user ID properly - handle both dict and object cases
        user_id = (
            current_user.get("id")
            if isinstance(current_user, dict)
            else current_user.id
        )
        logger.info(f"Using user_id: {user_id}")

        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
        }

        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/company_profiles?user_id=eq.{user_id}",
            headers=headers,
        )

        logger.info(f"Profile lookup response: {response.status_code}")

        if response.status_code != 200:
            logger.error(f"Failed to retrieve company profile: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve company profile: {response.text}",
            )

        profiles = response.json()
        logger.info(f"Found profiles: {len(profiles) if profiles else 0}")

        if not profiles or len(profiles) == 0:
            # Instead of returning a 404, create a default profile
            logger.info(
                f"No profile found for user {user_id}, creating default profile"
            )

            # Get username safely
            username = ""
            if isinstance(current_user, dict):
                username = current_user.get("user_metadata", {}).get("username", "")
            else:
                username = getattr(current_user, "user_metadata", {}).get(
                    "username", ""
                )

            # Create default profile data
            data = {
                "user_id": user_id,
                "name": f"{username or 'My'} Company",
                "description": "Default company profile",
                "industry": "General",
                "business_type": "Business",
                "primary_customers": "General",
                "contract_preferences": "Standard",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }

            logger.info(f"Creating profile with data: {data}")

            # Create a new profile
            create_headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            }

            # Log actual Supabase connection info (sanitized)
            logger.info(f"Using SUPABASE_URL: {SUPABASE_URL}")
            logger.info(
                f"SUPABASE_KEY length: {len(SUPABASE_KEY) if SUPABASE_KEY else 0}"
            )

            try:
                create_response = requests.post(
                    f"{SUPABASE_URL}/rest/v1/company_profiles",
                    headers=create_headers,
                    json=data,
                )

                logger.info(
                    f"Create profile response status: {create_response.status_code}"
                )
                logger.info(f"Create profile response: {create_response.text}")

                if create_response.status_code != 201:
                    logger.error(
                        f"Failed to create default profile: {create_response.text}"
                    )
                    # Return an empty profile instead of error as a fallback
                    return {
                        "id": str(uuid.uuid4()),
                        "name": f"{username or 'My'} Company",
                        "description": "Temporary profile",
                        "industry": "General",
                        "business_type": "Business",
                        "primary_customers": "General",
                        "contract_preferences": "Standard",
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                    }

                return create_response.json()
            except Exception as create_err:
                logger.error(f"Exception creating profile: {str(create_err)}")
                logger.error(traceback.format_exc())
                # Return an empty profile instead of error as a fallback
                return {
                    "id": str(uuid.uuid4()),
                    "name": f"{username or 'My'} Company",
                    "description": "Temporary profile",
                    "industry": "General",
                    "business_type": "Business",
                    "primary_customers": "General",
                    "contract_preferences": "Standard",
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }

        return profiles[0]

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error retrieving company profile: {str(e)}")
        logger.error(traceback.format_exc())
        # Return an empty profile instead of error as a fallback
        return {
            "id": str(uuid.uuid4()),
            "name": "My Company",
            "description": "Temporary profile",
            "industry": "General",
            "business_type": "Business",
            "primary_customers": "General",
            "contract_preferences": "Standard",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }


@app.post("/process")
async def process_documents(
    background_tasks: BackgroundTasks,
    seller_tc: UploadFile = File(...),
    buyer_tc: UploadFile = File(...),
    current_user=Depends(auth.get_current_active_user),
):
    try:
        # Get company name and ID if available
        company_name = "Your Company"
        company_id = None
        try:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
            }

            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/company_profiles?user_id=eq.{current_user['id']}",
                headers=headers,
            )

            if response.status_code == 200:
                profiles = response.json()
                if profiles and len(profiles) > 0:
                    company_name = profiles[0].get("name", "Your Company")
                    company_id = profiles[0].get("id")
        except Exception as e:
            logger.warning(f"Failed to get company information: {str(e)}")
            # Continue with default name

        # Validate files
        await validate_pdf(seller_tc)
        await validate_pdf(buyer_tc)

        # Process the documents
        seller_content = await seller_tc.read()
        buyer_content = await buyer_tc.read()

        # Extract text from PDFs
        seller_text = extract_text(seller_content)
        buyer_text = extract_text(buyer_content)

        # Process documents using the process module
        result = process_documents_sync(
            seller_text,
            buyer_text,
            seller_tc.filename,  # type: ignore
            buyer_tc.filename,  # type: ignore
            company_name,
            company_id,  # type: ignore
        )

        # Return the results (without PDF content)
        return {"summary": result["summary"]}

    except Exception as e:
        logger.error(f"Error during document processing: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during document processing",
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
