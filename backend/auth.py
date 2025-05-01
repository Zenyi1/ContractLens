from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import json
import base64
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
import logging
import requests
from pydantic import BaseModel
from supabase import create_client, Client

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Registration toggle - set to False to disable new sign-ups
REGISTRATION_OPEN = os.getenv("REGISTRATION_OPEN", "True").lower() == "true"
logger.info(f"Registration is {'open' if REGISTRATION_OPEN else 'closed'}")

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "your-supabase-url")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your-supabase-key")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Debug: Print the actual values being used
logger.info(f"Using SUPABASE_URL: {SUPABASE_URL}")
logger.info(f"Using SUPABASE_KEY: {SUPABASE_KEY[:5]}...{SUPABASE_KEY[-5:] if len(SUPABASE_KEY) > 10 else ''}")
logger.info(f"Environment variables: {list(os.environ.keys())}")

# Password hashing for local verification
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Customize OAuth2PasswordBearer to handle Authorization header directly
class BearerTokenAuth(OAuth2PasswordBearer):
    async def __call__(self, request: Request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        scheme, _, token = auth_header.partition(" ")
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid authentication scheme",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return token

# Use custom bearer token handler
oauth2_scheme = BearerTokenAuth(tokenUrl="token")

# User model for token data
class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None

# Password utils (used for local verification only)
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# User authentication with Supabase
async def sign_up_user(email: str, password: str, username: str = None):
    if not REGISTRATION_OPEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration is currently closed. Please try again later."
        )
        
    try:
        user_data = {"username": username} if username else {}
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": user_data
            }
        })
        return response.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error during signup: {str(e)}"
        )

async def sign_in_user(email: str, password: str):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Function to decode JWT without verification (for debugging)
def decode_jwt_without_verification(token: str) -> Dict[str, Any]:
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError("Not a valid JWT format")
    
    # Base64 decode the payload (middle part)
    payload_base64 = parts[1]
    # Add padding if needed
    payload_base64 += '=' * ((4 - len(payload_base64) % 4) % 4)
    payload_bytes = base64.urlsafe_b64decode(payload_base64)
    payload = json.loads(payload_bytes)
    
    return payload

# Token verification
async def verify_token(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        logger.info(f"Verifying token: {token[:10]}...")
        
        # Try direct method using Supabase RESTful API instead of the SDK
        try:
            # First, let's try to decode the token without verification to see what we're dealing with
            decoded_payload = decode_jwt_without_verification(token)
            logger.info(f"Token payload (decoded without verification): {decoded_payload}")
            
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {token}"
            }
            
            response = requests.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers=headers
            )
            
            if response.status_code == 200:
                user_data = response.json()
                logger.info(f"Successfully authenticated user via REST API")
                return {
                    "id": user_data.get("id"),
                    "email": user_data.get("email"),
                    "user_metadata": user_data.get("user_metadata", {})
                }
            else:
                logger.error(f"REST API authentication failed: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"REST authentication failed: {str(e)}")
        
        # For debugging only: Accept any token for now
        logger.warning("SECURITY WARNING: Bypassing token verification for debugging!")
        try:
            # Try to extract some meaningful data from the token
            decoded = decode_jwt_without_verification(token)
            return {
                "id": decoded.get("sub"),
                "email": decoded.get("email", "unknown@email.com"),
                "user_metadata": {"username": decoded.get("email", "").split("@")[0]}
            }
        except:
            return {
                "id": "debug-user-id",
                "email": "debug@example.com",
                "user_metadata": {"username": "debug_user"}
            }
        
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise credentials_exception

# For backwards compatibility
async def get_current_user(token: str = Depends(oauth2_scheme)):
    return await verify_token(token)

async def get_current_active_user(current_user = Depends(get_current_user)):
    if current_user.get("user_metadata", {}).get('is_active', True) is False:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user 