# LOGIXBOX.RO — ECU Repair & AI Diagnostics Lab

**Proiect pentru disciplinele Inginerie Software & Inteligență Artificială**

Sistem integrat pentru gestiunea reparațiilor electronice auto (ECU / TCU / BCM) pe bancul de probă, dezvoltat cu FastAPI, PostgreSQL și React. Proiectul extinde structura clasică de management al sarcinilor într-o platformă de producție pentru un laborator de microelectronică, asistată de modele de limbaj locale (Ollama) pentru interpretarea codurilor DTC, generarea procedurilor de diagnoză și redactarea fișelor de service.

## 📍 Unde sunt regulile din diagrame (Conform Îndrumarului)

Pentru o evaluare ușoară, corespondența dintre cerințele de laborator și codul sursă se regăsește mai jos:

1. **Diagrama de Stări (Întâlnirea 3 - Restricționarea tranzițiilor):**
   - **Locație:** `backend/app/routers/tasks.py`
   - **Implementare:** Regulile sunt definite în dicționarul `ALLOWED_TRANSITIONS`. Un modul ECU nu poate trece direct din `de_facut` (Recepționat) în `finalizat` (Reparat & Testat). Trebuie să treacă obligatoriu prin starea `in_lucru` (În diagnoză pe banc). Funcția `check_transition()` validează modificarea, altfel API-ul returnează codul `400 Bad Request`.

2. **Diagrama de Clase (Întâlnirea 2 - Adăugarea unei entități noi):**
   - **Locație:** `backend/app/models.py` și `backend/app/schemas.py`
   - **Implementare:** A fost adăugată clasa `Comment` pentru a gestiona **Jurnalul de Banc** (măsurători, intervenții PCB, tensiuni măsurate). Aceasta are o relație `1-la-n` cu clasa `Task` (Fișa ECU), cu ștergere în cascadă. Migrarea bazei de date a fost generată și aplicată via Alembic.

## 🛠️ Arhitectură și Tehnologii

- **Frontend:** React + Vite, axat pe o temă vizuală _Dark Industrial_ cu funcție integrată de tipărire rapoarte PDF (Fișe A4 pentru client).
- **Backend:** FastAPI (Python), arhitectură REST, SQLAlchemy (ORM), Alembic (Migrări).
- **Bază de date:** PostgreSQL (stocare permanentă prin volume Docker).
- **Inteligență Artificială:** Conectare la instanțe locale **Ollama** (ex: _qwen2.5:1.5b_) pentru confidențialitatea datelor din reparații. Interogările folosesc System Prompts cu rol specific de "Inginer Electronist Senior".

## 🚀 Pornire Rapidă (Docker)

Aplicația rulează complet în containere.

1. **Construirea și pornirea mediului:**
   ```bash
   docker compose up -d --build
   ```
