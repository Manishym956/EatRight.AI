"""
FastAPI application entry point for EatRight AI Nutrition Assistant.
Handles image uploads, AI analysis, and data persistence.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from io import BytesIO

from config import get_settings
from models import MealResponse, MealDocument
from db import connect_to_mongodb, close_mongodb_connection, save_meal
from storage import upload_image_to_gcs
from ai import analyze_food_image

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting EatRight Backend...")
    try:
        await connect_to_mongodb()
        logger.info("Application startup complete")
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down EatRight Backend...")
    await close_mongodb_connection()
    logger.info("Application shutdown complete")


# Initialize FastAPI app
app = FastAPI(
    title="EatRight AI Nutrition Assistant",
    description="Backend API for AI-powered food analysis and nutrition advice",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "EatRight AI Nutrition Assistant",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "database": "connected",
        "storage": "ready",
        "ai": "ready"
    }


@app.post("/upload-meal", response_model=MealResponse)
async def upload_meal(file: UploadFile = File(...)):
    """
    Upload a food image and get AI-powered nutrition analysis.
    
    Args:
        file: Image file (multipart/form-data)
        
    Returns:
        MealResponse with meal_id, image_url, food_items, health_verdict, and nutrition_advice
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an image (image/*)"
            )
        
        logger.info(f"Processing meal upload: {file.filename}")
        
        # Read file content
        file_content = await file.read()
        file_stream = BytesIO(file_content)
        
        # Step 1: Analyze image with Gemini AI
        logger.info("Analyzing food image with Gemini AI...")
        ai_analysis = await analyze_food_image(file_stream, file.filename)
        
        # Step 2: Upload image to Google Cloud Storage
        logger.info("Uploading image to Google Cloud Storage...")
        file_stream.seek(0)  # Reset stream position
        image_url = await upload_image_to_gcs(file_stream, file.filename)
        
        # Step 3: Create meal document
        meal_document = MealDocument(
            image_url=image_url,
            food_items=ai_analysis["food_items"],
            health_verdict=ai_analysis["health_verdict"],
            nutrition_advice=ai_analysis["nutrition_advice"]
        )
        
        # Step 4: Save to MongoDB
        logger.info("Saving meal data to MongoDB...")
        meal_id = await save_meal(meal_document)
        
        # Step 5: Return response
        response = MealResponse(
            meal_id=meal_document.meal_id,
            image_url=image_url,
            food_items=ai_analysis["food_items"],
            health_verdict=ai_analysis["health_verdict"],
            nutrition_advice=ai_analysis["nutrition_advice"]
        )
        
        logger.info(f"Meal upload complete: {meal_id}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing meal upload: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process meal upload: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
