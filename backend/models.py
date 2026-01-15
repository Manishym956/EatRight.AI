"""
Pydantic models for request/response validation and MongoDB schema.
"""

from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
import uuid


class MealResponse(BaseModel):
    """Response model for the /upload-meal endpoint."""
    
    meal_id: str = Field(..., description="Unique identifier for the meal")
    image_url: str = Field(..., description="Public URL of the uploaded image in GCS")
    food_items: List[str] = Field(..., description="List of identified food items")
    health_verdict: str = Field(..., description="Health assessment: Healthy, Neutral, or Unhealthy")
    nutrition_advice: str = Field(..., description="AI-generated nutritionist advice")
    
    class Config:
        json_schema_extra = {
            "example": {
                "meal_id": "550e8400-e29b-41d4-a716-446655440000",
                "image_url": "https://storage.googleapis.com/bucket/image.jpg",
                "food_items": ["pizza", "soda"],
                "health_verdict": "Unhealthy",
                "nutrition_advice": "This meal is high in calories and low in nutrients. Consider adding vegetables and choosing water instead of soda."
            }
        }


class MealDocument(BaseModel):
    """MongoDB document schema for storing meal data."""
    
    meal_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_url: str
    food_items: List[str]
    health_verdict: str
    nutrition_advice: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> dict:
        """Convert model to dictionary for MongoDB insertion."""
        return {
            "meal_id": self.meal_id,
            "image_url": self.image_url,
            "food_items": self.food_items,
            "health_verdict": self.health_verdict,
            "nutrition_advice": self.nutrition_advice,
            "created_at": self.created_at
        }
