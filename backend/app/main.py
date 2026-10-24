import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db, SessionLocal
from app.seed_data import seed_initial_domains
from app.routers import auth, news, classifications, bookmarks, history

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("satyalens")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed initial domains
    logger.info("Initializing database tables...")
    init_db()
    
    db = SessionLocal()
    try:
        seeded = seed_initial_domains(db)
        if seeded > 0:
            logger.info(f"Successfully seeded {seeded} Indian domain classifications.")
        else:
            logger.info("Domain classifications already seeded.")
    finally:
        db.close()
        
    yield
    # Shutdown logic if needed
    logger.info("SatyaLens API shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SatyaLens: Indian News Fact-Checking and Bias Aggregator API",
    lifespan=lifespan
)

# CORS configuration
origins = settings.cors_origin_list
if "*" not in origins and "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for flexible local/cloud deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router)
app.include_router(news.router)
app.include_router(classifications.router)
app.include_router(bookmarks.router)
app.include_router(history.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SatyaLens API",
        "version": settings.VERSION,
        "gemini_enabled": bool(settings.GEMINI_API_KEY)
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to SatyaLens Indian News Fact-Checking & Bias Aggregator API",
        "docs": "/docs",
        "health": "/api/health"
    }
