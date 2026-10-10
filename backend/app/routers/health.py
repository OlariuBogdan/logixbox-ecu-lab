from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter(tags=["Stare"])


# GET /api/health - verifica daca API-ul si baza de date raspund
@router.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Baza de date nu raspunde.")

    return {"status": "ok", "message": "Salut din FastAPI!", "database": "conectata"}
