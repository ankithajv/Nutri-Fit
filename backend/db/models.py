from __future__ import annotations

import enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
    Index,
    JSON,
    func
)
from sqlalchemy.orm import relationship
from db.database import Base

class MealType(str, enum.Enum):
    breakfast = "breakfast"
    brunch = "brunch"
    lunch = "lunch"
    snacks = "snacks"
    dinner = "dinner"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    calorie_goal = Column(Integer, default=2000)
    protein_goal = Column(Integer, default=50)
    created_at = Column(DateTime, server_default=func.now())

    meals = relationship("Meal", back_populates="user", cascade="all, delete-orphan")
    llm_usages = relationship("LLMUsage", back_populates="user", cascade="all, delete-orphan")

class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=True)
    tags = Column(JSON, nullable=True)
    serving_info = Column(JSON, nullable=True)
    kcal_100g = Column(Float, nullable=True)
    protein_100g = Column(Float, nullable=True)
    carbs_100g = Column(Float, nullable=True)
    fat_100g = Column(Float, nullable=True)
    fibre_100g = Column(Float, nullable=True)
    sugar_100g = Column(Float, nullable=True)
    sodium_100g = Column(Float, nullable=True)
    source = Column(String(100), default="curated_estimate")
    confidence = Column(Float, default=0.8)

    entries = relationship("MealEntry", back_populates="food_item")

class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    meal_type = Column(SAEnum(MealType, values_callable=lambda x: [e.value for e in x]), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="meals")
    entries = relationship("MealEntry", back_populates="meal", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_user_date", "user_id", "date"),
    )

class MealEntry(Base):
    __tablename__ = "meal_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    meal_id = Column(Integer, ForeignKey("meals.id", ondelete="CASCADE"), nullable=False)
    food_id = Column(Integer, ForeignKey("food_items.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    grams = Column(Float, nullable=True)
    grams_basis = Column(String(100), nullable=True)
    kcal = Column(Float, nullable=True)
    protein = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    fibre = Column(Float, nullable=True)
    sugar = Column(Float, nullable=True)
    sodium = Column(Float, nullable=True)

    meal = relationship("Meal", back_populates="entries")
    food_item = relationship("FoodItem", back_populates="entries")

class LLMCache(Base):
    __tablename__ = "llm_cache"

    hash = Column(String(64), primary_key=True)
    response_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class LLMUsage(Base):
    __tablename__ = "llm_usage"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    date = Column(Date, primary_key=True)
    calls = Column(Integer, default=0)

    user = relationship("User", back_populates="llm_usages")
