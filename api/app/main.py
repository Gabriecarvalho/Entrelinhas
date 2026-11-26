from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS
from app.database import mongo_client
from app.routers import books, health

app = FastAPI(title="Entrelinhas API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router)
app.include_router(books.router)


@app.on_event("shutdown")
def close_mongo_connection() -> None:
    mongo_client.close()
