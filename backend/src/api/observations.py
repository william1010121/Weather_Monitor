from fastapi import APIRouter, HTTPException, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func
from typing import List, Optional
from datetime import datetime, timedelta
import csv
import io
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
        obs_dict['observer_name'] = observer.formal_name or observer.display_name or observer.google_name if observer else None
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
    
    # Get observer name (prioritize formal_name set by user)
    observer = db.query(User).filter(User.id == latest_observation.observer_id).first()
    observer_name = observer.formal_name or observer.display_name or observer.google_name if observer else None
    
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
    obs_dict['observer_name'] = observer.formal_name or observer.display_name or observer.google_name if observer else None
    
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
    obs_dict['observer_name'] = observer.formal_name or observer.display_name or observer.google_name if observer else None
    
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

@router.get("/export/csv")
async def export_observations_csv(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Export observations as CSV file"""
    try:
        # Build query without join first, then get observations
        query = db.query(Observation)
        
        # Filter by date range if provided
        if start_date:
            query = query.filter(Observation.observation_time >= start_date)
        if end_date:
            query = query.filter(Observation.observation_time <= end_date)
        
        # Remove user filtering - all authenticated users can access all data
        # No filtering by observer_id for any user
        
        observations = query.order_by(desc(Observation.observation_time)).all()
        
        # Create CSV data
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header (Chinese field names for UI display)
        writer.writerow([
            '觀測時間',
            '觀測人員', 
            '現在溫度 (°C)',
            '濕球溫度 (°C)',
            '降水量 (mm)',
            '蒸發皿水溫 (°C)',
            '現蒸發皿水位高 (mm)',
            '現在天氣代碼',
            '總雲量 (0-8)',
            '高雲雲種代碼 (0-9)',
            '高雲雲量 (0-8)',
            '中雲雲種代碼 (0-9)',
            '中雲雲量 (0-8)',
            '低雲雲種代碼 (0-9)',
            '低雲雲量 (0-8)',
            '洗蒸發皿後水位高 (mm)',
            '洗蒸發皿後水溫 (°C)',
            '加蒸發皿水位後水位高 (mm)',
            '加蒸發皿水位後水溫 (°C)',
            '減蒸發皿水位後水位高 (mm)',
            '減蒸發皿水位後水溫 (°C)',
            '備註'
        ])
        
        # Write data rows
        for observation in observations:
            observer = db.query(User).filter(User.id == observation.observer_id).first()
            observer_name = observer.formal_name or observer.display_name or observer.google_name if observer else None
            
            writer.writerow([
                observation.observation_time.strftime('%Y-%m-%d %H:%M:%S') if observation.observation_time else '',
                observer_name or '',
                observation.temperature if observation.temperature is not None else '',
                observation.wet_bulb_temperature if observation.wet_bulb_temperature is not None else '',
                observation.precipitation if observation.precipitation is not None else '',
                observation.evaporation_pan_temp if observation.evaporation_pan_temp is not None else '',
                observation.current_evaporation_level if observation.current_evaporation_level is not None else '',
                observation.current_weather_code if observation.current_weather_code is not None else '',
                observation.total_cloud_amount if observation.total_cloud_amount is not None else '',
                observation.high_cloud_type_code if observation.high_cloud_type_code is not None else '',
                observation.high_cloud_amount if observation.high_cloud_amount is not None else '',
                observation.middle_cloud_type_code if observation.middle_cloud_type_code is not None else '',
                observation.middle_cloud_amount if observation.middle_cloud_amount is not None else '',
                observation.low_cloud_amount if observation.low_cloud_amount is not None else '',
                observation.cleaned_evaporation_level if observation.cleaned_evaporation_level is not None else '',
                observation.cleaned_evaporation_temp if observation.cleaned_evaporation_temp is not None else '',
                observation.added_evaporation_level if observation.added_evaporation_level is not None else '',
                observation.added_evaporation_temp if observation.added_evaporation_temp is not None else '',
                observation.reduced_evaporation_level if observation.reduced_evaporation_level is not None else '',
                observation.reduced_evaporation_temp if observation.reduced_evaporation_temp is not None else '',
                observation.notes or ''
            ])
        
        output.seek(0)
        
        # Generate filename with date range
        if start_date and end_date:
            filename = f"weather_observations_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.csv"
        elif start_date:
            filename = f"weather_observations_from_{start_date.strftime('%Y%m%d')}.csv"
        elif end_date:
            filename = f"weather_observations_until_{end_date.strftime('%Y%m%d')}.csv"
        else:
            filename = f"weather_observations_{datetime.now().strftime('%Y%m%d')}.csv"
        
        # Create the response with proper headers
        response_content = output.getvalue().encode('utf-8-sig')  # UTF-8 BOM for Excel compatibility
        
        return StreamingResponse(
            io.BytesIO(response_content),
            media_type="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": f"attachment; filename=\"{filename}\"",
                "Content-Length": str(len(response_content))
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CSV export failed: {str(e)}"
        )