import io
import pandas as pd
from classifier_utils import classify_transaction_simple

# --- 1) Read raw CSV & detect header ---
with open("labeled_transactions.csv", encoding="utf-8", errors="ignore") as f:
    raw = f.read().splitlines()

# Find the header line containing "Description"
hdr_idx = next(i for i, ln in enumerate(raw) if "Description" in ln)
df = pd.read_csv(io.StringIO("\n".join(raw[hdr_idx:])), header=0)

# --- 2) Clean + normalize ---
df.columns = [c.strip() for c in df.columns]
desc_col = next(c for c in df.columns if "desc" in c.lower())
df = df[[desc_col]].rename(columns={desc_col: "description"})

df = df[df["description"].notna()].copy()
df["description"] = df["description"].astype(str).str.strip()
df = df[df["description"] != ""]

# --- 3) Apply classification logic ---
results = df["description"].apply(classify_transaction_simple)
df["merchant"], df["category"] = zip(*results)

# --- 4) Save labeled data ---
df.to_csv("auto_labeled.csv", index=False)
print(f"✅ Auto-labeled {len(df)} rows → saved to auto_labeled.csv")
