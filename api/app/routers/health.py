from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError

from app.database import mongo_client

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    try:
        mongo_client.admin.command("ping")
    except PyMongoError:
        raise HTTPException(status_code=503, detail="MongoDB indisponível.")
    return {"status": "ok"}
