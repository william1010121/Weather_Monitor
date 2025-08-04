from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    formal_name: Optional[str] = None
    google_name: Optional[str] = None
    profile_picture: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    google_id: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

class UserSettingsUpdate(BaseModel):
    formal_name: Optional[str] = None

class UserResponse(UserBase):
    id: int
    google_id: Optional[str] = None
    is_admin: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserSummary(BaseModel):
    id: int
    email: EmailStr
    display_name: Optional[str] = None
    google_name: str
    is_admin: bool

    class Config:
        from_attributes = True