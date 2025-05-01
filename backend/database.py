import os
import motor.motor_asyncio
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from beanie import init_beanie

# Load environment variables
load_dotenv()

# MongoDB connection settings
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/contractlens")

# Create MongoDB client
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client.get_default_database()

# Sync client for initialization scripts
sync_client = MongoClient(MONGODB_URL)
sync_db = sync_client.get_default_database()

# Initialize Beanie with the document models
async def init_db(document_models):
    await init_beanie(
        database=db,
        document_models=document_models
    ) 