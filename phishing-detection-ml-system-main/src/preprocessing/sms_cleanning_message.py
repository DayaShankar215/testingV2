# =====================================================================
# SMS Spam Dataset Cleaner - Complete Refined Code
# Run this on your own computer / Jupyter / Colab.
# Just change INPUT_PATH to match your file location.
# =====================================================================

import re
import html
import pandas as pd
import unicodedata

# ---------------------------------------------------------------
# STEP 1: File path - EDIT THIS to match your setup
# ---------------------------------------------------------------
INPUT_PATH = "sms_scam_detection_dataset_merged_with_lang.csv"
OUTPUT_PATH = "sms_scam_detection_dataset_cleaned.csv"


# ---------------------------------------------------------------
# STEP 2: URL detection pattern
# ---------------------------------------------------------------
URL_REGEX = re.compile(
    r"(?:https?://[^\s,]+"
    r"|www\.[^\s,]+"
    r"|\b[a-zA-Z0-9\-]+\.(?:com|net|org|io|co|uk|info|biz|xyz|me|mobi|ac|to|gov|edu|in|us|ca|au|de|fr|jp|cn|ru)(?:/[^\s,]*)?)",
    re.IGNORECASE,
)


# ---------------------------------------------------------------
# STEP 3: Garbage character pattern
# ---------------------------------------------------------------
MOJIBAKE_REGEX = re.compile(r"(ï¿½|ý|�|�)+")


# ===============================================================
# STEP 4: Fix broken characters
# ===============================================================
def fix_mojibake(text):
    """Fix broken characters (mojibake) intelligently based on context"""
    
    def repl(match):
        start, end = match.span()
        char_before = text[start - 1] if start > 0 else ""
        char_after = text[end] if end < len(text) else ""
        next_few_chars = text[end:end + 4].lower()

        if next_few_chars.startswith("http") or next_few_chars.startswith("www."):
            return " "
        if char_before.isdigit() or char_after.isdigit():
            return "£"
        if char_before.isalpha() and char_after.isalpha():
            return "'"
        return ""

    return MOJIBAKE_REGEX.sub(repl, text)


# ===============================================================
# STEP 5: Clean text message
# ===============================================================
def clean_text(text):
    """Clean a single text message"""
    if pd.isna(text):
        return ""
    text = str(text)
    text = fix_mojibake(text)          # Fix broken characters
    text = html.unescape(text)          # Decode HTML entities
    text = unicodedata.normalize('NFKC', text)  # Normalize Unicode
    text = text.replace("\r\n", " ").replace("\r", " ").replace("\n", " ").replace("\t", " ")
    text = re.sub(r"\s+", " ", text)    # Collapse multiple spaces
    return text.strip()


# ===============================================================
# STEP 6: Extract URLs
# ===============================================================
def extract_urls(text):
    """Extract all URLs from a text message"""
    if not text:
        return []
    return URL_REGEX.findall(text)


