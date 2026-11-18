"""End-to-end integration test for NutriFit API."""
from __future__ import annotations
import urllib.request
import json
import urllib.error
import datetime
import time
import sys

BASE = "http://localhost:8000"


def req(method, path, data=None, token=None):
    url = BASE + path
    body = json.dumps(data).encode() if data else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def run():
    errors = []

    # 1. Health check
    s, d = req("GET", "/health")
    assert s == 200, f"Health failed: {s} {d}"
    assert d.get("status") == "healthy"
    print(f"1. Health: {s} -> db={d.get('db')}, llm={d.get('llm_provider')}")

    # 2. Register new user
    email = f"inttest_{int(time.time())}@nutrifit.test"
    s, d = req("POST", "/api/auth/register", {
        "name": "Integration Tester",
        "email": email,
        "password": "Test1234!"
    })
    assert s == 201, f"Register failed: {s} {d}"
    token = d.get("access_token")
    assert token, "No token returned"
    print(f"2. Register: {s} -> token_ok={bool(token)}, user={d.get('user', {}).get('name')}")

    # 3. /me endpoint
    s, d = req("GET", "/api/auth/me", token=token)
    assert s == 200, f"/me failed: {s}"
    assert d.get("name") == "Integration Tester"
    print(f"3. /me: {s} -> name={d.get('name')}, calorie_goal={d.get('calorie_goal')}")

    # 4. Parse meal text
    s, d = req("POST", "/api/meals/parse", {
        "text": "2 idli, 1 bowl sambar, 1 cup coffee",
        "meal_type": "breakfast"
    }, token)
    assert s == 200, f"Parse failed: {s} {d}"
    items = d.get("items", [])
    assert len(items) >= 1, "No items parsed"
    names = [i["name"] for i in items]
    print(f"4. Parse: {s} -> {len(items)} items: {names}")

    # 5. Confirm meal
    confirm_items = [
        {
            "food_id": i["food_id"],
            "quantity": i["quantity"],
            "unit": i["unit"],
            "sugar_free": False,
            "oil_free": False
        }
        for i in items if i.get("food_id")
    ]
    today = datetime.date.today().isoformat()
    s, d = req("POST", "/api/meals/confirm", {
        "meal_type": "breakfast",
        "date": today,
        "items": confirm_items
    }, token)
    assert s == 201, f"Confirm failed: {s} {d}"
    meal_id = d.get("meal_id")
    totals = d.get("totals", {})
    print(f"5. Confirm: {s} -> meal_id={meal_id}, kcal={totals.get('kcal')}, protein={totals.get('protein')}g")

    # 6. Meal analysis
    s, d = req("GET", f"/api/analysis/meal/{meal_id}", token=token)
    assert s == 200, f"Meal analysis failed: {s} {d}"
    score = d.get("score", {})
    chips = d.get("chips", [])
    feedback = d.get("feedback", {})
    banner = feedback.get("banner", {})
    print(f"6. Meal analysis: {s} -> score={score.get('score')}, label={score.get('label')}")
    print(f"   chips={chips[:3]}")
    print(f"   banner: {banner.get('message', '')[:80]}")

    # 7. Day analysis
    s, d = req("GET", f"/api/analysis/day?date={today}", token=token)
    assert s == 200, f"Day analysis failed: {s} {d}"
    day_totals = d.get("totals", {})
    day_score = d.get("score", {})
    print(f"7. Day analysis: {s} -> kcal={day_totals.get('kcal')}, score={day_score.get('score')}")

    # 8. Get day meals
    s, d = req("GET", f"/api/meals/day?date={today}", token=token)
    assert s == 200, f"Day meals failed: {s}"
    meals = d.get("meals", [])
    print(f"8. Day meals: {s} -> {len(meals)} meal(s) logged today")

    # 9. Update profile
    s, d = req("PUT", "/api/profile", {
        "calorie_goal": 2200,
        "protein_goal": 60
    }, token)
    assert s == 200, f"Profile update failed: {s} {d}"
    print(f"9. Profile update: {s} -> calorie_goal={d.get('calorie_goal')}")

    # 10. Load sample week
    s, d = req("POST", "/api/profile/load-sample", token=token)
    assert s in (200, 201), f"Sample load failed: {s} {d}"
    print(f"10. Load sample: {s} -> {d.get('message', d)}")

    # 11. Weekly report
    # get Monday of this week
    today_dt = datetime.date.today()
    monday = today_dt - datetime.timedelta(days=today_dt.weekday())
    week_start = (monday - datetime.timedelta(days=7)).isoformat()
    s, d = req("GET", f"/api/analysis/week?start_date={week_start}", token=token)
    assert s == 200, f"Weekly report failed: {s} {d}"
    badges = d.get("badges", [])
    print(f"11. Weekly report: {s} -> days_logged={d.get('days_logged')}, badges={badges[:2]}")

    print("\n" + "="*60)
    print("ALL INTEGRATION TESTS PASSED")
    print("="*60)
    return True


if __name__ == "__main__":
    try:
        run()
    except AssertionError as e:
        print(f"\nFAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
