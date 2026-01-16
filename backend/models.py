"""
Pydantic models for request/response validation and MongoDB schema.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class User(BaseModel):
    """User model for OAuth authentication."""
    user_id: str = Field(..., description="Unique user identifier (UUID)")
    google_id: str = Field(..., description="Google OAuth ID")
    email: str = Field(..., description="User email address")
    name: str = Field(..., description="User full name")
    picture: str = Field(default="", description="URL to user profile picture")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "google_id": self.google_id,
            "email": self.email,
            "name": self.name,
            "picture": self.picture,
            "created_at": self.created_at
        }


class MealResponse(BaseModel):
    """Response model for the /upload-meal endpoint."""
    
    meal_id: str = Field(..., description="Unique identifier for the meal")
    image_url: str = Field(..., description="Public URL of the uploaded image in GCS")
    food_items: List[str] = Field(..., description="List of identified food items")
    health_verdict: str = Field(..., description="Health assessment: Healthy, Neutral, or Unhealthy")
    nutrition_advice: str = Field(..., description="AI-generated nutritionist advice")
    benefits: List[str] = Field(default_factory=list, description="Health benefits of this meal")
    cautions: List[str] = Field(default_factory=list, description="Health cautions for this meal")
    calories: int = Field(default=0, description="Estimated total calories")
    protein: float = Field(default=0, description="Estimated protein in grams")
    carbs: float = Field(default=0, description="Estimated carbs in grams")
    fats: float = Field(default=0, description="Estimated fats in grams")
    micronutrients: dict = Field(default_factory=dict, description="Micronutrients with amounts and units")
    
    class Config:
        json_schema_extra = {
            "example": {
                "meal_id": "550e8400-e29b-41d4-a716-446655440000",
                "image_url": "https://storage.googleapis.com/bucket/image.jpg",
                "food_items": ["pizza", "soda"],
                "health_verdict": "Unhealthy",
                "nutrition_advice": "High in calories and sugar.",
                "calories": 450,
                "protein": 12.5,
                "carbs": 65.0,
                "fats": 18.0,
                "micronutrients": {
                    "vitamin_c": {"amount": 10, "unit": "mg"},
                    "iron": {"amount": 2.5, "unit": "mg"}
                }
            }
        }


class MealDocument(BaseModel):
    """MongoDB document schema for storing meal data."""
    
    meal_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = Field(default=None, description="ID of the user who uploaded the meal")
    image_url: str
    food_items: List[str]
    health_verdict: str
    nutrition_advice: str
    benefits: List[str] = Field(default_factory=list)
    cautions: List[str] = Field(default_factory=list)
    calories: int = Field(default=0)
    protein: float = Field(default=0)
    carbs: float = Field(default=0)
    fats: float = Field(default=0)
    micronutrients: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> dict:
        """Convert model to dictionary for MongoDB insertion."""
        return {
            "meal_id": self.meal_id,
            "user_id": self.user_id,
            "image_url": self.image_url,
            "food_items": self.food_items,
            "health_verdict": self.health_verdict,
            "nutrition_advice": self.nutrition_advice,
            "benefits": self.benefits,
            "cautions": self.cautions,
            "calories": self.calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fats": self.fats,
            "micronutrients": self.micronutrients,
            "created_at": self.created_at
        }
