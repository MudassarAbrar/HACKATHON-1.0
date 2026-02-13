"""
Test: FastAPI Semantic Search Server

Run with both servers:
  1. cd fastapi && uvicorn main:app --port 8000
  2. python test_search.py

Tests:
  1. GET /health → 200 + products_indexed: 20
  2. POST /search { query: "summer wedding" } → relevant products
  3. POST /search { query: "leather boots" } → footwear results
  4. POST /search with preferences → personalization boost
  5. POST /search with empty query → 422 validation error
"""

import httpx
import sys
import json

BASE = "http://localhost:8000"

passed = 0
failed = 0


def test(name, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  ✅ {name}")
    else:
        failed += 1
        print(f"  ❌ {name} — {detail}")


print("\n🔍 === PHASE 4: FASTAPI SEMANTIC SEARCH TESTS ===\n")

# ─── Test 1: Health Check ───
print("--- Test 1: GET /health ---")
try:
    r = httpx.get(f"{BASE}/health", timeout=10)
    data = r.json()
    test("Status 200", r.status_code == 200, f"got {r.status_code}")
    test("Products indexed = 20", data.get("products_indexed") == 20, f"got {data.get('products_indexed')}")
    test("Model name", "MiniLM" in data.get("model", ""), f"got {data.get('model')}")
except httpx.ConnectError:
    print("  ❌ FAILED: Could not connect to FastAPI server. Is it running on port 8000?")
    sys.exit(1)
except Exception as e:
    print(f"  ❌ FAILED: {e}")
    sys.exit(1)

# ─── Test 2: Summer Wedding Search ───
print("\n--- Test 2: POST /search — 'summer wedding' ---")
try:
    r = httpx.post(f"{BASE}/search", json={"query": "summer wedding", "top_k": 5}, timeout=30)
    data = r.json()
    test("Status 200", r.status_code == 200, f"got {r.status_code}")
    test("Returns products", len(data.get("products", [])) > 0, "empty results")
    test("Has search_time_ms", "search_time_ms" in data, "missing field")

    # Check that summer/wedding relevant items appear
    names = [p["name"] for p in data["products"]]
    has_dress = any("dress" in n.lower() or "blouse" in n.lower() or "blazer" in n.lower() for n in names)
    test("Relevant results (dress/blouse/blazer)", has_dress, f"got: {names[:3]}")

    # Check similarity scores exist
    scores = [p["similarity_score"] for p in data["products"]]
    test("Similarity scores present", all(s > 0 for s in scores), f"scores: {scores}")
except Exception as e:
    print(f"  ❌ CRASHED: {e}")

# ─── Test 3: Leather Boots Search ───
print("\n--- Test 3: POST /search — 'leather boots' ---")
try:
    r = httpx.post(f"{BASE}/search", json={"query": "leather boots for hiking", "top_k": 5}, timeout=30)
    data = r.json()
    test("Status 200", r.status_code == 200)

    names = [p["name"] for p in data["products"]]
    has_boots = any("boot" in n.lower() for n in names)
    test("Contains boots", has_boots, f"got: {names[:3]}")

    has_leather = any("leather" in n.lower() for n in names)
    test("Contains leather items", has_leather, f"got: {names[:3]}")
except Exception as e:
    print(f"  ❌ CRASHED: {e}")

# ─── Test 4: Personalization Boost ───
print("\n--- Test 4: POST /search — with user preferences ---")
try:
    r = httpx.post(f"{BASE}/search", json={
        "query": "casual shoes",
        "user_preferences": {
            "favorite_colors": ["black"],
            "budget": "low"
        },
        "top_k": 5
    }, timeout=30)
    data = r.json()
    test("Status 200", r.status_code == 200)
    test("Returns results", len(data.get("products", [])) > 0)
except Exception as e:
    print(f"  ❌ CRASHED: {e}")

# ─── Test 5: Validation Error ───
print("\n--- Test 5: POST /search — empty query → 422 ---")
try:
    r = httpx.post(f"{BASE}/search", json={"query": "", "top_k": 5}, timeout=10)
    test("Returns 422 for empty query", r.status_code == 422, f"got {r.status_code}")
except Exception as e:
    print(f"  ❌ CRASHED: {e}")

# ─── Summary ───
total = passed + failed
print(f"\n🏁 === RESULTS: {passed}/{total} passed ===\n")
sys.exit(0 if failed == 0 else 1)
