"""
MongoDB connection and data persistence logic.
Uses Motor for async MongoDB operations.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import get_settings
from models import MealDocument
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Global MongoDB client
_mongodb_client: Optional[AsyncIOMotorClient] = None
_mongodb_database: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongodb():
    """
    Establish connection to MongoDB.
    Should be called on application startup.
    """
    global _mongodb_client, _mongodb_database
    
    settings = get_settings()
    
    try:
        # Add timeout to prevent hanging
        _mongodb_client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=5000  # 5 second timeout
        )
        _mongodb_database = _mongodb_client[settings.mongodb_db_name]
        
        # Test the connection
        await _mongodb_client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB database: {settings.mongodb_db_name}")
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        logger.error("Common fixes:")
        logger.error("1. Check if MongoDB URI is correct in .env file")
        logger.error("2. Whitelist your IP in MongoDB Atlas: Network Access -> Add IP Address")
        logger.error("3. Verify MongoDB credentials are correct")
        raise


async def close_mongodb_connection():
    """
    Close MongoDB connection.
    Should be called on application shutdown.
    """
    global _mongodb_client
    
    if _mongodb_client:
        _mongodb_client.close()
        logger.info("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Get the MongoDB database instance."""
    if _mongodb_database is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongodb() first.")
    return _mongodb_database


async def save_meal(meal_data: MealDocument) -> str:
    """
    Save meal data to MongoDB.
    
    Args:
        meal_data: MealDocument instance containing meal information
        
    Returns:
        meal_id: The unique identifier of the saved meal
    """
    settings = get_settings()
    db = get_database()
    collection = db[settings.mongodb_collection_name]
    
    try:
        # Insert the meal document
        result = await collection.insert_one(meal_data.to_dict())
        logger.info(f"Meal saved to MongoDB with ID: {meal_data.meal_id}")
        return meal_data.meal_id
        
    except Exception as e:
        logger.error(f"Failed to save meal to MongoDB: {e}")
        raise


async def get_meal_by_id(meal_id: str) -> Optional[dict]:
    """
    Retrieve a meal by its ID.
    
    Args:
        meal_id: The unique identifier of the meal
        
    Returns:
        Meal document as dictionary, or None if not found
    """
    settings = get_settings()
    db = get_database()
    collection = db[settings.mongodb_collection_name]
    
    try:
        meal = await collection.find_one({"meal_id": meal_id})
        return meal
        
    except Exception as e:
        logger.error(f"Failed to retrieve meal from MongoDB: {e}")
        raise
