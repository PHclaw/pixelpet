from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..core.database import get_db
from ..api.auth import get_current_user
from ..models.models import User, Pet, Follow, UserAchievement, Achievement

router = APIRouter(prefix="/social", tags=["social"])

@router.get("/leaderboard")
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User, Pet)
        .join(Pet, User.id == Pet.user_id)
        .order_by(Pet.level.desc(), Pet.exp.desc())
        .limit(20)
    )
    rows = result.all()
    return [
        {
            "rank": i + 1,
            "username": u.username,
            "pet_name": p.name,
            "pet_type": p.pet_type,
            "level": p.level,
            "stage": p.stage
        }
        for i, (u, p) in enumerate(rows)
    ]

@router.post("/follow/{user_id}")
async def follow_user(
    user_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if user_id == user.id:
        raise HTTPException(400, "Cannot follow yourself")
    
    result = await db.execute(
        select(Follow).where(
            Follow.follower_id == user.id,
            Follow.following_id == user_id
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(400, "Already following")
    
    follow = Follow(follower_id=user.id, following_id=user_id)
    db.add(follow)
    await db.commit()
    return {"message": "Followed"}

@router.delete("/follow/{user_id}")
async def unfollow_user(
    user_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Follow).where(
            Follow.follower_id == user.id,
            Follow.following_id == user_id
        )
    )
    follow = result.scalar_one_or_none()
    if not follow:
        raise HTTPException(404, "Not following")
    
    await db.delete(follow)
    await db.commit()
    return {"message": "Unfollowed"}

@router.get("/following")
async def get_following(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User, Pet)
        .join(Follow, User.id == Follow.following_id)
        .join(Pet, User.id == Pet.user_id)
        .where(Follow.follower_id == user.id)
    )
    rows = result.all()
    return [
        {
            "username": u.username,
            "pet_name": p.name,
            "pet_type": p.pet_type,
            "level": p.level
        }
        for u, p in rows
    ]

@router.get("/achievements")
async def get_achievements(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(UserAchievement, Achievement)
        .join(Achievement)
        .where(UserAchievement.user_id == user.id)
    )
    rows = result.all()
    return [
        {
            "name": a.name,
            "description": a.description,
            "icon": a.icon,
            "earned_at": ua.earned_at
        }
        for ua, a in rows
    ]
