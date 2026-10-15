# SMS Spam Dataset Cleaning - Complete Guide

## 📋 Overview

This guide explains the data cleaning process performed on the SMS spam detection dataset containing **123,713** text messages labeled as 'ham' (legitimate) or 'spam' (unsolicited). The cleaning process produced a dataset of **123,616** clean messages ready for machine learning.

---

## 🔧 Cleaning Operations Performed

### Step 1: Data Loading
- Loaded CSV file with automatic encoding detection
- Tried UTF-8 first, fallback to ISO-8859-1 if needed
- Preserved all 123,713 original records

### Step 2: Label Standardization
- Converted labels to lowercase ('ham', 'spam')
- Removed extra spaces
- Validated labels (only 'ham' and 'spam' allowed)
- **Invalid labels found:** 0

### Step 3: Fix Broken Characters (Mojibake)
- Replaced broken characters (ï¿½, ý, �) intelligently:
  - Next to numbers → `£` (pound symbol)
  - Between letters → `'` (apostrophe)
  - Before URLs → removed
  - Unknown → removed

### Step 4: Text Cleaning
- Decoded HTML entities (`&amp;` → `&`, `&#39;` → `'`)
- Normalized Unicode (NFKC)
- Removed line breaks, carriage returns, and tabs
- Collapsed multiple spaces into single space
- Trimmed leading/trailing whitespace

### Step 5: URL Extraction & Preservation
- Found URLs using comprehensive regex pattern
- Supported: http, https, www, and bare domains
- Top-level domains: .com, .net, .org, .io, .co, .uk, etc.
- Stored URLs in separate column (`urls_formatted`)
- Added URL count and presence flags

### Step 6: Remove Bad Data
- Removed empty text messages (2 rows)
- Removed duplicate messages (95 rows)
- Removed messages that became empty after cleaning
- Removed very short messages (< 3 characters)

### Step 7: Add Metadata
- `id`: Unique identifier (1 to 123,616)
- `message_length`: Character count
- `word_count`: Word count
- `has_url`: Boolean flag
- `url_count`: Number of URLs

### Step 8: Save Cleaned Dataset
- Single output file
- UTF-8 encoding
- Ready for machine learning

---

## 📊 Before vs After Comparison

| **Metric** | **Before** | **After** | **Change** |
|------------|------------|-----------|------------|
| Total Rows | 123,713 | 123,616 | -97 (-0.08%) |
| Ham Messages | 64,366 (52.0%) | 64,366 (52.1%) | 0 |
| Spam Messages | 59,347 (48.0%) | 59,250 (47.9%) | -97 |
| Duplicate Rows | 95 | 0 | All removed |
| Empty Rows | 2 | 0 | All removed |
| Invalid Labels | 0 | 0 | None found |
| URLs Extracted | Not tracked | 1,353 | Extracted |

---

## 📁 Output File Structure

### File Name