from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.database import Base, get_db
from core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from main import app

# Setup isolated test database
TEST_DATABASE_URL = "sqlite:///./test_auth.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

def setup_module(module):
    Base.metadata.create_all(bind=test_engine)

def teardown_module(module):
    Base.metadata.drop_all(bind=test_engine)
    import os
    if os.path.exists("./test_auth.db"):
        try:
            os.remove("./test_auth.db")
        except Exception:
            pass

def test_password_hashing():
    pw = "SecretPass123"
    hashed = get_password_hash(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPass", hashed) is False

def test_jwt_token():
    payload = {"sub": "42", "email": "test@example.com"}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "42"
    assert decoded["email"] == "test@example.com"

def test_api_auth_workflow():
    client = TestClient(app)

    # 1. Register
    reg_payload = {
        "name": "Arjun Sharma",
        "email": "arjun@example.com",
        "password": "Password123"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    assert res_reg.status_code == 201
    data_reg = res_reg.json()
    assert "access_token" in data_reg
    assert data_reg["user"]["email"] == "arjun@example.com"
    token = data_reg["access_token"]

    # 2. Duplicate registration should fail
    res_dup = client.post("/api/auth/register", json=reg_payload)
    assert res_dup.status_code == 400

    # 3. Login
    login_payload = {
        "email": "arjun@example.com",
        "password": "Password123"
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

    # 4. Auth Me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["name"] == "Arjun Sharma"
