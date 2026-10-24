from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DomainClassification, WingEnum
from app.schemas import DomainClassificationCreate, DomainClassificationUpdate, DomainClassificationOut
from app.services.classifier_service import classifier_service, extract_base_domain

router = APIRouter(prefix="/api/classifications", tags=["Classifications"])

@router.get("", response_model=List[DomainClassificationOut])
def get_all_classifications(
    wing: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(DomainClassification)
    if wing:
        query = query.filter(DomainClassification.wing == wing.upper())
    return query.order_by(DomainClassification.publisher_name.asc()).all()

@router.post("", response_model=DomainClassificationOut)
def upsert_classification(
    payload: DomainClassificationCreate,
    db: Session = Depends(get_db)
):
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Publisher directory and wing classifications are hardcoded by developers and cannot be created or modified by users."
    )

@router.put("/{domain}", response_model=DomainClassificationOut)
def update_domain_wing(
    domain: str,
    payload: DomainClassificationUpdate,
    db: Session = Depends(get_db)
):
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Publisher directory and wing classifications are hardcoded by developers and cannot be modified."
    )

@router.delete("/{classification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_classification(
    classification_id: int,
    db: Session = Depends(get_db)
):
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Publisher directory and wing classifications are hardcoded by developers and cannot be deleted."
    )
