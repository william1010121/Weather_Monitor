from fastapi import APIRouter, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func
from typing import List, Optional
from datetime import datetime, timedelta
from ..core.database import get_db
from ..models.observation_model import Observation
from ..models.user_model import User
from ..schemas.observation_schemas import (
    ObservationCreate, 
    ObservationUpdate, 
    ObservationResponse, 
    ObservationSummary,
    DashboardData
)
from ..middleware.auth_middleware import get_current_active_user, get_current_admin_user

router = APIRouter(prefix="/observations", tags=["observations"])

@router.post("/", response_model=ObservationResponse)
async def create_observation(
    observation: ObservationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new weather observation"""
    db_observation = Observation(
        **observation.dict(),
        observer_id=current_user.id
    )
    db.add(db_observation)
    db.commit()
    db.refresh(db_observation)
    return db_observation

@router.get("/", response_model=List[ObservationResponse])
async def get_observations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    observer_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of observations with filtering"""
    query = db.query(Observation).join(User, Observation.observer_id == User.id)
    
    # Filter by date range if provided
    if start_date:
        query = query.filter(Observation.observation_time >= start_date)
    if end_date:
        query = query.filter(Observation.observation_time <= end_date)
    
    # Filter by observer if provided (admin only can see all, users see their own)
    if not current_user.is_admin:
        query = query.filter(Observation.observer_id == current_user.id)
    elif observer_id:
        query = query.filter(Observation.observer_id == observer_id)
    
    observations = query.order_by(desc(Observation.observation_time)).offset(skip).limit(limit).all()
    
    # Add observer name to each observation
    result = []
    for observation in observations:
        obs_dict = observation.__dict__.copy()
        observer = db.query(User).filter(User.id == observation.observer_id).first()
        obs_dict['observer_name'] = observer.display_name or observer.google_name if observer else None
        result.append(ObservationResponse(**obs_dict))
    
    return result

@router.get("/dashboard", response_model=DashboardData)
async def get_dashboard_data(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get latest observation data for dashboard"""
    # Get the most recent observation
    latest_observation = (
        db.query(Observation)
        .order_by(desc(Observation.observation_time))
        .first()
    )
    
    if not latest_observation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No observations found"
        )
    
    # Calculate 24-hour precipitation
    observation_time = latest_observation.observation_time
    twenty_four_hours_ago = observation_time - timedelta(hours=24)
    
    precipitation_24h = (
        db.query(func.sum(Observation.precipitation))
        .filter(
            and_(
                Observation.observation_time >= twenty_four_hours_ago,
                Observation.observation_time <= observation_time,
                Observation.precipitation.isnot(None)
            )
        )
        .scalar()
    )
    
    # Get observer name
    observer = db.query(User).filter(User.id == latest_observation.observer_id).first()
    observer_name = observer.display_name or observer.google_name if observer else None
    
    return DashboardData(
        observation_time=latest_observation.observation_time,
        temperature=latest_observation.temperature,
        wet_bulb_temperature=latest_observation.wet_bulb_temperature,
        precipitation_24h=precipitation_24h,
        current_evaporation_level=latest_observation.current_evaporation_level,
        evaporation_pan_temp=latest_observation.evaporation_pan_temp,
        observer_name=observer_name
    )

@router.get("/{observation_id}", response_model=ObservationResponse)
async def get_observation(
    observation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific observation by ID"""
    observation = db.query(Observation).filter(Observation.id == observation_id).first()
    
    if not observation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observation not found"
        )
    
    # Check permissions - admin can see all, users can only see their own
    if not current_user.is_admin and observation.observer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Add observer name
    obs_dict = observation.__dict__.copy()
    observer = db.query(User).filter(User.id == observation.observer_id).first()
    obs_dict['observer_name'] = observer.display_name or observer.google_name if observer else None
    
    return ObservationResponse(**obs_dict)

@router.put("/{observation_id}", response_model=ObservationResponse)
async def update_observation(
    observation_id: int,
    observation_update: ObservationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a specific observation"""
    observation = db.query(Observation).filter(Observation.id == observation_id).first()
    
    if not observation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observation not found"
        )
    
    # Check permissions - admin can edit all, users can only edit their own
    if not current_user.is_admin and observation.observer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update fields
    update_data = observation_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(observation, field, value)
    
    db.commit()
    db.refresh(observation)
    
    # Add observer name
    obs_dict = observation.__dict__.copy()
    observer = db.query(User).filter(User.id == observation.observer_id).first()
    obs_dict['observer_name'] = observer.display_name or observer.google_name if observer else None
    
    return ObservationResponse(**obs_dict)

@router.delete("/{observation_id}")
async def delete_observation(
    observation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a specific observation"""
    observation = db.query(Observation).filter(Observation.id == observation_id).first()
    
    if not observation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observation not found"
        )
    
    # Check permissions - admin can delete all, users can only delete their own
    if not current_user.is_admin and observation.observer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db.delete(observation)
    db.commit()
    return {"message": "Observation deleted successfully"}

@router.get("/user/{user_id}", response_model=List[ObservationSummary])
async def get_user_observations(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get observations for a specific user (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    observations = (
        db.query(Observation)
        .filter(Observation.observer_id == user_id)
        .order_by(desc(Observation.observation_time))
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return observations