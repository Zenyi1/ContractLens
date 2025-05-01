import os
import logging
from dotenv import load_dotenv
from sqlalchemy.exc import IntegrityError

from database import SessionLocal, engine, Base
import models
import schemas
import db_crud as crud

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def init():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create a DB session
    db = SessionLocal()
    
    try:
        # Create admin user if it doesn't exist
        admin_email = os.getenv("ADMIN_EMAIL", "admin@contractlens.ai")
        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        admin_password = os.getenv("ADMIN_PASSWORD", "adminpassword")  # In production, use a strong password
        
        # Check if admin already exists
        db_user = crud.get_user_by_username(db, username=admin_username)
        
        if db_user:
            logger.info(f"Admin user {admin_username} already exists")
        else:
            # Create admin user
            admin_user = schemas.UserCreate(
                email=admin_email,
                username=admin_username,
                password=admin_password,
                is_admin=True
            )
            
            db_user = crud.create_user(db=db, user=admin_user)
            logger.info(f"Admin user created: {db_user.username}")
            
            # Create a default company
            company = schemas.CompanyProfileCreate(
                name="ContractLens",
                description="ContractLens AI company profile",
                industry="Legal Technology",
                business_type="SaaS",
                primary_customers="Legal and Sales departments",
                contract_preferences="{}"
            )
            
            db_company = crud.create_company(db=db, company=company)
            logger.info(f"Default company created: {db_company.name}")
            
            # Associate admin with company
            db_user.company_id = db_company.id
            db.commit()
            logger.info(f"Admin user associated with company")
    
    except IntegrityError as e:
        logger.error(f"Database integrity error: {e}")
        db.rollback()
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()
        
if __name__ == "__main__":
    logger.info("Initializing database")
    init()
    logger.info("Database initialization completed") 