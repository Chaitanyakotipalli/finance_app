from pydantic import BaseModel
from datetime import date
from typing import Optional

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    mobile: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    mobile: str
    password: str

class UserOut(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Transaction Schemas ---
class TransactionBase(BaseModel):
    name: str
    amount: float
    category: str
    date: date
    type_: str

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    icon: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    user_id: Optional[int] = None
    
    class Config:
        from_attributes = True