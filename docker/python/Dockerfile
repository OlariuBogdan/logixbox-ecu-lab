# Imaginea pentru containerul is-ia-python (backend-ul FastAPI): Python 3.12
# Se construieste din folderul backend (build.context in compose.yaml).
FROM python:3.12-slim

# Fara fisiere .pyc in folderul proiectului; mesajele din print() apar imediat in loguri
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instalam pachetele din requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Codul (in compose este inlocuit de folderul backend, montat ca volum)
COPY . .

EXPOSE 8000

# La fiecare pornire: aplica migrarile, apoi porneste API-ul (se reincarca la fiecare salvare)
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
