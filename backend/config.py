from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache
import os

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Gemini AI Configuration
    gemini_api_key: str = Field(..., alias="GEMINI_API_KEY")
    
    # MongoDB Configuration
    mongodb_uri: str = Field(..., alias="MONGODB_URI")
    mongodb_db_name: str = Field(default="eatright", alias="MONGODB_DB_NAME")
    mongodb_collection_name: str = Field(default="meals", alias="MONGODB_COLLECTION_NAME")
    
    # Google Cloud Storage Configuration
    gcs_bucket_name: str = Field(..., alias="GCS_BUCKET_NAME")
    google_application_credentials: str = Field(..., alias="GOOGLE_APPLICATION_CREDENTIALS")
    
    # Application Configuration
    environment: str = Field(default="development", alias="ENVIRONMENT")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Set the environment variable for GCS authentication
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = self.google_application_credentials
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()
