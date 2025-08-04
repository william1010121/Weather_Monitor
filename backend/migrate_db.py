#!/usr/bin/env python
"""
Database migration script to add password_hash column and update schema
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from src.core.database import engine, SessionLocal
from src.models.user_model import User
from src.core.security import get_password_hash

def migrate_database():
    """Add password_hash column and make google_id nullable"""
    
    with engine.connect() as conn:
        # Start transaction
        trans = conn.begin()
        
        try:
            print("Starting database migration...")
            
            # Add password_hash column if it doesn't exist
            print("Adding password_hash column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS password_hash VARCHAR;
            """))
            
            # Make google_id nullable if it isn't already
            print("Making google_id nullable...")
            conn.execute(text("""
                ALTER TABLE users 
                ALTER COLUMN google_id DROP NOT NULL;
            """))
            
            # Make google_name nullable if it isn't already
            print("Making google_name nullable...")
            conn.execute(text("""
                ALTER TABLE users 
                ALTER COLUMN google_name DROP NOT NULL;
            """))
            
            # Commit the schema changes
            trans.commit()
            print("Database migration completed successfully!")
            
        except Exception as e:
            print(f"Migration failed: {e}")
            trans.rollback()
            raise

def create_admin_user():
    """Create the default admin user"""
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(
            (User.email == "admin") | (User.email == "admin@weather-logger.com")
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
            print("✅ Default admin user created: username=admin, password=admin")
        else:
            print("ℹ️  Admin user already exists")
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_database()
    create_admin_user()