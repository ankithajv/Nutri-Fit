from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, ConfigDict
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User
from db.repository import get_user_by_email, create_user
from core.security import verify_password, get_password_hash, create_access_token
from core.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    calorie_goal: int
    protein_goal: int

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    if len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )

    hashed_pw = get_password_hash(req.password)
    user = create_user(db, name=req.name, email=req.email, password_hash=hashed_pw)

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, req.email)
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
