<div align="center">

# 💎 SpendPulse — Modern Financial Intelligence & Expense Tracker

**An offline-first, full-featured personal and business expense tracking suite with real-time cash flow analytics, category budgeting, interactive monthly charts, and multi-format financial report exports (PDF, CSV, JSON).**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb.svg)](frontend/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20SQLite-009688.svg)](backend/)
[![Charts](https://img.shields.io/badge/Visualizations-Recharts-8884d8.svg)](https://recharts.org)
[![Offline Ready](https://img.shields.io/badge/Storage-Offline--First%20Ready-10b981.svg)](#-key-features)

</div>

---

## 🌟 Key Features

### 1. 💰 Income & Expense Tracking
- **Dual-Entry System**: Track deposits, salaries, investments, dividends, rent, utilities, food, and miscellaneous outflow.
- **Rich Meta Attributes**: Payment methods (Card, UPI, Bank Transfer, Cash), custom tags, detailed transaction memos, and recurring indicators.
- **Instant Search & Multi-Filter**: Filter by keyword, date presets (Current Month, Last Month, Custom Date Range), category, min/max amount, and sorting order.
- **Bulk Operations**: Multi-select rows to batch delete or export specific records to CSV.

### 2. 🎯 Smart Categories & Category Budgets
- **Pre-Configured Taxonomy**: Pre-loaded with 12+ standard income and expense categories.
- **Custom Category Builder**: Pick custom colors, assign from 25+ icons, and specify category types.
- **Visual Budget Progress**: Set monthly budget caps with live status gauges (**On Track** `<80%`, **Warning** `80-100%`, **Exceeded** `>100%`).
- **Real-Time Notification Banner**: Alerts when any category exceeds its monthly limit.

### 3. 📊 Visual Analytics & Monthly Charts
- **Cash Flow Growth (Area Chart)**: Track monthly income vs expense velocity over 3, 6, and 12-month windows.
- **Expense Proportions (Donut Chart)**: Interactive breakdown of spending by category with percentages and hover tooltips.
- **Day-of-Month Heatmap (Bar Chart)**: Identify which days of the month experience peak financial outflow.
- **Budget vs. Actual Comparison (Bar Chart)**: Side-by-side evaluation of actual spending versus allocated limits.

### 4. 📄 Multi-Format Financial Report Studio
- **1-Click Official PDF Statements**: Client-side compiled financial reports complete with executive summaries, KPI blocks, and itemized transaction tables.
- **CSV Spreadsheet Export**: Formatted for instant import into Microsoft Excel, Google Sheets, and Apple Numbers.
- **JSON Database Backup & Restore**: Full database export and 1-click restore mechanism for cross-device portability.
- **Print Optimization**: Clean, print-ready CSS formatting for paper statement archiving.

### 5. 🌍 Multi-Currency & Dark/Light Themes
- **Global Currencies**: Built-in support for `USD ($)`, `EUR (€)`, `GBP (£)`, `INR (₹)`, `JPY (¥)`, `CAD (CA$)`, `AUD (AU$)`, and `SGD (S$)`.
- **Modern Design System**: Dark Slate and Clean Light themes with accessible contrast and smooth micro-animations.
- **Realistic 4-Month Sample Dataset**: Pre-populated with realistic demo data so you can test all features right out of the box.

---

## 🏗 Repository Structure

```
spendpulse/
│
├── frontend/                     # React 18 + Vite Web Application
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # CategoryIcon & UI helper widgets
│   │   │   ├── layout/           # Sidebar, Header, and DashboardLayout
│   │   │   └── modals/           # TransactionModal & CategoryModal
│   │   ├── context/              # ExpenseContext (State & calculation engine)
│   │   ├── pages/                # Overview, Transactions, Analytics, Budgets, Reports, Settings
│   │   ├── App.jsx               # Route definitions
│   │   ├── main.jsx              # App mounting & context provider
│   │   └── index.css             # Modern design system & CSS tokens
│   ├── index.html                # Entry HTML with meta & typography
│   ├── package.json              # Frontend dependencies & scripts
│   └── vite.config.js            # Vite build configuration
│
├── backend/                      # Python FastAPI REST API (Optional sync)
│   ├── app/
│   │   ├── routers/              # Transactions, Categories, Analytics, Reports API
│   │   ├── database.py           # SQLite connection & session maker
│   │   ├── models.py             # SQLAlchemy database models
│   │   ├── schemas.py            # Pydantic validation schemas
│   │   └── main.py               # FastAPI application entry point
│   └── requirements.txt          # Python dependencies
│
├── docs/                         # System Documentation
│   ├── ARCHITECTURE.md           # System design & data flow diagrams
│   ├── USER_GUIDE.md             # Complete step-by-step user manual
│   ├── API_REFERENCE.md          # REST API endpoints & schemas
│   └── DEPLOYMENT.md             # Vercel, Netlify, and Docker deployment guide
│
├── .github/workflows/            # CI/CD Workflows
│   └── ci.yml                    # Automated build & lint pipeline
│
├── .gitignore                    # Git ignore rules for Node & Python
├── LICENSE                       # Open-Source MIT License
└── README.md                     # Project documentation
```

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**
- **Python**: 3.9+ (optional for backend API)

---

### 1. Launching the Frontend Application

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser at **`http://localhost:3000`** (or the port specified by Vite).

To build the production bundle:
```bash
npm run build
```

---

### 2. Launching the Optional Backend REST API

```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment (optional)
python3 -m venv venv
source venv/bin/activate    # On Windows use: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive Swagger UI Docs: `http://localhost:8000/docs`

---

## 📊 Analytics & Reporting Overview

| Module | Features & Capabilities |
|---|---|
| **Overview Dashboard** | Real-time Net Balance, Income, Expenses, Savings Rate %, Quick Add Bar, Cash Flow Preview, Category Donut, Recent Transactions table. |
| **Transactions Ledger** | Search keyword filter, category dropdown, type toggle, custom date pickers, column sorting, pagination, duplicate record, bulk delete/export. |
| **Analytics & Charts** | Area Cash Flow charts, Category Donut chart, Day-of-Month Outflow Heatmap, Budget vs Actual comparison bars, MoM metrics. |
| **Budgets & Limits** | Overall budget health gauge, category spending targets, progress bars with 80% warning & 100% over-budget threshold alerts. |
| **Report Studio** | Live statement preview, 1-click formatted PDF download, CSV export, raw JSON database backup & restore. |
| **Settings & Storage** | Multi-currency selector, Dark/Light mode toggle, load realistic sample data, wipe database, storage telemetry diagnostics. |

---

## 🛡 Data Privacy & Security

- **Offline-First Security**: All transactions are stored locally in your browser's encrypted sandbox storage by default. No financial data is sent to untrusted 3rd-party servers without your explicit configuration.
- **Self-Hostable**: The optional backend runs completely standalone on your own server or private cloud with SQLite / PostgreSQL.

---

## 🤝 Contributing

Contributions, issues, and feature suggestions are always welcome!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
