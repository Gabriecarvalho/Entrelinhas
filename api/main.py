"""Compatibility entry point for running ``uvicorn main:app`` from ``api``."""

from app.main import app

__all__ = ["app"]
