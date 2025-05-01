import hashlib
import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from beanie import PydanticObjectId
from motor.motor_asyncio import AsyncIOMotorClient

import models
import schemas
from auth import get_password_hash

# User CRUD operations
async def get_user(user_id: str):
    return await models.User.get(PydanticObjectId(user_id))

async def get_user_by_email(email: str):
    return await models.User.find_one(models.User.email == email)

async def get_user_by_username(username: str):
    return await models.User.find_one(models.User.username == username)

async def get_users(skip: int = 0, limit: int = 100):
    return await models.User.find_all().skip(skip).limit(limit).to_list()

async def create_user(user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        is_admin=user.is_admin,
        company_id=user.company_id
    )
    await db_user.insert()
    return db_user

async def update_user(user_id: str, user: schemas.UserUpdate):
    db_user = await models.User.get(PydanticObjectId(user_id))
    if not db_user:
        return None
    
    update_data = user.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    await db_user.save()
    return db_user

async def delete_user(user_id: str):
    db_user = await models.User.get(PydanticObjectId(user_id))
    if not db_user:
        return False
    await db_user.delete()
    return True

# Company Profile CRUD operations
async def get_company(company_id: str):
    return await models.CompanyProfile.get(PydanticObjectId(company_id))

async def get_company_by_name(name: str):
    return await models.CompanyProfile.find_one(models.CompanyProfile.name == name)

async def get_companies(skip: int = 0, limit: int = 100):
    return await models.CompanyProfile.find_all().skip(skip).limit(limit).to_list()

async def create_company(company: schemas.CompanyProfileCreate):
    db_company = models.CompanyProfile(**company.dict())
    await db_company.insert()
    return db_company

async def update_company(company_id: str, company: schemas.CompanyProfileUpdate):
    db_company = await models.CompanyProfile.get(PydanticObjectId(company_id))
    if not db_company:
        return None
    
    update_data = company.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_company, key, value)
    
    await db_company.save()
    return db_company

async def delete_company(company_id: str):
    db_company = await models.CompanyProfile.get(PydanticObjectId(company_id))
    if not db_company:
        return False
    await db_company.delete()
    return True

# Company Document CRUD operations
async def get_document(document_id: str):
    return await models.CompanyDocument.get(PydanticObjectId(document_id))

async def get_documents_by_company(company_id: str, skip: int = 0, limit: int = 100):
    return await models.CompanyDocument.find(
        models.CompanyDocument.company_id == company_id
    ).skip(skip).limit(limit).to_list()

async def get_primary_template(company_id: str):
    return await models.CompanyDocument.find_one(
        models.CompanyDocument.company_id == company_id,
        models.CompanyDocument.is_primary_template == True
    )

async def create_document(document: schemas.CompanyDocumentCreate, file_content: bytes):
    # Create a hash of the file content
    content_hash = hashlib.sha256(file_content).hexdigest()
    
    # Create a file path (in practice, you'd store in cloud storage or a designated directory)
    file_directory = os.path.join(os.getcwd(), "document_storage", document.company_id)
    os.makedirs(file_directory, exist_ok=True)
    
    file_path = os.path.join(file_directory, f"{content_hash}_{document.filename}")
    
    # Save the file
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # If this is being set as primary template, unset any existing primary templates
    if document.is_primary_template:
        existing_templates = await models.CompanyDocument.find(
            models.CompanyDocument.company_id == document.company_id,
            models.CompanyDocument.is_primary_template == True
        ).to_list()
        
        for template in existing_templates:
            template.is_primary_template = False
            await template.save()
    
    # Create document record
    db_document = models.CompanyDocument(
        **document.dict(),
        file_path=file_path,
        content_hash=content_hash
    )
    
    await db_document.insert()
    return db_document

async def delete_document(document_id: str):
    db_document = await models.CompanyDocument.get(PydanticObjectId(document_id))
    if not db_document:
        return False
    
    # Delete the file if it exists
    if os.path.exists(db_document.file_path):
        os.remove(db_document.file_path)
    
    await db_document.delete()
    return True

# Analysis History CRUD operations
async def get_analysis(analysis_id: str):
    return await models.AnalysisHistory.find_one(
        models.AnalysisHistory.analysis_id == analysis_id
    )

async def get_user_analyses(user_id: str, skip: int = 0, limit: int = 20):
    return await models.AnalysisHistory.find(
        models.AnalysisHistory.user_id == user_id
    ).sort(-models.AnalysisHistory.created_at).skip(skip).limit(limit).to_list()

async def create_analysis(analysis: schemas.AnalysisHistoryCreate):
    db_analysis = models.AnalysisHistory(**analysis.dict())
    await db_analysis.insert()
    return db_analysis

# Sync versions for initialization script
def sync_get_user_by_username(sync_db, username: str):
    return sync_db.users.find_one({"username": username})

def sync_create_user(sync_db, user: Dict):
    return sync_db.users.insert_one(user)

def sync_create_company(sync_db, company: Dict):
    return sync_db.company_profiles.insert_one(company)

def sync_update_user(sync_db, user_id, update):
    return sync_db.users.update_one({"_id": user_id}, {"$set": update}) 