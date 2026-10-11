from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# Modelele (entitatile) aplicatiei. Fiecare clasa = un tabel din baza de date.
# Dupa orice modificare aici, creati o migrare noua (vezi README / indrumarul).


class Project(Base):
    __tablename__ = "project"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relatie 1-n: un proiect (client/lot) are mai multe sarcini (fise ECU); stergerea proiectului sterge si sarcinile
    tasks: Mapped[list["Task"]] = relationship(
        back_populates="project", cascade="all, delete-orphan", passive_deletes=True
    )


class Task(Base):
    __tablename__ = "task"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    # Valori permise: de_facut (Receptionat), in_lucru (In diagnoza), finalizat (Reparat & Testat)
    status: Mapped[str] = mapped_column(String(20), default="de_facut")
    # 1 = Stoc/Normala, 2 = Prioritara, 3 = URGENTA
    priority: Mapped[int] = mapped_column(Integer, default=2)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    project_id: Mapped[int] = mapped_column(ForeignKey("project.id", ondelete="CASCADE"))

    project: Mapped[Project] = relationship(back_populates="tasks")
    comments: Mapped[list["Comment"]] = relationship(
        back_populates="task", cascade="all, delete-orphan", passive_deletes=True
    )


class Comment(Base):
    __tablename__ = "comment"

    id: Mapped[int] = mapped_column(primary_key=True)
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    task_id: Mapped[int] = mapped_column(ForeignKey("task.id", ondelete="CASCADE"))

    task: Mapped[Task] = relationship(back_populates="comments")