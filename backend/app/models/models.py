from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from ..core.database import Base
import enum
from datetime import datetime

class PetType(str, enum.Enum):
    CAT = "cat"
    DOG = "dog"
    DRAGON = "dragon"
    SLIME = "slime"

class PetStage(str, enum.Enum):
    BABY = "baby"
    TEEN = "teen"
    ADULT = "adult"
    ELDER = "elder"

class ItemType(str, enum.Enum):
    FOOD = "food"
    TOY = "toy"
    DECOR = "decor"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    coins = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    pet = relationship("Pet", back_populates="owner", uselist=False)
    inventory = relationship("Inventory", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")
    following = relationship("Follow", foreign_keys="Follow.follower_id", back_populates="follower")
    followers = relationship("Follow", foreign_keys="Follow.following_id", back_populates="following")

class Pet(Base):
    __tablename__ = "pets"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String)
    pet_type = Column(Enum(PetType))
    stage = Column(Enum(PetStage), default=PetStage.BABY)
    level = Column(Integer, default=1)
    exp = Column(Integer, default=0)
    hunger = Column(Float, default=100.0)  # 0-100
    happiness = Column(Float, default=100.0)
    energy = Column(Float, default=100.0)
    last_fed = Column(DateTime, default=datetime.utcnow)
    last_played = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="pet")

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    item_type = Column(Enum(ItemType))
    price = Column(Integer)
    hunger_restore = Column(Integer, default=0)
    happiness_restore = Column(Integer, default=0)
    energy_restore = Column(Integer, default=0)
    emoji = Column(String, default="")

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_id = Column(Integer, ForeignKey("items.id"))
    quantity = Column(Integer, default=1)
    
    user = relationship("User", back_populates="inventory")
    item = relationship("Item")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    task_type = Column(String)  # feed, play, visit
    completed = Column(Boolean, default=False)
    date = Column(DateTime, default=datetime.utcnow)
    reward_coins = Column(Integer, default=10)

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    description = Column(String)
    icon = Column(String)
    requirement = Column(String)  # JSON: {"type": "level", "value": 10}

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    earned_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement")

class Follow(Base):
    __tablename__ = "follows"
    id = Column(Integer, primary_key=True)
    follower_id = Column(Integer, ForeignKey("users.id"))
    following_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    follower = relationship("User", foreign_keys=[follower_id], back_populates="following")
    following = relationship("User", foreign_keys=[following_id], back_populates="followers")
