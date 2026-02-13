"""
The Shopkeeper — FastAPI Semantic Search Server

Endpoints:
  GET  /health  — Health check + index status
  POST /search  — Semantic product search via FAISS

Startup:
  Loads products from products_data.json, generates embeddings
  with all-MiniLM-L6-v2, builds FAISS index.

Rate Limiting:
  30 requests/minute per IP on /search via slowapi.
"""

import json
import time
import logging
from pathlib import Path

import numpy as np
import faiss
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from fastembed import TextEmbedding
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# ─── Logging ───
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

# ─── Rate Limiter ───
limiter = Limiter(key_func=get_remote_address)

# ─── App ───
app = FastAPI(title="The Shopkeeper — Semantic Search", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global State ───
products: list[dict] = []
product_texts: list[str] = []
index: faiss.IndexFlatIP | None = None  # Inner product (cosine sim on normalized vectors)
model: TextEmbedding | None = None


def build_text(p: dict) -> str:
    """Build searchable text from product fields."""
    parts = [
        p.get("name", ""),
        p.get("description", ""),
        p.get("category", ""),
        p.get("subcategory", ""),
        p.get("gender", ""),
        " ".join(p.get("tags", [])),
        " ".join(p.get("occasions", [])),
        " ".join(p.get("seasons", [])),
        " ".join(p.get("materials", [])),
        " ".join(p.get("colors", [])),
    ]
    return " ".join(parts)


def compute_match_reasons(product: dict, query_lower: str) -> list[str]:
    """Find which product attributes match the query terms."""
    reasons = []
    query_words = set(query_lower.split())

    # Check tags
    for tag in product.get("tags", []):
        if tag.lower() in query_words or any(w in tag.lower() for w in query_words):
            reasons.append(tag)

    # Check occasions
    for occ in product.get("occasions", []):
        if occ.lower() in query_words or any(w in occ.lower() for w in query_words):
            reasons.append(occ)

    # Check seasons
    for season in product.get("seasons", []):
        if season.lower() in query_words:
            reasons.append(season)

    # Check category/subcategory
    if product.get("category", "").lower() in query_words:
        reasons.append(product["category"])
    if product.get("subcategory", "").lower() in query_words:
        reasons.append(product["subcategory"])

    return list(set(reasons))[:5]  # Dedupe, cap at 5


# ─── Startup ───
@app.on_event("startup")
async def startup_load_products():
    """Load products, generate embeddings, build FAISS index."""
    global products, product_texts, index, model

    # Load products
    data_path = Path(__file__).parent / "products_data.json"
    with open(data_path, "r") as f:
        products = json.load(f)

    logger.info(f"📦 Loaded {len(products)} products from {data_path.name}")

    # Build searchable texts
    product_texts = [build_text(p) for p in products]

    # Load embedding model (ONNX-based, lightweight)
    logger.info("🔄 Loading fastembed model (all-MiniLM-L6-v2)...")
    model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

    # Generate embeddings
    raw_embeddings = list(model.embed(product_texts))
    embeddings = np.array(raw_embeddings).astype("float32")
    # Normalize for cosine similarity
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1
    embeddings = embeddings / norms

    # Build FAISS index (Inner Product on normalized vectors = cosine similarity)
    dimension = embeddings.shape[1]  # 384 for MiniLM
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)

    logger.info(f"✅ Indexed {len(products)} products (dim={dimension})")


# ─── Request/Response Models ───
class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    user_preferences: dict = Field(default_factory=dict)
    top_k: int = Field(default=5, ge=1, le=20)


class ProductResult(BaseModel):
    id: int
    name: str
    description: str
    price: float
    category: str
    subcategory: str | None = None
    gender: str | None = None
    colors: list[str] = []
    sizes: list[str] = []
    tags: list[str] = []
    occasions: list[str] = []
    seasons: list[str] = []
    rating: float = 0
    reviews: int = 0
    stock: int = 0
    similarity_score: float
    match_reasons: list[str] = []


class SearchResponse(BaseModel):
    products: list[ProductResult]
    query: str
    search_time_ms: int
    total_results: int


# ─── Endpoints ───
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "products_indexed": len(products),
        "model": "all-MiniLM-L6-v2",
        "index_type": "FAISS IndexFlatIP (cosine)",
    }


@app.post("/search", response_model=SearchResponse)
@limiter.limit("30/minute")
async def search_products(request: Request, search_request: SearchRequest):
    """Semantic search over product catalog."""
    if index is None or model is None:
        return JSONResponse(status_code=503, content={"error": "Index not ready"})

    start = time.time()

    # 1. Encode query
    raw_query = list(model.embed([search_request.query]))
    query_embedding = np.array(raw_query).astype("float32")
    # Normalize
    qnorm = np.linalg.norm(query_embedding, axis=1, keepdims=True)
    qnorm[qnorm == 0] = 1
    query_embedding = query_embedding / qnorm

    # 2. FAISS search
    scores, indices = index.search(query_embedding, search_request.top_k)

    # 3. Build results with personalization boost
    results = []
    user_prefs = search_request.user_preferences
    fav_colors = [c.lower() for c in user_prefs.get("favorite_colors", [])]
    budget = user_prefs.get("budget", "")

    for i, idx in enumerate(indices[0]):
        if idx < 0 or idx >= len(products):
            continue

        product = products[idx]
        score = float(scores[0][i])

        # Personalization boosts
        # Color match: boost if product has user's favorite colors
        if fav_colors:
            product_colors = [c.lower() for c in product.get("colors", [])]
            if any(fc in pc for fc in fav_colors for pc in product_colors):
                score += 0.05

        # Budget match
        price = product.get("price", 0)
        if budget == "low" and price < 80:
            score += 0.05
        elif budget == "medium" and 50 <= price <= 200:
            score += 0.03
        elif budget == "high" and price > 150:
            score += 0.02

        # Match reasons
        match_reasons = compute_match_reasons(product, search_request.query.lower())

        results.append(ProductResult(
            id=product["id"],
            name=product["name"],
            description=product["description"],
            price=product["price"],
            category=product["category"],
            subcategory=product.get("subcategory"),
            gender=product.get("gender"),
            colors=product.get("colors", []),
            sizes=product.get("sizes", []),
            tags=product.get("tags", []),
            occasions=product.get("occasions", []),
            seasons=product.get("seasons", []),
            rating=product.get("rating", 0),
            reviews=product.get("reviews", 0),
            stock=product.get("stock", 0),
            similarity_score=round(score, 4),
            match_reasons=match_reasons,
        ))

    # Re-sort by boosted score
    results.sort(key=lambda r: r.similarity_score, reverse=True)

    elapsed_ms = int((time.time() - start) * 1000)

    return SearchResponse(
        products=results,
        query=search_request.query,
        search_time_ms=elapsed_ms,
        total_results=len(results),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
