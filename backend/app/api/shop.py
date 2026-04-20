from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..api.auth import get_current_user
from ..models.models import User, Item, Inventory, ItemType

router = APIRouter(prefix="/shop", tags=["shop"])

@router.get("/items")
async def get_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item))
    items = result.scalars().all()
    return [
        {
            "id": i.id,
            "name": i.name,
            "type": i.item_type,
            "price": i.price,
            "hunger": i.hunger_restore,
            "happiness": i.happiness_restore,
            "energy": i.energy_restore,
            "emoji": i.emoji
        }
        for i in items
    ]

@router.post("/buy/{item_id}")
async def buy_item(
    item_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    item = await db.get(Item, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    
    if user.coins < item.price:
        raise HTTPException(400, f"Not enough coins. Need {item.price}, have {user.coins}")
    
    # Check existing inventory
    result = await db.execute(
        select(Inventory).where(
            Inventory.user_id == user.id,
            Inventory.item_id == item_id
        )
    )
    inv = result.scalar_one_or_none()
    
    if inv:
        inv.quantity += 1
    else:
        inv = Inventory(user_id=user.id, item_id=item_id)
        db.add(inv)
    
    user.coins -= item.price
    await db.commit()
    
    return {
        "message": f"Bought {item.name}!",
        "remaining_coins": user.coins
    }

@router.get("/inventory")
async def get_inventory(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Inventory, Item)
        .join(Item)
        .where(Inventory.user_id == user.id, Inventory.quantity > 0)
    )
    rows = result.all()
    return [
        {
            "id": inv.id,
            "item_id": i.id,
            "name": i.name,
            "type": i.item_type,
            "quantity": inv.quantity,
            "emoji": i.emoji
        }
        for inv, i in rows
    ]
