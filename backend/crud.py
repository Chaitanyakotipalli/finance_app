from sqlalchemy.orm import Session
from sqlalchemy import or_
import models, schemas
from fastapi import HTTPException

# --- User functions ---
def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        name=user.name, 
        mobile=user.mobile, 
        password=user.password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_mobile(db: Session, mobile: str):
    return db.query(models.User).filter(models.User.mobile == mobile).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

# --- Transactions ---
def create_transaction(db: Session, txn: schemas.TransactionCreate, user_id: int):
    db_txn = models.Transaction(
        name=txn.name,
        amount=txn.amount,
        category=txn.category,
        date=txn.date,
        type_=txn.type_,
        user_id=user_id
    )
    db.add(db_txn)
    db.commit()
    db.refresh(db_txn)
    return db_txn

def get_transactions(db: Session, user_id: int):
    return db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id
    ).order_by(models.Transaction.date.desc()).all()

def get_transaction_by_id(db: Session, txn_id: int, user_id: int):
    return db.query(models.Transaction).filter(
        models.Transaction.id == txn_id,
        models.Transaction.user_id == user_id
    ).first()

def update_transaction(db: Session, txn_id: int, txn: schemas.TransactionCreate, user_id: int):
    db_txn = db.query(models.Transaction).filter(
        models.Transaction.id == txn_id,
        models.Transaction.user_id == user_id
    ).first()
    
    if not db_txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update fields
    db_txn.name = txn.name
    db_txn.amount = txn.amount
    db_txn.category = txn.category
    db_txn.date = txn.date
    db_txn.type_ = txn.type_
    
    db.commit()
    db.refresh(db_txn)
    return db_txn

def delete_transaction(db: Session, txn_id: int, user_id: int):
    db_txn = db.query(models.Transaction).filter(
        models.Transaction.id == txn_id,
        models.Transaction.user_id == user_id
    ).first()
    
    if db_txn:
        db.delete(db_txn)
        db.commit()
        return True
    return False

# --- Categories ---
def get_categories(db: Session, user_id: int):
    """Get all categories available to user (default + user-specific)"""
    return db.query(models.Category).filter(
        or_(
            models.Category.user_id == None,  # Default categories
            models.Category.user_id == user_id  # User-specific categories
        )
    ).all()

def create_category(db: Session, cat: schemas.CategoryCreate, user_id: int):
    # Check if category already exists for this user
    existing = db.query(models.Category).filter(
        models.Category.name == cat.name,
        models.Category.user_id == user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    db_cat = models.Category(
        name=cat.name,
        icon=cat.icon,
        user_id=user_id
    )
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

def get_category_by_name(db: Session, name: str, user_id: int):
    return db.query(models.Category).filter(
        models.Category.name == name,
        or_(
            models.Category.user_id == None,
            models.Category.user_id == user_id
        )
    ).first()