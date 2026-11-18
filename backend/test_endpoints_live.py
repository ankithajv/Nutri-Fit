from __future__ import annotations

import httpx
import json

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("Testing NutriFit Live Endpoints...\n")

    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Root & Health Check
        r = client.get("/")
        print(f"1. GET / -> Status {r.status_code}, Body: {r.json()}")
        assert r.status_code == 200

        r = client.get("/health")
        print(f"2. GET /health -> Status {r.status_code}, Body: {r.json()}")
        assert r.status_code == 200

        # 2. Register User
        email = f"ankitha_test@nutrifit.com"
        reg_payload = {
            "name": "Ankitha",
            "email": email,
            "password": "Password123"
        }
        r = client.post("/api/auth/register", json=reg_payload)
        if r.status_code == 400 and "already exists" in r.text:
            print("User already exists, logging in instead...")
            login_payload = {"email": email, "password": "Password123"}
            r = client.post("/api/auth/login", json=login_payload)
        
        print(f"3. Auth Register/Login -> Status {r.status_code}")
        assert r.status_code in (200, 201)
        token_data = r.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Auth Me
        r = client.get("/api/auth/me", headers=headers)
        print(f"4. GET /api/auth/me -> Status {r.status_code}, User: {r.json()['name']}")
        assert r.status_code == 200

        # 4. Parse Meal Text
        parse_payload = {
            "text": "2 idli, 1 bowl sambar, 1 cup filter coffee",
            "meal_type": "breakfast"
        }
        r = client.post("/api/meals/parse", json=parse_payload, headers=headers)
        print(f"5. POST /api/meals/parse -> Status {r.status_code}")
        parsed_data = r.json()
        print(f"   Items parsed: {json.dumps(parsed_data['items'], indent=2)}")
        assert r.status_code == 200
        assert len(parsed_data["items"]) == 3

        # 5. Confirm Meal
        confirm_items = []
        for it in parsed_data["items"]:
            if it["food_id"]:
                confirm_items.append({
                    "food_id": it["food_id"],
                    "quantity": it["quantity"],
                    "unit": it["unit"],
                    "sugar_free": False,
                    "oil_free": False
                })

        confirm_payload = {
            "meal_type": "breakfast",
            "date": "2026-11-12",
            "items": confirm_items
        }
        r = client.post("/api/meals/confirm", json=confirm_payload, headers=headers)
        print(f"6. POST /api/meals/confirm -> Status {r.status_code}")
        meal_data = r.json()
        meal_id = meal_data["id"]
        print(f"   Meal ID: {meal_id}, Totals: {json.dumps(meal_data['totals'])}")
        assert r.status_code == 201

        # 6. Analyze Meal
        r = client.get(f"/api/analysis/meal/{meal_id}", headers=headers)
        print(f"7. GET /api/analysis/meal/{meal_id} -> Status {r.status_code}")
        analysis_data = r.json()
        print(f"   Score: {analysis_data['score_details']['score']} ({analysis_data['score_details']['label']})")
        print(f"   Feedback: {analysis_data['feedback']['banner']['message']}")
        print(f"   Coach Tip: {analysis_data['coach_tip']}")
        assert r.status_code == 200

        # 7. Day Meals & Analysis
        r = client.get("/api/meals/day?date=2026-11-12", headers=headers)
        print(f"8. GET /api/meals/day -> Status {r.status_code}, Meals logged today: {len(r.json()['meals'])}")
        assert r.status_code == 200

        r = client.get("/api/analysis/day?date=2026-11-12", headers=headers)
        print(f"9. GET /api/analysis/day -> Status {r.status_code}, Day Score: {r.json()['score_details']['score']}")
        assert r.status_code == 200

        # 8. Load Sample Week Data
        r = client.post("/api/profile/load-sample", headers=headers)
        print(f"10. POST /api/profile/load-sample -> Status {r.status_code}, Result: {r.json()['message']}")
        assert r.status_code == 201

        # 9. Weekly Analysis
        r = client.get("/api/analysis/week?start_date=2026-11-06", headers=headers)
        print(f"11. GET /api/analysis/week -> Status {r.status_code}")
        week_data = r.json()
        print(f"    Logged days: {week_data['logged_days']}, Avg Score: {week_data['averages']['score']}")
        print(f"    Badges: {json.dumps(week_data['feedback']['badges'], indent=2)}")
        assert r.status_code == 200

        # 10. Update Profile Goals
        r = client.put("/api/profile", json={"calorie_goal": 2200, "protein_goal": 65}, headers=headers)
        print(f"12. PUT /api/profile -> Status {r.status_code}, Updated Goals: Calorie={r.json()['calorie_goal']}, Protein={r.json()['protein_goal']}")
        assert r.status_code == 200

        print("\nALL 12 LIVE ENDPOINT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
