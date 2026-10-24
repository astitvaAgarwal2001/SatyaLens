from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class WingEnum(str, enum.Enum):
    LEFT = "LEFT"
    CENTER = "CENTER"
    RIGHT = "RIGHT"
    UNCLASSIFIED = "UNCLASSIFIED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    saved_articles = relationship("SavedArticle", back_populates="user", cascade="all, delete-orphan")
    search_history = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan")

class DomainClassification(Base):
    __tablename__ = "domain_classifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    domain = Column(String(255), unique=True, index=True, nullable=False)
    publisher_name = Column(String(255), nullable=False)
    wing = Column(String(50), default=WingEnum.UNCLASSIFIED.value, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class SavedArticle(Base):
    __tablename__ = "saved_articles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(Text, nullable=False)
    url = Column(Text, nullable=False)
    domain = Column(String(255), nullable=False)
    wing = Column(String(50), default="UNCLASSIFIED", nullable=False)
    snippet = Column(Text, nullable=True)
    publisher_name = Column(String(255), nullable=True)
    published_at = Column(String(100), nullable=True)
    saved_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="saved_articles")

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    query = Column(String(500), nullable=False)
    searched_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="search_history")
