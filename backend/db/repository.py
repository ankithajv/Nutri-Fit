from __future__ import annotations

from datetime import date
from sqlalchemy.orm import Session, joinedload
from db.models import User, FoodItem, Meal, MealEntry, MealType, LLMCache, LLMUsage

# User Repository
def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.strip().lower()).first()

def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, name: str, email: str, password_hash: str, calorie_goal: int = 2000, protein_goal: int = 50) -> User:
    user = User(
        name=name.strip(),
        email=email.strip().lower(),
        password_hash=password_hash,
        calorie_goal=calorie_goal,
        protein_goal=protein_goal
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user_profile(db: Session, user_id: int, name: str | None = None, calorie_goal: int | None = None, protein_goal: int | None = None) -> User | None:
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    if name is not None:
        user.name = name.strip()
    if calorie_goal is not None:
        user.calorie_goal = calorie_goal
    if protein_goal is not None:
        user.protein_goal = protein_goal
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int) -> bool:
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True

# Food Items Repository
def get_food_by_id(db: Session, food_id: int) -> FoodItem | None:
    return db.query(FoodItem).filter(FoodItem.id == food_id).first()

def get_food_by_name(db: Session, name: str) -> FoodItem | None:
    return db.query(FoodItem).filter(FoodItem.name == name.strip().lower()).first()

def get_all_foods(db: Session) -> list[FoodItem]:
    return db.query(FoodItem).all()

# Meals Repository
def create_meal(db: Session, user_id: int, meal_date: date, meal_type: MealType | str) -> Meal:
    if isinstance(meal_type, str):
        meal_type = MealType(meal_type)
    meal = Meal(
        user_id=user_id,
        date=meal_date,
        meal_type=meal_type
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal

def get_meal_by_id(db: Session, meal_id: int, user_id: int | None = None) -> Meal | None:
    query = db.query(Meal).options(joinedload(Meal.entries).joinedload(MealEntry.food_item)).filter(Meal.id == meal_id)
    if user_id is not None:
        query = query.filter(Meal.user_id == user_id)
    return query.first()

def get_meals_by_date(db: Session, user_id: int, meal_date: date) -> list[Meal]:
    return db.query(Meal).options(
        joinedload(Meal.entries).joinedload(MealEntry.food_item)
    ).filter(
        Meal.user_id == user_id,
        Meal.date == meal_date
    ).all()

def get_meals_by_range(db: Session, user_id: int, start_date: date, end_date: date) -> list[Meal]:
    return db.query(Meal).options(
        joinedload(Meal.entries).joinedload(MealEntry.food_item)
    ).filter(
        Meal.user_id == user_id,
        Meal.date >= start_date,
        Meal.date <= end_date
    ).order_by(Meal.date.asc(), Meal.id.asc()).all()

def add_meal_entry(
    db: Session,
    meal_id: int,
    food_id: int,
    quantity: float,
    unit: str,
    grams: float | None,
    grams_basis: str | None,
    kcal: float | None,
    protein: float | None,
    carbs: float | None,
    fat: float | None,
    fibre: float | None,
    sugar: float | None,
    sodium: float | None
) -> MealEntry:
    entry = MealEntry(
        meal_id=meal_id,
        food_id=food_id,
        quantity=quantity,
        unit=unit,
        grams=grams,
        grams_basis=grams_basis,
        kcal=kcal,
        protein=protein,
        carbs=carbs,
        fat=fat,
        fibre=fibre,
        sugar=sugar,
        sodium=sodium
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def delete_meal_entries(db: Session, meal_id: int) -> int:
    deleted = db.query(MealEntry).filter(MealEntry.meal_id == meal_id).delete()
    db.commit()
    return deleted

def delete_meal(db: Session, meal_id: int, user_id: int) -> bool:
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == user_id).first()
    if not meal:
        return False
    db.delete(meal)
    db.commit()
    return True

# LLM Cache & Usage Repository
def get_cached_llm(db: Session, text_hash: str) -> dict | None:
    cached = db.query(LLMCache).filter(LLMCache.hash == text_hash).first()
    return cached.response_json if cached else None

def set_cached_llm(db: Session, text_hash: str, response_json: dict) -> LLMCache:
    cached = LLMCache(hash=text_hash, response_json=response_json)
    db.merge(cached)
    db.commit()
    return cached

def get_user_daily_llm_calls(db: Session, user_id: int, usage_date: date) -> int:
    rec = db.query(LLMUsage).filter(LLMUsage.user_id == user_id, LLMUsage.date == usage_date).first()
    return rec.calls if rec else 0

def increment_user_llm_calls(db: Session, user_id: int, usage_date: date) -> int:
    rec = db.query(LLMUsage).filter(LLMUsage.user_id == user_id, LLMUsage.date == usage_date).first()
    if not rec:
        rec = LLMUsage(user_id=user_id, date=usage_date, calls=1)
        db.add(rec)
    else:
        rec.calls += 1
    db.commit()
    return rec.calls
