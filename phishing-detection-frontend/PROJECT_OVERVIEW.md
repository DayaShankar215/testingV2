# SecureShield — Project Overview

> A short, simple guide to the SecureShield phishing-detection web app.
> Written for the IEEE conference presentation.

---

## 1. What is SecureShield?

**SecureShield** is a web app that tells you if a **link (URL)** or a **message (SMS/email)**
is a scam.

You paste a URL or a message into the app, press one button, and an AI model on the
server decides the answer. The app then shows you:

- the verdict (**PHISHING / SCAM / SUSPICIOUS / SAFE**),
- the **reasons** behind that verdict,
- a **PDF report** you can download and keep,
- a **feedback** button so you can tell the system if it was right or wrong.

The app works for **logged-in users** and for **guests** (no account needed — the
guest's scans are kept only in that browser).

---

## 2. Tech stack (what it is built with)

| Layer | Technology | Why |
|---|---|---|
| UI | React 18 | Component-based UI |
| Build tool | Vite 4 | Very fast dev server + build |
| Routing | react-router-dom 6 | Page navigation (`/`, `/url-scan`, …) |
| HTTP | axios | Talks to the backend API |
| Charts | recharts | Dashboard graphs (area + pie chart) |
| Notifications | react-hot-toast | Pop-up success/error messages |
| Icons | react-icons | All the small shield/link/message icons |
| PDF | jspdf + jspdf-autotable | Generates the downloadable report |
| Excel | xlsx-js-style | Generates the styled `.xlsx` history export |
| Styling | Plain CSS (no framework) | Custom design system, light + dark theme |

**Backend:** a separate REST API (Node/Express + ML model) hosted at
`https://secureshield-backend-1.onrender.com`. The frontend never runs the model —
it only sends text and renders the answer.

---

## 3. Project structure

```
phishing-detection-frontend/
├── index.html                  # HTML entry, meta tags, theme boot script
├── vite.config.js              # Dev server + /api proxy
├── .env                        # VITE_API_BASE_URL (backend address)
├── public/                     # PWA manifest, icons
└── src/
    ├── main.jsx                # React root; loads the 3 CSS files
    ├── App.jsx                 # All routes + layout shell
    │
    ├── pages/                  # One file per screen
    │   ├── Dashboard.jsx       # Stats, charts, recent scans
    │   ├── URLScanner.jsx      # Scan a link
    │   ├── MessageScanner.jsx  # Scan a message
    │   ├── History.jsx         # Past scans, filters, Excel export
    │   ├── Profile.jsx         # Edit name/email, change password
    │   ├── Login.jsx           # Sign in
    │   ├── Register.jsx        # Create account
    │   └── NotFound.jsx        # 404 page
    │
    ├── components/common/      # Reusable UI pieces
    │   ├── Navbar.jsx          # Top bar + navigation
    │   ├── Footer.jsx          # 4-column footer
    │   ├── CommandPalette.jsx  # Ctrl/⌘+K quick search
    │   ├── ProtectedRoute.jsx  # Blocks pages that need login
    │   ├── GlobalLoadingBar.jsx# Thin bar at the top during requests
    │   ├── ErrorBoundary.jsx   # Catches React crashes
    │   ├── ThemeToggle.jsx     # Light / Dark / System
    │   ├── AnimatedNumber.jsx  # Counts up to a value
    │   ├── BackToTop.jsx       # Floating "up" button
    │   ├── RiskBadge.jsx       # Colour-coded risk pill
    │   ├── Skeleton.jsx        # Grey loading placeholders
    │   ├── LoadingSpinner.jsx  # Three-dot spinner
    │   └── ScrollToTop.jsx     # Resets scroll on route change
    │
    ├── context/                # Global state (React Context)
    │   ├── AuthContext.jsx     # User, login, register, logout
    │   ├── GuestContext.jsx    # Guest scans stored in the browser
    │   └── ThemeContext.jsx    # Light/dark theme
    │
    ├── services/
    │   ├── api.js              # All backend calls + axios setup
    │   ├── loadingTracker.js   # Counts running requests
    │   └── pdfGenerator.js     # Builds the PDF report
    │
    ├── utils/
    │   ├── feedback.js         # Remembers user feedback per scan
    │   ├── exportExcel.js      # Builds the styled Excel file
    │   ├── formatters.js       # Date/risk formatting helpers
    │   ├── constants.js        # Shared constant values
    │   └── validators.js       # URL / message input checks
    │
    └── styles/
        ├── globals.css         # Colours, spacing, dark theme, spinner
        ├── components.css      # Cards, tables, buttons, footer, auth pages
        └── mobile.css          # Phone/tablet responsive rules
```

---

## 4. How the app works (data flow)

```
User types URL / message
        │
        ▼
validators.js checks the input is valid
        │
        ▼
api.js → POST /scans/url  or  POST /scans/messages
        │                (axios adds Bearer token if logged in)
        ▼
Backend ML model returns a prediction
        │
        ▼
Scanner page renders verdict + reasons + risk badge
        │
        ├──► PDF report (pdfGenerator.js)  → download
        ├──► Feedback saved (feedback.js)   → shown in History
        └──► Guest scans saved to browser   → shown in Dashboard
```

---

## 5. The screens, one by one

| Screen | Path | What the user does |
|---|---|---|
| **Dashboard** | `/` | Sees 4 stat cards (Total Scans, Phishing URLs, Scam Messages, Safe Detections), a 7-day area chart, a pie chart of the split, and the 5 most recent scans. |
| **URL Scanner** | `/url-scan` | Pastes a link, clicks **Scan**, sees the verdict, reasons, risk badge, PDF download, and the feedback buttons. |
| **Message Scanner** | `/message-scan` | Pastes a message, clicks **Analyze**, sees the verdict, the URLs found inside the message (each scanned too), reasons, PDF download, and feedback. |
| **History** | `/history` | Table of all past scans: search, type filter, date filter, view details, download report, delete, and **Export Excel**. Shows a **Feedback** column. |
| **Profile** | `/profile` | Changes first/last name, email, and password. Needs login. |
| **Login / Register** | `/login`, `/register` | Separate pages (not a popup) for signing in and signing up. |
| **404** | any unknown route | Friendly "page not found" screen. |

### Two ways to use it
- **Guest** — no account. Scans are saved in the browser (`localStorage`).
- **User** — logs in. Scans are saved on the server, so they follow the account.

---

## 6. Important files in plain words

| File | What it does |
|---|---|
| `src/App.jsx` | The "table of contents" of the app. Defines every URL → page, wraps everything in the Navbar/Footer, and starts the providers. |
| `src/main.jsx` | Mounts React into the page and loads `globals.css` → `components.css` → `mobile.css` in that order. |
| `src/context/AuthContext.jsx` | Keeps the logged-in user, saves the token in `localStorage`, and sends the user to `/login` if a protected page is opened. |
| `src/context/GuestContext.jsx` | Stores guest scans in the browser and calculates the dashboard numbers (total, phishing, scam, safe, average risk). |
| `src/services/api.js` | One place for every backend call. Adds the `Bearer` token, shows a loading bar, retries failed GET requests twice, and turns errors into friendly messages. |
| `src/services/loadingTracker.js` | Counts how many requests are running so the top progress bar knows when to hide. |
| `src/services/pdfGenerator.js` | Draws the A4 PDF report: title, scan summary, phishing indicators, legitimate indicators, conclusion, page numbers. |
| `src/utils/feedback.js` | Saves "accurate / not accurate" and the user's comment per scan reference, in the browser. |
| `src/utils/exportExcel.js` | Builds a formatted `.xlsx`: banner, header row, zebra stripes, colour-coded cells, auto-filter, column widths. |
| `src/utils/validators.js` | Checks the URL looks like a real link and the message is not empty. |
| `src/styles/globals.css` | Design tokens: colours, spacing, radius, shadows, dark theme, spinner animation, `prefers-reduced-motion` support. |

---

## 7. Backend API used by the frontend

| Method | Endpoint | Used for |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Sign in |
| POST | `/auth/logout` | Sign out |
| PUT | `/auth/profile` | Update name / email |
| PUT | `/auth/change-password` | Change password |
| POST | `/scans/url` | Scan a URL |
| POST | `/scans/messages` | Scan a message |
| GET | `/scans` | Get scan history (optional `?type=url|message`) |
| GET | `/scans/{reference}` | Get one scan (used by the details modal) |
| DELETE | `/scans/{reference}` | Delete a scan |
| GET | `/scans/{reference}/report` | Download the server-side report file |
| GET | `/dashboard/stats` | Dashboard numbers for logged-in users |
| POST | `/feedback` | Send a feedback comment |
| POST | `/feedback/accuracy` | Send "accurate / not accurate" for a scan reference |

The base URL comes from `.env` → `VITE_API_BASE_URL`.

---

## 8. Where data is stored

| Key in `localStorage` | What it holds |
|---|---|
| `accessToken` | JWT of the logged-in user |
| `user` | Name, email, role of the logged-in user |
| `guest_data` | Guest session id + guest scans |
| `scan_feedback` | Feedback given per scan reference (accuracy + comment) |
| `theme` | Chosen theme (light / dark / system) |

---

## 9. How to run it

```bash
npm install       # install packages
npm run dev       # start dev server → http://localhost:5173
npm run build     # production build into dist/
npm run preview   # preview the production build
```

Set the backend address in `.env`:

```
VITE_API_BASE_URL=https://secureshield-backend-1.onrender.com
```

> On Windows PowerShell use `npm.cmd` instead of `npm`.

---

## 10. Good engineering points to mention

1. **One API layer.** All backend calls live in `src/services/api.js`, so the pages
   never touch axios directly.
2. **Error handling that speaks human.** Network errors, timeouts and server errors
   are converted into clear messages, and failed GET requests are retried twice
   (the free hosting tier often returns 502/503 while waking up).
3. **Works with or without an account.** Guests get the full app; their data stays
   in the browser.
4. **Accessible UI.** Skip-to-content link, keyboard-friendly command palette
   (Ctrl/⌘+K), ARIA labels, visible focus, and `prefers-reduced-motion` support.
5. **Light + dark theme** with a system option, remembered between visits.
6. **Real output, not screenshots.** The PDF report and the Excel export are both
   generated in the browser from live data, with proper styling.
7. **Feedback loop.** Every scan can be marked accurate/inaccurate, and the comment
   is shown again in the History table and in the details modal — this is the data
   a future model retraining would need.

---

## 11. Known limitations & future work

**Limitations**
- The AI model runs on the **server**. If the backend is asleep or down, scanning
  fails (the app shows a clear error instead of crashing).
- Guest history lives **only in that browser** — clearing site data deletes it.
- Feedback **comments** are stored locally; only the accuracy flag is linked to the
  server-side scan reference, so comments are not yet attached to the scan on the
  backend.
- The frontend has no automated test suite yet.

**Future work**
- Attach comment feedback to the scan reference on the backend.
- Add unit / integration tests (Vitest + React Testing Library).
- Add a browser extension so links are checked before you open them.
- Add multi-language support and an accessibility audit.

---

## 12. Presentation talking points

**30-second pitch**
> "SecureShield is a web application that detects phishing URLs and scam messages
> using an AI model running on the server. The user pastes a link or a message, and
> within seconds sees the verdict, the reasons behind it, and a downloadable PDF
> report. It works with or without an account, exports the whole history to Excel,
> and collects user feedback so the model can be improved. The frontend is built
> with React and Vite, uses a token-based login, supports light and dark themes,
> and is built to be accessible and mobile-friendly."

**Live demo script (≈2 minutes)**
1. Open **Dashboard** → point at the 4 stat cards and the charts.
2. Go to **URL Scanner**, paste a known phishing link → show the verdict, the
   reasons, the risk badge.
3. Click **Download Report** → open the PDF in front of the audience.
4. Give feedback: click **Accurate / Not accurate** and add a comment.
5. Go to **Message Scanner**, paste a scam SMS → show the extracted URLs and the
   verdict.
6. Go to **History** → show the **Feedback** column, the details modal, and
   **Export Excel** → open the `.xlsx`.
7. Show **Ctrl/⌘+K** command palette and the **dark theme** toggle.
8. Sign in / sign out with a real account to show the protected pages.

**Likely questions**
- *Why React?* Component structure keeps each screen in one file and lets shared
  UI (Navbar, Footer, loading bar) be reused.
- *Why is the model on the server?* One model, shared by all users; the frontend
  stays fast and light; secrets and keys never reach the browser.
- *How do you know the results are correct?* Every scan can be rated, and the
  ratings are stored for evaluation and future retraining.
- *How is user data protected?* Passwords are handled by the backend; the frontend
  only keeps a short-lived JWT token in the browser and never stores passwords.

---

*SecureShield — Team SecureShield*
