"""tabele initiale: project si task, cu date de exemplu

Revision ID: 0001
Revises:
Create Date: 2026-10-08 12:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# Identificatorii migrarii (Alembic ii foloseste pentru ordinea migrarilor)
revision: str = "0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Creeaza tabelele si adauga cateva date de exemplu."""
    project = op.create_table(
        "project",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    task = op.create_table(
        "task",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("project.id", ondelete="CASCADE"), nullable=False),
    )

    # Date de exemplu. Id-urile proiectelor sunt generate de baza de date (RETURNING id).
    connection = op.get_bind()
    rezervari_id = connection.execute(
        sa.insert(project)
        .values(name="Aplicatie de rezervari", description="Rezervari online pentru o sala de sport.")
        .returning(project.c.id)
    ).scalar_one()
    asistent_id = connection.execute(
        sa.insert(project)
        .values(name="Asistent pentru studenti", description="Chatbot care raspunde la intrebari despre orar si examene.")
        .returning(project.c.id)
    ).scalar_one()

    op.bulk_insert(
        task,
        [
            {"title": "Diagrama cazurilor de utilizare", "description": "Actorii: client, administrator.",
             "status": "finalizat", "priority": 3, "project_id": rezervari_id},
            {"title": "Diagrama de clase", "description": None,
             "status": "in_lucru", "priority": 3, "project_id": rezervari_id},
            {"title": "Pagina cu lista rezervarilor", "description": None,
             "status": "de_facut", "priority": 2, "project_id": rezervari_id},
            {"title": "Alegerea modelului LLM", "description": "Comparati 2 modele mici in Ollama.",
             "status": "in_lucru", "priority": 2, "project_id": asistent_id},
            {"title": "Intrebari de test pentru chatbot", "description": None,
             "status": "de_facut", "priority": 1, "project_id": asistent_id},
        ],
    )


def downgrade() -> None:
    """Sterge tabelele (si datele din ele)."""
    op.drop_table("task")
    op.drop_table("project")