# ===============================================================
# STEP 7: MAIN CLEANING FUNCTION
# ===============================================================
def clean_dataset(df):
    """Clean the entire dataset with proper label handling"""
    
    print("\n" + "="*60)
    print("STARTING DATASET CLEANING")
    print("="*60)
    
    initial_rows = len(df)
    print(f"\nRows loaded (raw): {initial_rows:,}")
    
    # Get original label distribution
    print(f"\nOriginal label distribution:")
    print(df["label"].value_counts())
    
    # -----------------------------------------------------------
    # 7a. STANDARDIZE labels - KEEP ALL ROWS
    # -----------------------------------------------------------
    print("\n[1] Standardizing labels...")
    df["label"] = df["label"].astype(str).str.strip().str.lower()
    
    valid_labels = ["ham", "spam"]
    invalid_mask = ~df["label"].isin(valid_labels)
    invalid_count = invalid_mask.sum()
    
    if invalid_count > 0:
        print(f"    Found {invalid_count} rows with invalid labels")
        df = df[~invalid_mask]
    else:
        print(f"    All labels are valid (ham/spam)")
    
    # -----------------------------------------------------------
    # 7b. Remove empty text rows
    # -----------------------------------------------------------
    print("\n[2] Removing empty text rows...")
    df["text"] = df["text"].astype(str)
    empty_mask = df["text"].str.strip() == ""
    empty_count = empty_mask.sum()
    df = df[~empty_mask]
    print(f"    Removed {empty_count:,} rows with empty text")
    
    # -----------------------------------------------------------
    # 7c. Clean the actual message text
    # -----------------------------------------------------------
    print("\n[3] Cleaning text messages...")
    df["text"] = df["text"].apply(clean_text)
    
    empty_after_clean = df["text"].str.len() == 0
    empty_after_clean_count = empty_after_clean.sum()
    df = df[~empty_after_clean]
    print(f"    Removed {empty_after_clean_count:,} rows where text became empty")
    
    # -----------------------------------------------------------
    # 7d. Extract URLs
    # -----------------------------------------------------------
    print("\n[4] Extracting URLs...")
    df["urls"] = df["text"].apply(extract_urls)
    df["has_url"] = df["urls"].apply(lambda x: len(x) > 0)
    df["urls_formatted"] = df["urls"].apply(lambda x: "; ".join(x) if x else "")
    df["url_count"] = df["urls"].apply(len)
    
    url_count = df["has_url"].sum()
    print(f"    Rows with URLs: {url_count:,}")
    
    # -----------------------------------------------------------
    # 7e. Add metadata
    # -----------------------------------------------------------
    print("\n[5] Adding metadata...")
    df["message_length"] = df["text"].str.len()
    df["word_count"] = df["text"].str.split().str.len()
    print(f"    Added: message_length, word_count")
    
    # -----------------------------------------------------------
    # 7f. Remove duplicates
    # -----------------------------------------------------------
    print("\n[6] Removing duplicates...")
    duplicate_count = df.duplicated(subset=["label", "text"]).sum()
    df = df.drop_duplicates(subset=["label", "text"], keep="first")
    print(f"    Removed {duplicate_count:,} duplicate rows")
    
    # -----------------------------------------------------------
    # 7g. Remove very short messages
    # -----------------------------------------------------------
    print("\n[7] Removing very short messages...")
    short_mask = df["message_length"] < 3
    short_count = short_mask.sum()
    df = df[~short_mask]
    print(f"    Removed {short_count:,} very short messages")
    
    # -----------------------------------------------------------
    # 7h. Reset index and add ID
    # -----------------------------------------------------------
    print("\n[8] Resetting index...")
    df = df.reset_index(drop=True)
    df.insert(0, "id", range(1, len(df) + 1))
    
    # -----------------------------------------------------------
    # 7i. FINAL - Show label distribution
    # -----------------------------------------------------------
    final_rows = len(df)
    print(f"\nFinal rows: {final_rows:,}")
    
    print(f"\nFinal label distribution:")
    print(df["label"].value_counts())
    
    ham_count = len(df[df["label"] == "ham"])
    spam_count = len(df[df["label"] == "spam"])
    
    print(f"\n   Ham:  {ham_count:,} ({ham_count/final_rows*100:.1f}%)")
    print(f"   Spam: {spam_count:,} ({spam_count/final_rows*100:.1f}%)")
    
    # -----------------------------------------------------------
    # 7j. Clean up - remove temporary URL list column
    # -----------------------------------------------------------
    df = df.drop(columns=["urls"])
    
    print("\n" + "="*60)
    print("CLEANING COMPLETE!")
    print("="*60)
    
    return df


# ===============================================================
# STEP 8: MAIN EXECUTION
# ===============================================================
def main():
    """Main execution function"""
    
    print("\n" + "="*60)
    print("SMS SCAM DATASET CLEANER")
    print("="*60)
    print(f"\nInput file:  {INPUT_PATH}")
    print(f"Output file: {OUTPUT_PATH}")
    
    # Load data
    print("\n📂 Loading dataset...")
    try:
        df = pd.read_csv(INPUT_PATH, encoding="utf-8")
    except UnicodeDecodeError:
        print("    UTF-8 failed, trying ISO-8859-1...")
        df = pd.read_csv(INPUT_PATH, encoding="ISO-8859-1")
    except FileNotFoundError:
        print(f"\n❌ ERROR: File not found: {INPUT_PATH}")
        return
    
    print(f"    Loaded {len(df):,} rows")
    print(f"    Columns: {list(df.columns)}")
    
    # Clean dataset
    df = clean_dataset(df)
    
    # Show sample of cleaned data
    print("\n📌 SAMPLE OF CLEANED DATA:")
    print("-"*70)
    sample = df.head(5)
    for _, row in sample.iterrows():
        text = row['text'][:80] + "..." if len(row['text']) > 80 else row['text']
        print(f"\nID: {row['id']} | Label: {row['label']}")
        print(f"Text: {text}")
        if row['has_url']:
            print(f"URLs: {row['urls_formatted']}")
        print("-"*70)
    
    # Save cleaned data
    print(f"\n💾 Saving cleaned dataset...")
    df.to_csv(OUTPUT_PATH, index=False, encoding="utf-8")
    print(f"    ✅ Saved to: {OUTPUT_PATH}")
    
    print("\n✅ ALL DONE!")


# ===============================================================
# STEP 9: Run the main function
# ===============================================================
if __name__ == "__main__":
    main()