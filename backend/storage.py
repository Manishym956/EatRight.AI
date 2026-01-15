"""
Google Cloud Storage integration for image uploads.
Handles file upload and public URL generation.
"""

from google.cloud import storage
from config import get_settings
import uuid
import logging
from typing import BinaryIO
import os

logger = logging.getLogger(__name__)


def get_storage_client() -> storage.Client:
    """
    Get Google Cloud Storage client.
    Credentials are loaded from GOOGLE_APPLICATION_CREDENTIALS env variable.
    """
    settings = get_settings()
    
    # Ensure credentials file path is set
    if not os.path.exists(settings.google_application_credentials):
        raise FileNotFoundError(
            f"Google Cloud credentials file not found: {settings.google_application_credentials}"
        )
    
    return storage.Client()


async def upload_image_to_gcs(file_content: BinaryIO, filename: str) -> str:
    """
    Upload an image to Google Cloud Storage.
    
    Args:
        file_content: Binary file content
        filename: Original filename
        
    Returns:
        public_url: Public URL of the uploaded image
    """
    settings = get_settings()
    
    try:
        # Initialize GCS client
        client = get_storage_client()
        bucket = client.bucket(settings.gcs_bucket_name)
        
        # Generate unique filename to avoid collisions
        file_extension = os.path.splitext(filename)[1]
        unique_filename = f"meals/{uuid.uuid4()}{file_extension}"
        
        # Create blob and upload
        blob = bucket.blob(unique_filename)
        
        # Reset file pointer to beginning
        file_content.seek(0)
        
        # Upload the file
        blob.upload_from_file(file_content, content_type=get_content_type(file_extension))
        
        # For uniform bucket-level access, we need to make the bucket public or use signed URLs
        # Using public URL (bucket must be configured for public access)
        public_url = f"https://storage.googleapis.com/{settings.gcs_bucket_name}/{unique_filename}"
        
        logger.info(f"Image uploaded to GCS: {unique_filename}")
        logger.info(f"Public URL: {public_url}")
        
        return public_url
        
    except Exception as e:
        logger.error(f"Failed to upload image to GCS: {e}")
        raise


def get_content_type(file_extension: str) -> str:
    """
    Get MIME type based on file extension.
    
    Args:
        file_extension: File extension (e.g., '.jpg', '.png')
        
    Returns:
        MIME type string
    """
    content_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp'
    }
    
    return content_types.get(file_extension.lower(), 'application/octet-stream')
