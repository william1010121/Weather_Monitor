from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from ..core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, index=True, nullable=True)  # Made nullable for admin users
    email = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=True)  # English display name set by admin
    google_name = Column(String, nullable=True)  # Name from Google profile - nullable for admin users
    profile_picture = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    # Add password field for admin users
    password_hash = Column(String, nullable=True)  # Only used for admin login
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())