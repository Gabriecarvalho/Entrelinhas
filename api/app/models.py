from typing import Literal

from pydantic import BaseModel, Field, field_validator


class BookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    author: str = Field(min_length=1, max_length=120)
    total_pages: int = Field(gt=0, le=100000)
    tags: list[str] = Field(default_factory=list, max_length=20)

    @field_validator("title", "author")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Este campo não pode ficar vazio.")
        return value

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, tags: list[str]) -> list[str]:
        return list(dict.fromkeys(tag.strip().lower() for tag in tags if tag.strip()))


class EntryCreate(BaseModel):
    kind: Literal["progress", "review"]
    pages_read: int = Field(default=0, ge=0, le=100000)
    note: str = Field(default="", max_length=3000)

    @field_validator("note")
    @classmethod
    def strip_note(cls, value: str) -> str:
        return value.strip()


class BookUpdate(BaseModel):
    status: Literal["reading", "completed", "want-to-read"]
