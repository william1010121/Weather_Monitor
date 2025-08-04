from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional, Union
import os


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://weather_user:weather_password@localhost:5432/weather_db"
    
    # Google OAuth
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str = "http://localhost:8000/auth/google/callback"
    
    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS - handle as string in env, convert to list in property
    allowed_origins_str: str = Field(default="http://localhost:3000", alias="ALLOWED_ORIGINS")
    
    # Environment
    environment: str = "development"
    debug: bool = True

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins_str.split(',')]

    model_config = {
        "env_file": ".env",
        "populate_by_name": True
    }


settings = Settings()