import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv

import models
import schemas
import db_crud
from database import init_db, sync_db
from auth import get_password_hash


# Test function for MongoDB integration
async def test_mongodb():
    print("Starting MongoDB integration test...")

    # Initialize database with our models
    await init_db(
        [
            models.User,
            models.CompanyProfile,
            models.CompanyDocument,
            models.AnalysisHistory,
        ]
    )
    print("Database initialized")

    # Create a test company
    company_data = schemas.CompanyProfileCreate(
        name="Test Company",
        description="A company for testing",
        industry="Technology",
        business_type="B2B",
    )
    company = await db_crud.create_company(company_data)
    print(f"Created company: {company.name} with ID: {company.id}")

    # Create a test user
    user_data = schemas.UserCreate(
        email="test@example.com",
        username="testuser",
        password="password123",
        company_id=str(company.id),
    )
    user = await db_crud.create_user(user_data)
    print(f"Created user: {user.username} with ID: {user.id}")

    # Test retrieving the user
    retrieved_user = await db_crud.get_user_by_username("testuser")
    if retrieved_user:
        print(f"Successfully retrieved user: {retrieved_user.username}")
    else:
        print("Failed to retrieve user")

    # Test updating user
    update_data = schemas.UserUpdate(is_admin=True)
    updated_user = await db_crud.update_user(str(user.id), update_data)
    if updated_user and updated_user.is_admin:
        print("Successfully updated user to admin")
    else:
        print("Failed to update user")

    # Test retrieving company
    retrieved_company = await db_crud.get_company_by_name("Test Company")
    if retrieved_company:
        print(f"Successfully retrieved company: {retrieved_company.name}")
    else:
        print("Failed to retrieve company")

    # Create a fake document for testing
    test_file_content = b"This is a test document content"
    doc_data = schemas.CompanyDocumentCreate(
        filename="test_document.pdf",
        document_type="template",
        description="Test template document",
        is_primary_template=True,
        company_id=str(company.id),
    )

    document = await db_crud.create_document(doc_data, test_file_content)
    print(f"Created document: {document.filename} with ID: {document.id}")

    # Test retrieving the primary template
    primary_template = await db_crud.get_primary_template(str(company.id))
    if primary_template:
        print(f"Successfully retrieved primary template: {primary_template.filename}")
    else:
        print("Failed to retrieve primary template")

    # Test creating an analysis history
    analysis_data = schemas.AnalysisHistoryCreate(
        company_doc_filename="test_document.pdf",
        client_doc_filename="client_doc.pdf",
        summary="This is a test analysis summary",
        user_id=str(user.id),
    )

    analysis = await db_crud.create_analysis(analysis_data)
    print(f"Created analysis with ID: {analysis.analysis_id}")

    # Test retrieving user analyses
    user_analyses = await db_crud.get_user_analyses(str(user.id))
    if user_analyses and len(user_analyses) > 0:
        print(f"Successfully retrieved {len(user_analyses)} analyses for user")
    else:
        print("Failed to retrieve user analyses")

    print("MongoDB integration test completed successfully!")


# Run the test
if __name__ == "__main__":
    asyncio.run(test_mongodb())
