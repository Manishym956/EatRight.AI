from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional
from config import get_settings
from models import User
from db import get_database
import logging
import uuid

# Initialize logger
logger = logging.getLogger(__name__)
settings = get_settings()

# Security configuration
SECRET_KEY = settings.jwt_secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# OAuth configuration
oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    db = get_database()
    user_data = await db["users"].find_one({"user_id": user_id})
    
    if user_data is None:
        raise credentials_exception
        
    return User(**user_data)

async def get_optional_user(token: Optional[str] = Depends(oauth2_scheme_optional)):
    """Get user if token is valid, otherwise return None."""
    if not token:
        return None
    try:
        return await get_current_user(token)
    except HTTPException:
        return None

async def create_or_update_user(user_info: dict) -> User:
    """Create or update user from Google OAuth info."""
    db = get_database()
    users_collection = db["users"]
    
    # Check if user exists
    existing_user = await users_collection.find_one({"google_id": user_info["sub"]})
    
    if existing_user:
        # Update existing user
        user = User(**existing_user)
        user.name = user_info.get("name", user.name)
        user.picture = user_info.get("picture", user.picture)
        
        await users_collection.update_one(
            {"user_id": user.user_id},
            {"$set": user.to_dict()}
        )
        return user
    else:
        # Create new user
        new_user = User(
            user_id=str(uuid.uuid4()),
            google_id=user_info["sub"],
            email=user_info["email"],
            name=user_info["name"],
            picture=user_info.get("picture", "")
        )
        
        await users_collection.insert_one(new_user.to_dict())
        return new_user
