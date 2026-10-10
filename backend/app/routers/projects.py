from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, Task
from app.schemas import ProjectCreate, ProjectRead

router = APIRouter(prefix="/projects", tags=["Proiecte"])


# GET /api/projects - lista proiectelor, fiecare cu numarul de sarcini
@router.get("", response_model=list[ProjectRead])
def list_projects(db: Session = Depends(get_db)):
    query = (
        select(Project, func.count(Task.id))
        .outerjoin(Task)
        .group_by(Project.id)
        .order_by(Project.id)
    )
    result = []
    for project, task_count in db.execute(query):
        item = ProjectRead.model_validate(project)
        item.task_count = task_count
        result.append(item)
    return result


# POST /api/projects - creeaza un proiect (409 daca numele exista deja)
@router.post("", response_model=ProjectRead, status_code=201)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    existing = db.scalar(select(Project).where(Project.name == data.name))
    if existing:
        raise HTTPException(status_code=409, detail=f"Exista deja un proiect cu numele '{data.name}'.")

    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project
