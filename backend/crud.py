from sqlalchemy.orm import Session
import hashlib
import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any

import models
import schemas
from auth import get_password_hash

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        is_admin=user.is_admin,
        company_id=user.company_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    
    update_data = user.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return False
    db.delete(db_user)
    db.commit()
    return True

# Company Profile CRUD operations
def get_company(db: Session, company_id: int):
    return db.query(models.CompanyProfile).filter(models.CompanyProfile.id == company_id).first()

def get_company_by_name(db: Session, name: str):
    return db.query(models.CompanyProfile).filter(models.CompanyProfile.name == name).first()

def get_companies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.CompanyProfile).offset(skip).limit(limit).all()

def create_company(db: Session, company: schemas.CompanyProfileCreate):
    db_company = models.CompanyProfile(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def update_company(db: Session, company_id: int, company: schemas.CompanyProfileUpdate):
    db_company = db.query(models.CompanyProfile).filter(models.CompanyProfile.id == company_id).first()
    if not db_company:
        return None
    
    update_data = company.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_company, key, value)
    
    db.commit()
    db.refresh(db_company)
    return db_company

def delete_company(db: Session, company_id: int):
    db_company = db.query(models.CompanyProfile).filter(models.CompanyProfile.id == company_id).first()
    if not db_company:
        return False
    db.delete(db_company)
    db.commit()
    return True

# Company Document CRUD operations
def get_document(db: Session, document_id: int):
    return db.query(models.CompanyDocument).filter(models.CompanyDocument.id == document_id).first()

def get_documents_by_company(db: Session, company_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.CompanyDocument)\
        .filter(models.CompanyDocument.company_id == company_id)\
        .offset(skip).limit(limit).all()

def get_primary_template(db: Session, company_id: int):
    return db.query(models.CompanyDocument)\
        .filter(models.CompanyDocument.company_id == company_id, 
                models.CompanyDocument.is_primary_template == True)\
        .first()

def create_document(db: Session, document: schemas.CompanyDocumentCreate, file_content: bytes):
    # Create a hash of the file content
    content_hash = hashlib.sha256(file_content).hexdigest()
    
    # Create a file path (in practice, you'd store in cloud storage or a designated directory)
    file_directory = os.path.join(os.getcwd(), "document_storage", str(document.company_id))
    os.makedirs(file_directory, exist_ok=True)
    
    file_path = os.path.join(file_directory, f"{content_hash}_{document.filename}")
    
    # Save the file
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # If this is being set as primary template, unset any existing primary templates
    if document.is_primary_template:
        existing_templates = db.query(models.CompanyDocument)\
            .filter(models.CompanyDocument.company_id == document.company_id,
                    models.CompanyDocument.is_primary_template == True)\
            .all()
        for template in existing_templates:
            template.is_primary_template = False
    
    # Create document record
    db_document = models.CompanyDocument(
        **document.dict(),
        file_path=file_path,
        content_hash=content_hash
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def delete_document(db: Session, document_id: int):
    db_document = db.query(models.CompanyDocument).filter(models.CompanyDocument.id == document_id).first()
    if not db_document:
        return False
    
    # Delete the file if it exists
    if os.path.exists(db_document.file_path):
        os.remove(db_document.file_path)
    
    db.delete(db_document)
    db.commit()
    return True

# Analysis History CRUD operations
def get_analysis(db: Session, analysis_id: str):
    return db.query(models.AnalysisHistory)\
        .filter(models.AnalysisHistory.analysis_id == analysis_id)\
        .first()

def get_user_analyses(db: Session, user_id: int, skip: int = 0, limit: int = 20):
    return db.query(models.AnalysisHistory)\
        .filter(models.AnalysisHistory.user_id == user_id)\
        .order_by(models.AnalysisHistory.created_at.desc())\
        .offset(skip).limit(limit).all()

def create_analysis(db: Session, analysis: schemas.AnalysisHistoryCreate):
    db_analysis = models.AnalysisHistory(**analysis.dict())
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    return db_analysis 