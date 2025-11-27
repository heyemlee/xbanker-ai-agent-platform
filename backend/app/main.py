from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .config import settings
from .database import init_db
from .api import kyc, risk, clients, dashboard, agents

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Automation for Private Banks & External Asset Managers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(kyc.router)
app.include_router(risk.router)
app.include_router(clients.router)
app.include_router(dashboard.router)
app.include_router(agents.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized successfully")
    logger.info(f"Application started: {settings.APP_NAME}")
    if not settings.OPENAI_API_KEY:
        logger.warning("No OpenAI API key configured - running in MOCK MODE")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "xBanker AI Agent Suite API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
