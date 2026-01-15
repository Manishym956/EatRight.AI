"""
FastAPI application entry point for EatRight AI Nutrition Assistant.
Handles image uploads, AI analysis, authentication, and data persistence.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import RedirectResponse
from contextlib import asynccontextmanager
import logging
from io import BytesIO
from typing import Optional, List
from datetime import datetime

from config import get_settings
from models import MealResponse, MealDocument, User
from db import connect_to_mongodb, close_mongodb_connection, save_meal, get_database
from storage import upload_image_to_gcs
from ai import analyze_food_image
from auth import (
    oauth, create_access_token, get_current_user, 
    get_optional_user, create_or_update_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting EatRight Backend...")
    try:
        await connect_to_mongodb()
        logger.info("Application startup complete")
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise
    
    yield
    
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

# Session Middleware for OAuth
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.jwt_secret_key
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://eat-right-ai.vercel.app",
        "https://eat-right-ai.vercel.app/"
    ],
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


# Auth Endpoints
@app.get("/auth/google")
async def login_google(request: Request):
    """Redirect to Google for authentication."""
    redirect_uri = request.url_for('auth_google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google/callback")
async def auth_google_callback(request: Request):
    """Handle Google OAuth callback."""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            # Fallback if userinfo is not in token
            user_info = await oauth.google.userinfo(token=token)
            
        # Create or update user
        user = await create_or_update_user(user_info)
        
        # Create JWT token
        access_token = create_access_token(
            data={"sub": user.user_id}
        )
        
        # Redirect to frontend with token
        frontend_url = settings.frontend_url
        return RedirectResponse(url=f"{frontend_url}?token={access_token}")
        
    except Exception as e:
        logger.error(f"Auth error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")


@app.get("/auth/me", response_model=User)
async def get_current_user_profile(user: User = Depends(get_current_user)):
    """Get current logged-in user."""
    return user


# Meal Endpoints
@app.post("/upload-meal", response_model=MealResponse)
async def upload_meal(
    file: UploadFile = File(...),
    user: Optional[User] = Depends(get_optional_user)
):
    """Upload and analyze a meal image."""
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        logger.info(f"Processing upload for user: {user.name if user else 'Guest'}")
        
        # Read file
        file_content = await file.read()
        file_stream = BytesIO(file_content)
        
        # Analyze with AI
        ai_analysis = await analyze_food_image(file_stream, file.filename)
        
        # Upload to GCS
        file_stream.seek(0)
        image_url = await upload_image_to_gcs(file_stream, file.filename)
        
        # Create meal document
        meal_document = MealDocument(
            user_id=user.user_id if user else None,
            image_url=image_url,
            food_items=ai_analysis["food_items"],
            health_verdict=ai_analysis["health_verdict"],
            nutrition_advice=ai_analysis["nutrition_advice"],
            calories=ai_analysis.get("calories", 0),
            protein=ai_analysis.get("protein", 0),
            carbs=ai_analysis.get("carbs", 0),
            fats=ai_analysis.get("fats", 0)
        )
        
        # Save to DB
        meal_id = await save_meal(meal_document)
        
        return MealResponse(
            meal_id=meal_document.meal_id,
            image_url=image_url,
            food_items=ai_analysis["food_items"],
            health_verdict=ai_analysis["health_verdict"],
            nutrition_advice=ai_analysis["nutrition_advice"],
            calories=ai_analysis.get("calories", 0),
            protein=ai_analysis.get("protein", 0),
            carbs=ai_analysis.get("carbs", 0),
            fats=ai_analysis.get("fats", 0)
        )
        
    except Exception as e:
        logger.error(f"Error processing meal upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/meals/history", response_model=List[MealDocument])
async def get_meal_history(
    limit: int = 20, 
    skip: int = 0,
    user: User = Depends(get_current_user)
):
    """Get meal history for current user."""
    try:
        db = get_database()
        cursor = db["meals"].find(
            {"user_id": user.user_id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        meals = await cursor.to_list(length=limit)
        return meals
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch history")


@app.get("/meals/stats")
async def get_meal_stats(user: User = Depends(get_current_user)):
    """Get calorie stats for the user."""
    try:
        db = get_database()
        pipeline = [
            {"$match": {"user_id": user.user_id}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "total_calories": {"$sum": "$calories"},
                "total_protein": {"$sum": "$protein"},
                "total_carbs": {"$sum": "$carbs"},
                "total_fats": {"$sum": "$fats"},
                "meal_count": {"$sum": 1}
            }},
            {"$sort": {"_id": -1}},
            {"$limit": 7}  # Last 7 days
        ]
        
        stats = await db["meals"].aggregate(pipeline).to_list(length=7)
        return stats
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
