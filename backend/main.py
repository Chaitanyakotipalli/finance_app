from fastapi import FastAPI, Depends, HTTPException, APIRouter, File, UploadFile, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import SessionLocal, engine
import models, schemas, crud
from datetime import date
from collections import defaultdict
import numpy as np
import pandas as pd
import joblib, io, os
from classifier_utils import classify_transaction_simple 
from schemas import UserCreate, UserLogin, UserOut
from crud import create_user, get_user_by_mobile


# --- FastAPI setup ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Create tables ---
models.Base.metadata.create_all(bind=engine)

# --- DB dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Auth endpoints ---
@app.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_mobile(db, user.mobile)
    if existing:
        raise HTTPException(status_code=400, detail="Mobile number already registered.")
    return crud.create_user(db, user)

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    existing = get_user_by_mobile(db, user.mobile)
    if not existing or existing.password != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    return {"user_id": existing.id, "name": existing.name}

# --- Initialize default categories ---
def init_default_categories():
    with SessionLocal() as db:
        defaults = [
            {"name": "Food", "icon": "🍽️"},
            {"name": "Transport", "icon": "🚌"},
            {"name": "Shopping", "icon": "🛍️"},
            {"name": "Entertainment", "icon": "🎬"},
            {"name": "Bills", "icon": "💡"},
            {"name": "Salary", "icon": "💰"},
            {"name": "Gift", "icon": "🎁"},
            {"name": "Transfer", "icon": "🔄"},
            {"name": "Uncategorised", "icon": "❓"},
            {"name": "Medical", "icon": "🏥"},
            {"name": "Education", "icon": "📚"},
            {"name": "Recharge", "icon": "📲"},
            {"name": "Investment", "icon": "📈"},
            {"name": "Loan", "icon": "💸"},
            {"name": "Travel", "icon": "✈️"},
            {"name": "Fuel", "icon": "⛽"},
            {"name": "Groceries", "icon": "🛒"},
            {"name": "Healthcare", "icon": "🩺"},
            {"name": "Insurance", "icon": "📑"},
        ]

        for cat in defaults:
            # Check if default category already exists (user_id is None for defaults)
            if not db.query(models.Category).filter_by(name=cat["name"], user_id=None).first():
                db.add(models.Category(**cat, user_id=None))  # Default categories have user_id=None
        db.commit()

# Initialize default categories on startup
init_default_categories()

# --- CSV Upload ---
@app.post("/upload_csv/")
def upload_csv(file: UploadFile = File(...), user_id: int = Query(...), db: Session = Depends(get_db)):
    try:
        # Verify user exists
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        contents = file.file.read().decode("utf-8")
        lines = contents.splitlines()
        header_index = next((i for i, l in enumerate(lines) if "Txn Date" in l and "Description" in l), None)
        if header_index is None:
            raise HTTPException(400, "Header line not found")

        df = pd.read_csv(io.StringIO("\n".join(lines[header_index:])))
        df.columns = [c.strip() for c in df.columns]
        df.rename(columns={"Txn Date": "date", "Description": "description",
                           "Credit Amount": "Income", "Debit Amount": "Expense"}, inplace=True)
        df["date"] = pd.to_datetime(df["date"], dayfirst=True, errors="coerce").dt.date
        
        count = 0
        for _, row in df.iterrows():
            desc = str(row.get("description", "")).strip()
            date_val = row.get("date")
            inc, exp = row.get("Income"), row.get("Expense")
            if pd.isna(inc) and pd.isna(exp): continue
            if not desc or pd.isna(date_val): continue
            amount, type_ = (str(inc), "Income") if not pd.isna(inc) else (str(exp), "Expense")
            merchant, category = classify_transaction_simple(desc)
            name = merchant[:100]
            # Check if transaction already exists
            exists = db.query(models.Transaction).filter_by(
                name=name,
                amount=float(amount),
                date=date_val,
                type_=type_,
                user_id=user_id
            ).first()

            if exists:
                continue  # Skip duplicates

            # Add new transaction
            db.add(models.Transaction(
                name=name, 
                amount=float(amount), 
                category=category, 
                date=date_val, 
                type_=type_,
                user_id=user_id
            ))
            count += 1


        db.commit()
        return {"message": f"{count} transactions imported successfully"}

    except Exception as e:
        raise HTTPException(500, f"Error processing CSV: {e}")

