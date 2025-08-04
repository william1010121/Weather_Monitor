from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://weather_user:weather_password@localhost:5432/weather_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_default_admin():
    """Initialize default admin user if it doesn't exist"""
    from ..models.user_model import User
    from ..core.security import get_password_hash
    
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(
            User.is_admin == True,
            User.password_hash.isnot(None)
        ).first()
        
        if not admin_user:
            # Create default admin user
            admin_user = User(
                email="admin@weather-logger.com",
                display_name="Administrator",
                google_name="Administrator",
                google_id=None,  # No Google ID for admin
                profile_picture=None,
                is_admin=True,
                is_active=True,
                password_hash=get_password_hash("admin")
            )
            db.add(admin_user)
            db.commit()
            print("Default admin user created: username=admin, password=admin")
        else:
            print("Admin user already exists")
            
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()