# classifier_utils.py

import re
import joblib
import os

# --- Load ML model only once ---
TFIDF_PATH = "tfidf_vectorizer.joblib"
MODEL_PATH = "nb_classifier.joblib"
tfidf = joblib.load(TFIDF_PATH) if os.path.exists(TFIDF_PATH) else None
clf = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None

MERCHANT_TO_CAT = {
    'SWIGGY': 'Food', 'ZOMATO': 'Food', 'UBER': 'Transport',
    'OLA': 'Transport', 'AMAZON': 'Shopping', 'NETFLIX': 'Entertainment'
}

CATEGORIES = set(MERCHANT_TO_CAT.values()) | {
    'Transfer', 'Rent', 'Bills', 'Salary', 'Gift'
}

def is_transfer(desc: str) -> bool:
    return bool(re.search(r'\b(TRANSFER|NEFT|IMPS|RTGS|TRF|SELF|CREDIT|DEPOSIT|WITHDRAWAL)\b', desc.upper()))

def keyword_category(desc: str) -> str | None:
    du = desc.upper()
    for kw, cat in MERCHANT_TO_CAT.items():
        if kw in du:
            return cat
    return None

def extract_merchant(desc: str) -> str:
    d = desc.upper()
    d = re.sub(r'HDFC\d+/', '', d)
    d = re.sub(r'UPI/\d+', '', d)
    d = re.sub(r'\b(BRANCH|ATM SERVICE BRANCH|PAYMENT FROM|NEFT|IMPS|RTGS|TRF|TRANSFER|TO|FROM|SELF|CREDIT|DEPOSIT|WITHDRAWAL)\b', '', d)
    d = re.sub(r'\s+', ' ', d).strip()
    raw_parts = d.split('/')[1:]
    parts = [p.strip() for p in raw_parts if len(p.strip()) > 2 and not re.match(r'^X{4,}', p) and not re.match(r'^[A-Z]{4}\d{6}', p)]
    for part in parts:
        if any(char.isalpha() for char in part):  # must contain a letter
            return part.title()
    upi_match = re.search(r'\b([A-Z0-9._%+-]+@[A-Z]+)\b', d)
    if upi_match:
        return upi_match.group(1).title()
    phone_match = re.search(r'\b\d{10}\b', d)
    if phone_match:
        return phone_match.group(0)
    words = d.split()
    return ' '.join(words[:4]).title() if words else "Unlabeled Transfer"

def ml_category(desc: str) -> str:
    if not tfidf or not clf:
        return "Uncategorised"
    try:
        vec = tfidf.transform([desc])
        return clf.predict(vec)[0]
    except:
        return "Uncategorised"

def classify_transaction_simple(desc: str):
    D = desc.upper()
    for m, cat in MERCHANT_TO_CAT.items():
        if m in D:
            return m.title(), cat
    for cat in CATEGORIES:
        if cat.upper() in D:
            return cat, cat
    merchant = extract_merchant(desc)
    if is_transfer(desc):
        return merchant, "Transfer"
    kw = keyword_category(desc)
    if kw:
        return merchant, kw
    return merchant, ml_category(desc)
