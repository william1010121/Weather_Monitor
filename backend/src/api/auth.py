from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.requests_client import OAuth2Session
from typing import Dict, Any
import httpx
from ..core.database import get_db
from ..core.config import settings
from ..core.security import create_access_token, verify_password, get_password_hash
from ..models.user_model import User
from ..schemas.user_schemas import UserResponse, AdminLogin

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.get("/google")
async def google_login():
    """Initiate Google OAuth2 login"""
    oauth = OAuth2Session(
        client_id=settings.google_client_id,
        redirect_uri=settings.google_redirect_uri,
        scope="openid email profile"
    )
    
    authorization_url, state = oauth.authorization_url(
        "https://accounts.google.com/o/oauth2/auth"
    )
    
    return {"authorization_url": authorization_url, "state": state}

@router.get("/google/callback")
async def google_callback(code: str, state: str, db: Session = Depends(get_db)):
    """Handle Google OAuth2 callback"""
    try:
        # Exchange code for token
        oauth = OAuth2Session(
            client_id=settings.google_client_id,
            redirect_uri=settings.google_redirect_uri,
        )
        
        token = oauth.fetch_token(
            "https://oauth2.googleapis.com/token",
            code=code,
            client_secret=settings.google_client_secret,
        )
        
        # Get user info from Google
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {token['access_token']}"}
            )
            user_info = response.json()
        
        # Check if user exists or create new user
        user = db.query(User).filter(User.google_id == user_info["id"]).first()
        
        if not user:
            user = User(
                google_id=user_info["id"],
                email=user_info["email"],
                google_name=user_info["name"],
                profile_picture=user_info.get("picture"),
                display_name=None,  # To be set by admin
                is_admin=False,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update user info from Google
            user.google_name = user_info["name"]
            user.profile_picture = user_info.get("picture")
            db.commit()
            db.refresh(user)
        
        # Create access token
        access_token = create_access_token(subject=user.id)
        
        # Redirect to frontend with token
        return RedirectResponse(
            url=f"http://localhost:3000/auth/callback?token={access_token}",
            status_code=status.HTTP_302_FOUND
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authentication failed: {str(e)}"
        )

@router.post("/google/verify")
async def verify_google_token(token_data: Dict[str, str], db: Session = Depends(get_db)):
    """Verify Google ID token from frontend"""
    try:
        # This endpoint is for frontend that handles Google OAuth directly
        # and sends us the user info to verify and create/update user
        
        google_id = token_data.get("google_id")
        email = token_data.get("email")
        name = token_data.get("name")
        picture = token_data.get("picture")
        
        if not all([google_id, email, name]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required user information"
            )
        
        # Check if user exists or create new user
        user = db.query(User).filter(User.google_id == google_id).first()
        
        if not user:
            user = User(
                google_id=google_id,
                email=email,
                google_name=name,
                profile_picture=picture,
                display_name=None,
                is_admin=False,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update user info
            user.google_name = name
            user.profile_picture = picture
            db.commit()
            db.refresh(user)
        
        # Create access token
        access_token = create_access_token(subject=user.id)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.from_orm(user)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authentication failed: {str(e)}"
        )

@router.post("/logout")
async def logout():
    """Logout (client should remove the token)"""
    return {"message": "Successfully logged out"}

@router.post("/admin/login")
async def admin_login(login_data: AdminLogin, db: Session = Depends(get_db)):
    """Admin login with username and password"""
    try:
        # For admin login, we check email, display_name, and also allow 'admin' as shortcut
        if login_data.username == "admin":
            # Special case: allow 'admin' as username for any admin user
            user = db.query(User).filter(
                User.is_admin == True,
                User.password_hash.isnot(None)
            ).first()
        else:
            # Regular case: match by email or display_name
            user = db.query(User).filter(
                (User.email == login_data.username) | (User.display_name == login_data.username),
                User.is_admin == True,
                User.password_hash.isnot(None)
            ).first()
        
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive"
            )
        
        # Create access token
        access_token = create_access_token(subject=user.id)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.from_orm(user)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )