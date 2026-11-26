import re
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query, Response, status
from pymongo import ReturnDocument
from pymongo.errors import PyMongoError

from app.database import books_collection, get_book_id, handle_database_error
from app.models import BookCreate, BookUpdate, EntryCreate

router = APIRouter(prefix="/api/books", tags=["books"])


def serialize_book(book: dict) -> dict:
    book["id"] = str(book.pop("_id"))
    return book


@router.get("")
def list_books(
    q: str = Query(default="", max_length=120),
    status_filter: str | None = Query(default=None, alias="status"),
) -> list[dict]:
    if status_filter and status_filter not in {"reading", "completed", "want-to-read"}:
        raise HTTPException(status_code=400, detail="Filtro de status inválido.")
    filters: dict = {}
    if status_filter:
        filters["status"] = status_filter
    if q.strip():
        pattern = re.escape(q.strip())
        filters["$or"] = [
            {"title": {"$regex": pattern, "$options": "i"}},
            {"author": {"$regex": pattern, "$options": "i"}},
            {"tags": {"$regex": pattern, "$options": "i"}},
            {"entries.note": {"$regex": pattern, "$options": "i"}},
        ]
    try:
        books = books_collection.find(filters).sort("updated_at", -1)
        return [serialize_book(book) for book in books]
    except PyMongoError:
        handle_database_error()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_book(book_data: BookCreate) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    book = {
        **book_data.model_dump(),
        "current_page": 0,
        "status": "want-to-read",
        "entries": [],
        "created_at": now,
        "updated_at": now,
    }
    try:
        result = books_collection.insert_one(book)
        book["_id"] = result.inserted_id
        return serialize_book(book)
    except PyMongoError:
        handle_database_error()


@router.get("/{book_id}")
def get_book(book_id: str) -> dict:
    try:
        book = books_collection.find_one({"_id": get_book_id(book_id)})
    except PyMongoError:
        handle_database_error()
    if not book:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    return serialize_book(book)


@router.patch("/{book_id}")
def update_book(book_id: str, changes: BookUpdate) -> dict:
    updates = {
        "status": changes.status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        if changes.status == "completed":
            existing = books_collection.find_one({"_id": get_book_id(book_id)}, {"total_pages": 1})
            if not existing:
                raise HTTPException(status_code=404, detail="Livro não encontrado.")
            updates["current_page"] = existing["total_pages"]
        book = books_collection.find_one_and_update(
            {"_id": get_book_id(book_id)},
            {"$set": updates},
            return_document=ReturnDocument.AFTER,
        )
    except HTTPException:
        raise
    except PyMongoError:
        handle_database_error()
    if not book:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    return serialize_book(book)


@router.post("/{book_id}/entries", status_code=status.HTTP_201_CREATED)
def add_entry(book_id: str, entry_data: EntryCreate) -> dict:
    object_id = get_book_id(book_id)
    try:
        book = books_collection.find_one({"_id": object_id})
        if not book:
            raise HTTPException(status_code=404, detail="Livro não encontrado.")
        pages_read = entry_data.pages_read
        if entry_data.kind == "review" and not entry_data.note:
            raise HTTPException(status_code=422, detail="Escreva uma nota para registrar a resenha.")
        if entry_data.kind == "progress":
            pages_read = min(pages_read, max(book["total_pages"] - book["current_page"], 0))
        entry = {
            "id": str(uuid4()),
            "kind": entry_data.kind,
            "pages_read": pages_read,
            "note": entry_data.note,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        updates: dict = {
            "$push": {"entries": entry},
            "$set": {"updated_at": entry["created_at"]},
        }
        if pages_read:
            new_page = book["current_page"] + pages_read
            updates["$set"]["current_page"] = new_page
            if new_page >= book["total_pages"]:
                updates["$set"]["status"] = "completed"
            elif book["status"] == "want-to-read":
                updates["$set"]["status"] = "reading"
        updated = books_collection.find_one_and_update(
            {"_id": object_id}, updates, return_document=ReturnDocument.AFTER
        )
        return serialize_book(updated)
    except HTTPException:
        raise
    except PyMongoError:
        handle_database_error()


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: str) -> Response:
    try:
        result = books_collection.delete_one({"_id": get_book_id(book_id)})
    except PyMongoError:
        handle_database_error()
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Livro não encontrado.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
