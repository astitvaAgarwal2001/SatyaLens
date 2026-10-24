from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, EmailStr, Field

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: str
    exp: Optional[int] = None

# --- Domain Classification Schemas ---
class DomainClassificationBase(BaseModel):
    domain: str
    publisher_name: str
    wing: str  # 'LEFT', 'CENTER', 'RIGHT', 'UNCLASSIFIED'

class DomainClassificationCreate(DomainClassificationBase):
    pass

class DomainClassificationUpdate(BaseModel):
    wing: str
    publisher_name: Optional[str] = None

class DomainClassificationOut(DomainClassificationBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Saved Article Schemas ---
class SavedArticleCreate(BaseModel):
    title: str
    url: str
    domain: str
    wing: str
    snippet: Optional[str] = None
    publisher_name: Optional[str] = None
    published_at: Optional[str] = None

class SavedArticleOut(BaseModel):
    id: int
    user_id: int
    title: str
    url: str
    domain: str
    wing: str
    snippet: Optional[str] = None
    publisher_name: Optional[str] = None
    published_at: Optional[str] = None
    saved_at: datetime

    class Config:
        from_attributes = True

# --- Search History Schemas ---
class SearchHistoryOut(BaseModel):
    id: int
    query: str
    searched_at: datetime

    class Config:
        from_attributes = True

# --- News & AI Analysis Schemas ---
class ArticleItem(BaseModel):
    id: Optional[str] = None
    title: str
    url: str
    domain: str
    publisher_name: str
    published_at: Optional[str] = None
    snippet: Optional[str] = None
    wing: str = "UNCLASSIFIED"
    is_saved: bool = False
    ai_suggested: bool = False

class PerspectiveSummary(BaseModel):
    left_perspective: str
    center_perspective: str
    right_perspective: str
    fact_consensus: str
    bias_divergence: str

class NewsSearchResponse(BaseModel):
    query: str
    expanded_queries: List[str]
    perspective_summary: Optional[PerspectiveSummary] = None
    left_articles: List[ArticleItem] = []
    center_articles: List[ArticleItem] = []
    right_articles: List[ArticleItem] = []
    unclassified_articles: List[ArticleItem] = []
    total_articles: int = 0
