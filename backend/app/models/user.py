from datetime import datetime, timezone

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    watchlist: Mapped[list["WatchlistEntry"]] = relationship(
        "WatchlistEntry", back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )


# Avoid circular import — WatchlistEntry imported after User is defined
from app.models.watchlist import WatchlistEntry  # noqa: E402, F401
