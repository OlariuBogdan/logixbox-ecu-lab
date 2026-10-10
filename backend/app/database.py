from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

# Conexiunea la baza de date (pool_pre_ping verifica conexiunea inainte de folosire)
engine = create_engine(settings.database_url, pool_pre_ping=True)

# Fabrica de sesiuni: o sesiune = o "conversatie" cu baza de date
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


# Clasa de baza pentru toate modelele (entitatile) din models.py
class Base(DeclarativeBase):
    pass


# Dependinta FastAPI: fiecare cerere primeste o sesiune, inchisa automat la final
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
