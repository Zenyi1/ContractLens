from typing import List, Optional
from datetime import datetime
import uuid
from pydantic import BaseModel, Field, EmailStr
from beanie import Document, Link, before_event, Replace, Insert

class CompanyProfile(Document):
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None
    industry: Optional[str] = Field(None, index=True)
    business_type: Optional[str] = None  # B2B, B2C, etc.
    primary_customers: Optional[str] = None  # Description of main customer types
    contract_preferences: Optional[str] = None  # JSON or text field for contract preferences
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "company_profiles"
        
    @before_event([Replace, Insert])
    def update_timestamps(self):
        self.updated_at = datetime.utcnow()

class User(Document):
    email: EmailStr = Field(index=True, unique=True)
    username: str = Field(index=True, unique=True)
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    company_id: Optional[str] = None  # Reference to CompanyProfile
    
    class Settings:
        name = "users"
        
    @before_event([Replace, Insert])
    def update_timestamps(self):
        self.updated_at = datetime.utcnow()

class CompanyDocument(Document):
    filename: str
    document_type: str = Field(index=True)  # template, terms, policy, etc.
    description: Optional[str] = None
    file_path: str  # Path to the stored document
    content_hash: str  # For detecting duplicates
    is_primary_template: bool = False  # Mark as the primary template
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    company_id: str  # Reference to CompanyProfile
    
    class Settings:
        name = "company_documents"

class AnalysisHistory(Document):
    analysis_id: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True)
    company_doc_filename: str
    client_doc_filename: str
    summary: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: str  # Reference to User
    
    class Settings:
        name = "analysis_history" 