from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Comment, Project, Task
from app.schemas import CommentCreate, CommentRead, TaskCreate, TaskRead, TaskStatus, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["Sarcini"])

# Tranzitiile permise intre starile unui modul ECU (Diagrama de Stari - Intalnirea 3)
# de_facut (Receptionat) -> in_lucru (In diagnoza pe banc) <-> finalizat (Reparat & Testat)
ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "de_facut": {"in_lucru"},
    "in_lucru": {"de_facut", "finalizat"},
    "finalizat": {"in_lucru"},
}


def check_transition(current: str, new: str) -> None:
    if new != current and new not in ALLOWED_TRANSITIONS.get(current, set()):
        raise HTTPException(
            status_code=400,
            detail=f"Tranzitie nepermisa: din '{current}' nu se poate trece direct in '{new}'. Modulul trebuie sa treaca intai prin starea 'in_lucru' (In diagnoza pe banc).",
        )


# Functie ajutatoare: gaseste sarcina sau raspunde cu 404
def get_task_or_404(task_id: int, db: Session) -> Task:
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Sarcina {task_id} nu exista.")
    return task


def check_project_exists(project_id: int, db: Session) -> None:
    if db.get(Project, project_id) is None:
        raise HTTPException(status_code=404, detail=f"Proiectul {project_id} nu exista.")


# GET /api/tasks?project_id=1&status=de_facut - lista sarcinilor (filtrele sunt optionale)
@router.get("", response_model=list[TaskRead])
def list_tasks(project_id: int | None = None, status: TaskStatus | None = None, db: Session = Depends(get_db)):
    query = select(Task).order_by(Task.id)
    if project_id is not None:
        query = query.where(Task.project_id == project_id)
    if status is not None:
        query = query.where(Task.status == status)
    return db.scalars(query).all()


# GET /api/tasks/{id} - o sarcina
@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, db: Session = Depends(get_db)):
    return get_task_or_404(task_id, db)


# POST /api/tasks - creeaza o sarcina (404 daca proiectul nu exista)
@router.post("", response_model=TaskRead, status_code=201)
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    check_project_exists(data.project_id, db)
    task = Task(**data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


# PATCH /api/tasks/{id} - modifica doar campurile trimise (ex. {"status": "finalizat"})
@router.patch("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db)):
    task = get_task_or_404(task_id, db)
    changes = data.model_dump(exclude_unset=True, exclude_none=True)
    if "project_id" in changes:
        check_project_exists(changes["project_id"], db)
    if "status" in changes:
        check_transition(task.status, changes["status"])

    for field, value in changes.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


# DELETE /api/tasks/{id} - sterge sarcina (raspuns 204, fara continut)
@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = get_task_or_404(task_id, db)
    db.delete(task)
    db.commit()
    return Response(status_code=204)


# GET /api/tasks/{id}/comments - Jurnalul de masuratori pe banc pentru un ECU
@router.get("/{task_id}/comments", response_model=list[CommentRead])
def list_comments(task_id: int, db: Session = Depends(get_db)):
    get_task_or_404(task_id, db)
    query = select(Comment).where(Comment.task_id == task_id).order_by(Comment.id)
    return db.scalars(query).all()


# POST /api/tasks/{id}/comments - Adauga o nota noua in jurnalul de banc al ECU-ului
@router.post("/{task_id}/comments", response_model=CommentRead, status_code=201)
def create_comment(task_id: int, data: CommentCreate, db: Session = Depends(get_db)):
    get_task_or_404(task_id, db)
    comment = Comment(task_id=task_id, text=data.text)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment