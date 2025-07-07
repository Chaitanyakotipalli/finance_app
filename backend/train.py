# train_from_csv.py

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

# 1) Load your reviewed CSV
df = pd.read_csv("auto_labeled.csv")
df = df.dropna(subset=["description", "category"])

# 2) Split
X_train, X_test, y_train, y_test = train_test_split(
    df["description"], df["category"],
    test_size=0.2, stratify=df["category"], random_state=42
)

# 3) Pipeline
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True, stop_words="english",
        ngram_range=(1,2), max_features=2000
    )),
    ("nb", MultinomialNB())
])

# 4) Train & evaluate
pipeline.fit(X_train, y_train)
print("Validation Accuracy:", pipeline.score(X_test, y_test))

# 5) Save artifacts
joblib.dump(pipeline.named_steps["tfidf"], "tfidf_vectorizer.joblib")
joblib.dump(pipeline.named_steps["nb"],   "nb_classifier.joblib")
