from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, date
from ..core.database import get_db
from ..api.auth import get_current_user
from ..models.models import User, Task, Pet
from ..schemas.user import UserOut

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/")
async def get_tasks(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()
    result = await db.execute(
        select(Task).where(
            Task.user_id == user.id,
            Task.date >= datetime.combine(today, datetime.min.time())
        )
    )
    tasks = result.scalars().all()
    
    if not tasks:
        # Create daily tasks
        task_types = ["feed", "play", "visit"]
        for t in task_types:
            task = Task(user_id=user.id, task_type=t, reward_coins=10)
            db.add(task)
        await db.commit()
        result = await db.execute(
            select(Task).where(
                Task.user_id == user.id,
                Task.date >= datetime.combine(today, datetime.min.time())
            )
        )
        tasks = result.scalars().all()
    
    return tasks

@router.post("/{task_id}/complete")
async def complete_task(
    task_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    task = await db.get(Task, task_id)
    if not task or task.user_id != user.id:
        return {"error": "Task not found"}
    
    if task.completed:
        return {"error": "Already completed"}
    
    task.completed = True
    user.coins += task.reward_coins
    
    await db.commit()
    return {"message": f"Task completed! +{task.reward_coins} coins"}
