from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from ..models.models import PetType, PetStage

class PetCreate(BaseModel):
    name: str
    pet_type: PetType

class PetUpdate(BaseModel):
    name: Optional[str] = None

class PetOut(BaseModel):
    id: int
    name: str
    pet_type: PetType
    stage: PetStage
    level: int
    exp: int
    hunger: float
    happiness: float
    energy: float
    last_fed: datetime
    last_played: datetime
    
    class Config:
        from_attributes = True

class FeedRequest(BaseModel):
    item_id: int

class PlayRequest(BaseModel):
    duration: int = 10  # minutes
