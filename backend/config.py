from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache
import os
import json
import tempfile

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
    
    # Authentication Configuration
    google_client_id: str = Field(default="", alias="GOOGLE_CLIENT_ID")
    google_client_secret: str = Field(default="", alias="GOOGLE_CLIENT_SECRET")
    jwt_secret_key: str = Field(default="your-secret-key", alias="JWT_SECRET_KEY")
    frontend_url: str = Field(default="http://localhost:5173", alias="FRONTEND_URL")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Handle Google Credentials (file path vs JSON content)
        creds = self.google_application_credentials
        if creds and creds.strip().startswith("{"):
            # It's JSON content (Render/Cloud env), write to temp file
            try:
                # Validate JSON
                json.loads(creds)
                
                # Create temp file
                with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
                    f.write(creds)
                    self.google_application_credentials = f.name
                    
                print(f"Created temporary credentials file at: {self.google_application_credentials}")
            except Exception as e:
                print(f"Error parsing GOOGLE_APPLICATION_CREDENTIALS JSON: {e}")
        
        # Set the environment variable for GCS authentication (libraries use this)
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = self.google_application_credentials
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()
