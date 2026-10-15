import pandas as pd
import numpy as np
from scipy.io import arff
from sklearn.preprocessing import MinMaxScaler
from imblearn.over_sampling import SMOTE

def load_and_clean_phishing_url_dataset(arff_path, output_path):
    
    # ── Step 1: Load arff file ─────────────────────────────
    print("Step 1: Loading dataset...")
    data, meta = arff.loadarff(arff_path)
    df = pd.DataFrame(data)
    print(f"Original shape: {df.shape}")

    # ── Step 2: Decode using pandas instead of manual decode ─
    print("\nStep 2: Decoding byte strings using pandas...")
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = pd.to_numeric(
                df[col].str.decode('utf-8'), errors='coerce'
            )
    print("Decoding complete.")
    print(f"Data types:\n{df.dtypes.value_counts()}")

    # ── Step 3: Audit step — handle missing values ──────────
    print("\nStep 3: Auditing missing values...")
    
    # Replace '?' with NaN if any exist
    df.replace('?', np.nan, inplace=True)
    
    missing = df.isnull().sum()
    total_missing = missing.sum()
    print(f"Total missing values found: {total_missing}")
    
    if total_missing > 0:
        print("Columns with missing values:")
        print(missing[missing > 0])
        # Fill missing values with column mode (most common value)
        for col in df.columns:
            if df[col].isnull().sum() > 0:
                df[col].fillna(df[col].mode()[0], inplace=True)
        print("Missing values filled with column mode.")
    else:
        print("No missing values found. Dataset is clean.")

    # ── Step 4: Remove duplicates ───────────────────────────
    print("\nStep 4: Removing duplicates...")
    before = df.shape[0]
    df = df.drop_duplicates()
    after = df.shape[0]
    print(f"Removed {before - after} duplicate rows.")
    print(f"Shape after removing duplicates: {df.shape}")

    # ── Step 5: Separate features and target ────────────────
    print("\nStep 5: Separating features and target...")
    X = df.drop('Result', axis=1)
    y = df['Result']
    print(f"Features shape: {X.shape}")
    print(f"Target shape: {y.shape}")

    # ── Step 6: Check class imbalance ───────────────────────
    print("\nStep 6: Checking class imbalance...")
    distribution = y.value_counts()
    print(f"Class distribution:\n{distribution}")
    
    ratio = distribution.min() / distribution.max()
    print(f"Minority/Majority ratio: {ratio:.2f}")
    
    if ratio < 0.8:
        print("Class imbalance detected! Applying SMOTE...")
        smote = SMOTE(random_state=42)
        X, y = smote.fit_resample(X, y)
        print(f"Shape after SMOTE: {X.shape}")
        print(f"Class distribution after SMOTE:\n{pd.Series(y).value_counts()}")
    else:
        print("Classes are balanced. SMOTE not needed.")

    # ── Step 7: Feature scaling with MinMaxScaler ───────────
    print("\nStep 7: Applying MinMaxScaler...")
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)
    X_scaled = pd.DataFrame(X_scaled, columns=X.columns)
    print("Scaling complete. All features now in range [0, 1].")
    print(f"Sample scaled values:\n{X_scaled.head(3)}")

    # ── Step 8: Combine and save ─────────────────────────────
    print("\nStep 8: Saving cleaned dataset...")
    df_final = X_scaled.copy()
    df_final['Result'] = y.values
    df_final.to_csv(output_path, index=False)
    print(f"Cleaned dataset saved to: {output_path}")
    print(f"Final shape: {df_final.shape}")

    return df_final

if __name__ == "__main__":
    arff_path = "data/Training Dataset.arff"
    output_path = "data/phishing_urls_cleaned.csv"
    load_and_clean_phishing_url_dataset(arff_path, output_path)