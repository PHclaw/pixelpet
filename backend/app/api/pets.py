from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from ..core.database import get_db
from ..api.auth import get_current_user
from ..models.models import User, Pet, Item, Inventory, PetType, PetStage, PetStage
from ..schemas.pet import PetCreate, PetOut, FeedRequest, PlayRequest
import random

router = APIRouter(prefix="/pets", tags=["pets"])

# Evolution thresholds
EXP_THRESHOLDS = {1: 0, 2: 100, 3: 300, 4: 600, 5: 1000}
STAGE_LEVELS = {PetStage.BABY: 1, PetStage.TEEN: 5, PetStage.ADULT: 15, PetStage.ELDER: 30}

@router.get("/", response_model=PetOut)
async def get_pet(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Pet).where(Pet.user_id == user.id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(404, "No pet found")
    
    # Decay stats over time
    now = datetime.utcnow()
    hours_since_fed = (now - pet.last_fed).total_seconds() / 3600
    hours_since_played = (now - pet.last_played).total_seconds() / 3600
    
    pet.hunger = max(0, pet.hunger - hours_since_fed * 2)
    pet.happiness = max(0, pet.happiness - hours_since_played * 1.5)
    pet.energy = min(100, pet.energy + hours_since_played * 3)  # Energy recovers
    
    await db.commit()
    await db.refresh(pet)
    return pet

@router.post("/adopt", response_model=PetOut)
async def adopt_pet(
    data: PetCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Pet).where(Pet.user_id == user.id))
    if result.scalar_one_or_none():
        raise HTTPException(400, "Already have a pet")
    
    pet = Pet(
        user_id=user.id,
        name=data.name,
        pet_type=data.pet_type
    )
    db.add(pet)
    await db.commit()
    await db.refresh(pet)
    return pet

@router.post("/feed")
async def feed_pet(
    data: FeedRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Pet).where(Pet.user_id == user.id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(404, "No pet found")
    
    # Check inventory
    result = await db.execute(
        select(Inventory).where(
            Inventory.user_id == user.id,
            Inventory.item_id == data.item_id,
            Inventory.quantity > 0
        )
    )
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(400, "Item not in inventory")
    
    item = await db.get(Item, data.item_id)
    
    # Apply effects
    pet.hunger = min(100, pet.hunger + item.hunger_restore)
    pet.happiness = min(100, pet.happiness + item.happiness_restore)
    pet.energy = min(100, pet.energy + item.energy_restore)
    pet.last_fed = datetime.utcnow()
    
    # Gain exp
    pet.exp += 5
    
    # Use item
    inv.quantity -= 1
    if inv.quantity <= 0:
        await db.delete(inv)
    
    # Check level up
    await check_level_up(pet, db)
    
    await db.commit()
    return {"message": f"Pet fed! Hunger: {pet.hunger:.0f}"}

@router.post("/play")
async def play_with_pet(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Pet).where(Pet.user_id == user.id))
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(404, "No pet found")
    
    if pet.energy < 10:
        raise HTTPException(400, "Pet too tired to play!")
    
    if pet.happiness >= 100:
        raise HTTPException(400, "Pet is already super happy!")
    
    # Play effects
    happiness_gain = random.randint(10, 25)
    energy_cost = random.randint(5, 15)
    
    pet.happiness = min(100, pet.happiness + happiness_gain)
    pet.energy = max(0, pet.energy - energy_cost)
    pet.last_played = datetime.utcnow()
    pet.exp += 10
    
    # Reward coins
    user.coins += 5
    
    await check_level_up(pet, db)
    await db.commit()
    
    return {
        "message": f"Played with {pet.name}!",
        "happiness": pet.happiness,
        "energy": pet.energy,
        "coins": 5
    }

async def check_level_up(pet: Pet, db: AsyncSession):
    current_threshold = EXP_THRESHOLDS.get(pet.level + 1, float('inf'))
    
    if pet.exp >= current_threshold:
        pet.level += 1
        user = await db.get(User, pet.user_id)
        user.coins += 20  # Level up bonus
        
        # Check evolution
        if pet.level >= 5 and pet.stage == PetStage.BABY:
            pet.stage = PetStage.TEEN
        elif pet.level >= 15 and pet.stage == PetStage.TEEN:
            pet.stage = PetStage.ADULT
        elif pet.level >= 30 and pet.stage == PetStage.ADULT:
            pet.stage = PetStage.ELDER
