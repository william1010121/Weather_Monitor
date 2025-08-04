from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ObservationBase(BaseModel):
    observation_time: datetime
    temperature: Optional[float] = Field(None, description="現在溫度 (°C)")
    wet_bulb_temperature: Optional[float] = Field(None, description="濕球溫度 (°C)")
    precipitation: Optional[float] = Field(None, ge=0, description="降水量 (mm)")
    evaporation_pan_temp: Optional[float] = Field(None, description="蒸發皿水溫 (°C)")
    current_evaporation_level: Optional[float] = Field(None, ge=0, description="現蒸發皿水位高 (mm)")
    current_weather_code: Optional[str] = Field(None, description="現在天氣代碼")
    total_cloud_amount: Optional[int] = Field(None, ge=0, le=8, description="總雲量 (0-8)")
    
    # High clouds
    high_cloud_type_code: Optional[int] = Field(None, ge=0, le=9, description="高雲雲種代碼 (0-9)")
    high_cloud_amount: Optional[int] = Field(None, ge=0, le=8, description="高雲雲量 (0-8)")
    
    # Middle clouds
    middle_cloud_type_code: Optional[int] = Field(None, ge=0, le=9, description="中雲雲種代碼 (0-9)")
    middle_cloud_amount: Optional[int] = Field(None, ge=0, le=8, description="中雲雲量 (0-8)")
    
    # Low clouds
    low_cloud_type_code: Optional[int] = Field(None, ge=0, le=9, description="低雲雲種代碼 (0-9)")
    low_cloud_amount: Optional[int] = Field(None, ge=0, le=8, description="低雲雲量 (0-8)")
    
    # Conditional data sections
    has_cleaned_evaporation_pan: bool = False
    cleaned_evaporation_level: Optional[float] = Field(None, ge=0, description="洗後蒸發皿水位高 (mm)")
    cleaned_evaporation_temp: Optional[float] = Field(None, description="洗後蒸發皿水溫 (°C)")
    
    has_added_evaporation_water: bool = False
    added_evaporation_level: Optional[float] = Field(None, ge=0, description="加水後蒸發皿水位高 (mm)")
    added_evaporation_temp: Optional[float] = Field(None, description="加水後蒸發皿水溫 (°C)")
    
    has_reduced_evaporation_water: bool = False
    reduced_evaporation_level: Optional[float] = Field(None, ge=0, description="減水後蒸發皿水位高 (mm)")
    reduced_evaporation_temp: Optional[float] = Field(None, description="減水後蒸發皿水溫 (°C)")
    
    notes: Optional[str] = Field(None, description="備註")

class ObservationCreate(ObservationBase):
    pass

class ObservationUpdate(BaseModel):
    observation_time: Optional[datetime] = None
    temperature: Optional[float] = None
    wet_bulb_temperature: Optional[float] = None
    precipitation: Optional[float] = Field(None, ge=0)
    evaporation_pan_temp: Optional[float] = None
    current_evaporation_level: Optional[float] = Field(None, ge=0)
    current_weather_code: Optional[str] = None
    total_cloud_amount: Optional[int] = Field(None, ge=0, le=8)
    
    # High clouds
    high_cloud_type_code: Optional[int] = Field(None, ge=0, le=9)
    high_cloud_amount: Optional[int] = Field(None, ge=0, le=8)
    
    # Middle clouds
    middle_cloud_type_code: Optional[int] = Field(None, ge=0, le=9)
    middle_cloud_amount: Optional[int] = Field(None, ge=0, le=8)
    
    # Low clouds
    low_cloud_type_code: Optional[int] = Field(None, ge=0, le=9)
    low_cloud_amount: Optional[int] = Field(None, ge=0, le=8)
    
    # Conditional data sections
    has_cleaned_evaporation_pan: Optional[bool] = None
    cleaned_evaporation_level: Optional[float] = Field(None, ge=0)
    cleaned_evaporation_temp: Optional[float] = None
    
    has_added_evaporation_water: Optional[bool] = None
    added_evaporation_level: Optional[float] = Field(None, ge=0)
    added_evaporation_temp: Optional[float] = None
    
    has_reduced_evaporation_water: Optional[bool] = None
    reduced_evaporation_level: Optional[float] = Field(None, ge=0)
    reduced_evaporation_temp: Optional[float] = None
    
    notes: Optional[str] = None

class ObservationResponse(ObservationBase):
    id: int
    observer_id: int
    observer_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ObservationSummary(BaseModel):
    id: int
    observation_time: datetime
    temperature: Optional[float] = None
    wet_bulb_temperature: Optional[float] = None
    precipitation: Optional[float] = None
    observer_id: int
    
    class Config:
        from_attributes = True

class DashboardData(BaseModel):
    observation_time: datetime
    temperature: Optional[float] = None
    wet_bulb_temperature: Optional[float] = None
    precipitation_24h: Optional[float] = None  # Calculated 24-hour precipitation
    current_evaporation_level: Optional[float] = None
    evaporation_pan_temp: Optional[float] = None
    observer_name: Optional[str] = None
    
    class Config:
        from_attributes = True