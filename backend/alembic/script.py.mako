"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# Identificatorii migrarii (Alembic ii foloseste pentru ordinea migrarilor)
revision: str = ${repr(up_revision)}
down_revision: Union[str, Sequence[str], None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade() -> None:
    """Modificarile aplicate la alembic upgrade."""
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    """Anularea modificarilor (alembic downgrade -1)."""
    ${downgrades if downgrades else "pass"}
