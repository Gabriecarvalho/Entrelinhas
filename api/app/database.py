from bson import ObjectId
from fastapi import HTTPException
from pymongo import MongoClient

from app.core.config import MONGO_DB_NAME, MONGO_URI

mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
books_collection = mongo_client[MONGO_DB_NAME]["books"]


def get_book_id(raw_id: str) -> ObjectId:
    if not ObjectId.is_valid(raw_id):
        raise HTTPException(status_code=400, detail="ID do livro inválido.")
    return ObjectId(raw_id)


def handle_database_error() -> None:
    raise HTTPException(status_code=503, detail="Não foi possível acessar o banco de dados.")
