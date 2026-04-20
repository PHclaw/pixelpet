from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import init_db
from .api import auth, pets, tasks, social, shop
from .models.models import Item, Achievement
import asyncio

app = FastAPI(title="PixelPet", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()
    await seed_items()
    await seed_achievements()

async def seed_items():
    from .core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        items = [
            Item(name="Fish", item_type="food", price=10, hunger_restore=30, emoji="馃悷"),
            Item(name="Meat", item_type="food", price=20, hunger_restore=50, emoji="馃崠"),
            Item(name="Cake", item_type="food", price=30, hunger_restore=20, happiness_restore=30, emoji="馃嵃"),
            Item(name="Ball", item_type="toy", price=15, happiness_restore=40, emoji="鈿?),
            Item(name="Frisbee", item_type="toy", price=25, happiness_restore=50, energy_restore=10, emoji="馃"),
            Item(name="Bed", item_type="decor", price=50, energy_restore=30, emoji="馃洀锔?),
        ]
        for item in items:
            result = await db.execute(select(Item).where(Item.name == item.name))
            if not result.scalar_one_or_none():
                db.add(item)
        await db.commit()

async def seed_achievements():
    from .core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        achievements = [
            Achievement(name="First Steps", description="Adopt your first pet", icon="馃悾", requirement='{"type": "adopt", "value": 1}'),
            Achievement(name="Rising Star", description="Reach level 5", icon="猸?, requirement='{"type": "level", "value": 5}'),
            Achievement(name="Pet Master", description="Reach level 20", icon="馃憫", requirement='{"type": "level", "value": 20}'),
            Achievement(name="Social Butterfly", description="Follow 10 friends", icon="馃", requirement='{"type": "follow", "value": 10}'),
            Achievement(name="Evolution", description="Evolve your pet to Teen", icon="馃", requirement='{"type": "evolution", "value": "teen"}'),
        ]
        for ach in achievements:
            result = await db.execute(select(Achievement).where(Achievement.name == ach.name))
            if not result.scalar_one_or_none():
                db.add(ach)
        await db.commit()

app.include_router(auth.router, prefix="/api")
app.include_router(pets.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(social.router, prefix="/api")
app.include_router(shop.router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}