# --- Transactions CRUD ---
@app.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(txn: schemas.TransactionCreate, user_id: int = Query(...), db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_transaction(db, txn, user_id)

@app.get("/transactions/", response_model=list[schemas.Transaction])
def read_transactions(user_id: int = Query(...), db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_transactions(db, user_id)

@app.delete("/transactions/{txn_id}")
def delete_transaction(txn_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    crud.delete_transaction(db, txn_id, user_id)
    return {"message": "Deleted"}

@app.put("/transactions/{txn_id}", response_model=schemas.Transaction)
def update_transaction(txn_id: int, txn: schemas.TransactionCreate, user_id: int = Query(...), db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.update_transaction(db, txn_id, txn, user_id)

# --- Categories CRUD ---
@app.get("/categories/", response_model=list[schemas.Category])
def read_categories(user_id: int = Query(...), db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_categories(db, user_id)

@app.post("/categories/", response_model=schemas.Category)
def create_category(cat: schemas.CategoryCreate, user_id: int = Query(...), db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.create_category(db, cat, user_id)

# --- Analytics endpoints ---
@app.get("/analytics/all")
def analytics_all(user_id: int = Query(...), db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    summary = db.execute(text("""
        SELECT
          SUM(CASE WHEN LOWER(TRIM(type_)) = 'income'  THEN amount ELSE 0 END) AS total_income,
          SUM(CASE WHEN LOWER(TRIM(type_)) = 'expense' THEN amount ELSE 0 END) AS total_expense,
          SUM(CASE WHEN LOWER(TRIM(type_)) = 'income'  THEN amount ELSE 0 END)
            - SUM(CASE WHEN LOWER(TRIM(type_)) = 'expense' THEN amount ELSE 0 END) AS net_savings
        FROM transactions WHERE user_id = :user_id;
    """), {"user_id": user_id}).mappings().first()

    year = db.execute(text("""
        SELECT category, SUM(amount) as total, type_ FROM transactions
        WHERE YEAR(date) = YEAR(CURDATE()) AND user_id = :user_id 
        GROUP BY category, type_ ORDER BY total DESC;
    """), {"user_id": user_id}).mappings().all()

    month = db.execute(text("""
        SELECT category, SUM(amount) as total, type_ FROM transactions
        WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE()) AND user_id = :user_id
        GROUP BY category, type_ ORDER BY total DESC;
    """), {"user_id": user_id}).mappings().all()

    week = db.execute(text("""
        SELECT category, SUM(amount) as total, type_ FROM transactions
        WHERE WEEK(date, 1) = WEEK(CURDATE(), 1) AND YEAR(date) = YEAR(CURDATE()) AND user_id = :user_id
        GROUP BY category, type_ ORDER BY total DESC;
    """), {"user_id": user_id}).mappings().all()

    date = db.execute(text("""
        SELECT category, SUM(amount) as total, type_ FROM transactions
        WHERE date = CURDATE() AND user_id = :user_id 
        GROUP BY category, type_ ORDER BY total DESC;
    """), {"user_id": user_id}).mappings().all()

    return {
        "summary": summary,
        "year": year,
        "month": month,
        "week": week,
        "date": date,
    }

@app.get("/analytics/trends")
def analytics_trends(user_id: int = Query(...), db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    def get(query): 
        return db.execute(text(query), {"user_id": user_id}).mappings().all()
    
    return {
        "day_trends": get("SELECT SUM(amount) AS total, type_ FROM transactions WHERE date = CURDATE() AND user_id = :user_id GROUP BY type_;"),
        "week_trends": get("SELECT SUM(amount) AS total, type_ FROM transactions WHERE WEEK(date, 1) = WEEK(CURDATE(), 1) AND YEAR(date) = YEAR(CURDATE()) AND user_id = :user_id GROUP BY type_;"),
        "month_trends": get("SELECT SUM(amount) AS total, type_ FROM transactions WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE()) AND user_id = :user_id GROUP BY type_;"),
        "year_trends": get("SELECT SUM(amount) AS total, type_ FROM transactions WHERE YEAR(date) = YEAR(CURDATE()) AND user_id = :user_id GROUP BY type_;"),
    }

@app.get("/analytics/filter")
def filter_analysis(user_id: int = Query(...), db: Session = Depends(get_db),
                    start_date: str = Query(None),
                    end_date: str = Query(None),
                    type_: str = Query(None),
                    category: str = Query(None)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    base_query = """
        SELECT category, SUM(amount) AS total, type_, date
        FROM transactions WHERE user_id = :user_id
    """
    filters = []
    params = {"user_id": user_id}
    
    if start_date: 
        filters.append("AND date >= :start_date")
        params["start_date"] = start_date
    if end_date: 
        filters.append("AND date <= :end_date")
        params["end_date"] = end_date
    if type_: 
        filters.append("AND type_ = :type_")
        params["type_"] = type_
    if category: 
        filters.append("AND category = :category")
        params["category"] = category
        
    final_query = base_query + " " + " ".join(filters) + " GROUP BY category, type_, date ORDER BY date"
    return db.execute(text(final_query), params).mappings().all()

@app.get("/analytics/monthly_spending")
def get_monthly_spending(user_id: int = Query(...), db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    result = db.execute(text("""
        SELECT SUM(amount) AS total FROM transactions 
        WHERE type_ = 'Expense' AND MONTH(date) = MONTH(CURDATE()) 
        AND YEAR(date) = YEAR(CURDATE()) AND user_id = :user_id;
    """), {"user_id": user_id}).mappings().first()
    
    return {"total_spent": result["total"] or 0}

@app.get("/analytics/recommend_budget")
def recommend_budget(user_id: int = Query(...), db: Session = Depends(get_db), 
                    months: int = Query(6), target_saving: float = Query(2000.0)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if months <= 0:
        raise HTTPException(400, detail="Months must be positive.")
        
    rows = db.execute(text(f"""
        SELECT category, SUM(amount) AS total FROM transactions
        WHERE user_id = :user_id AND type_ = 'Expense' 
        AND date >= DATE_SUB(CURDATE(), INTERVAL {months} MONTH)
        GROUP BY category;
    """), {"user_id": user_id}).mappings().all()

    category_totals = {r["category"]: r["total"] for r in rows}
    total_spent = sum(category_totals.values())
    
    if total_spent == 0:
        raise HTTPException(400, detail="No expense data found.")
    if target_saving >= total_spent:
        raise HTTPException(400, detail="Saving goal exceeds total expenses.")
        
    allocatable = total_spent - target_saving
    recommendations = {
        cat: round((val / total_spent) * allocatable, 2)
        for cat, val in category_totals.items()
    }

    return {
        "months_considered": months,
        "total_spent": round(total_spent, 2),
        "target_saving": target_saving,
        "allocatable_budget": round(allocatable, 2),
        "recommended_budget": recommendations
    }

from sklearn.linear_model import LinearRegression

@app.get("/analytics/predict_budget")
def predict_next_month_budget(user_id: int = Query(...), db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    rows = db.execute(text("""
        SELECT MONTH(date) AS month, YEAR(date) AS year, category, SUM(amount) AS total
        FROM transactions
        WHERE user_id = :user_id AND type_ = 'Expense' 
        AND date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY year, month, category ORDER BY year, month;
    """), {"user_id": user_id}).mappings().all()

    category_series = defaultdict(list)
    for row in rows:
        month_idx = (row['year'] - 2000) * 12 + row['month']
        category_series[row['category']].append((month_idx, row['total']))

    predictions = {}
    for cat, data in category_series.items():
        if len(data) >= 2:
            data.sort()
            X = np.array([[x[0]] for x in data])
            y = np.array([x[1] for x in data])
            model = LinearRegression().fit(X, y)
            next_month = max(x[0] for x in data) + 1
            pred = max(model.predict([[next_month]])[0], 0)
            predictions[cat] = round(float(pred), 2)

    return predictions