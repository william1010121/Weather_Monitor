from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    
    # Basic observation info
    observation_time = Column(DateTime(timezone=True), nullable=False, index=True)
    observer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Core weather measurements  
    temperature = Column(Float, nullable=True)  # 現在溫度 (°C)
    wet_bulb_temperature = Column(Float, nullable=True)  # 濕球溫度 (°C)
    precipitation = Column(Float, nullable=True)  # 降水量 (mm)
    
    # Evaporation pan data
    evaporation_pan_temp = Column(Float, nullable=True)  # 蒸發皿水溫 (°C)
    current_evaporation_level = Column(Float, nullable=True)  # 現蒸發皿水位高 (mm)
    
    # Weather conditions
    current_weather_code = Column(String, nullable=True)  # 現在天氣代碼
    total_cloud_amount = Column(Integer, nullable=True)  # 總雲量 (0-8)
    
    # High clouds
    high_cloud_type_code = Column(Integer, nullable=True)  # 高雲雲種代碼 (0-9)
    high_cloud_amount = Column(Integer, nullable=True)  # 高雲雲量 (0-8)
    
    # Middle clouds
    middle_cloud_type_code = Column(Integer, nullable=True)  # 中雲雲種代碼 (0-9)
    middle_cloud_amount = Column(Integer, nullable=True)  # 中雲雲量 (0-8)
    
    # Low clouds
    low_cloud_type_code = Column(Integer, nullable=True)  # 低雲雲種代碼 (0-9)
    low_cloud_amount = Column(Integer, nullable=True)  # 低雲雲量 (0-8)
    
    # Conditional data sections (checkboxes to enable these sections)
    has_cleaned_evaporation_pan = Column(Boolean, default=False)  # 洗蒸發皿後資料
    cleaned_evaporation_level = Column(Float, nullable=True)  # 蒸發皿水位高 (mm)
    cleaned_evaporation_temp = Column(Float, nullable=True)  # 蒸發皿水溫 (°C)
    
    has_added_evaporation_water = Column(Boolean, default=False)  # 加蒸發皿水位後資料
    added_evaporation_level = Column(Float, nullable=True)  # 蒸發皿水位高 (mm)
    added_evaporation_temp = Column(Float, nullable=True)  # 蒸發皿水溫 (°C)
    
    has_reduced_evaporation_water = Column(Boolean, default=False)  # 減蒸發皿水位後資料
    reduced_evaporation_level = Column(Float, nullable=True)  # 蒸發皿水位高 (mm)
    reduced_evaporation_temp = Column(Float, nullable=True)  # 蒸發皿水溫 (°C)
    
    # Additional fields
    notes = Column(Text, nullable=True)  # 備註
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    observer = relationship("User", back_populates="observations")

# Add the relationship to User model
from .user_model import User
User.observations = relationship("Observation", back_populates="observer")