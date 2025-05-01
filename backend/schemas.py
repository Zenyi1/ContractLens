from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    is_admin: bool = False

class UserCreate(UserBase):
    password: str
    company_id: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    company_id: Optional[str] = None

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    company_id: Optional[str] = None

    class Config:
        orm_mode = True

# Company profile schemas
class CompanyProfileBase(BaseModel):
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    business_type: Optional[str] = None
    primary_customers: Optional[str] = None
    contract_preferences: Optional[str] = None

class CompanyProfileCreate(CompanyProfileBase):
    pass

class CompanyProfileUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    business_type: Optional[str] = None
    primary_customers: Optional[str] = None
    contract_preferences: Optional[str] = None

class CompanyProfileResponse(CompanyProfileBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Company document schemas
class CompanyDocumentBase(BaseModel):
    filename: str
    document_type: str
    description: Optional[str] = None
    is_primary_template: bool = False

class CompanyDocumentCreate(CompanyDocumentBase):
    company_id: str

class CompanyDocumentResponse(CompanyDocumentBase):
    id: str
    file_path: str
    content_hash: str
    uploaded_at: datetime
    company_id: str

    class Config:
        orm_mode = True

# Analysis history schemas
class AnalysisHistoryBase(BaseModel):
    company_doc_filename: str
    client_doc_filename: str
    summary: str

class AnalysisHistoryCreate(AnalysisHistoryBase):
    user_id: str

class AnalysisHistoryResponse(AnalysisHistoryBase):
    id: str
    analysis_id: str
    created_at: datetime
    user_id: str

    class Config:
        orm_mode = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None 