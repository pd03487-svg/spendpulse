# 🏗 SpendPulse Architecture & System Blueprint

SpendPulse is engineered as a modern, high-performance personal & enterprise financial intelligence platform. It features an **offline-first hybrid architecture** that provides zero-latency client reactivity alongside optional REST API persistence.

---

## 1. High-Level Architecture Diagram

```
+-------------------------------------------------------------------------------+
|                             CLIENT / USER BROWSER                             |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                           React 18 SPA Layer                            |  |
|  |  +------------------+  +-------------------+  +----------------------+  |  |
|  |  |  Dashboard Page  |  | Transactions Page |  |   Analytics Page     |  |  |
|  |  +------------------+  +-------------------+  +----------------------+  |  |
|  |  |   Budgets Page   |  |   Reports Studio  |  |   Settings Page      |  |  |
|  |  +------------------+  +-------------------+  +----------------------+  |  |
|  +-------------------------------------------------------------------------+  |
|                                      │                                        |
|  +-----------------------------------▼-------------------------------------+  |
|  |                     ExpenseContext (State Engine)                       |  |
|  |  - Real-time Balance & Savings Rate Calculations                        |  |
|  |  - Categorization & Budget Limit Threshold Watcher                      |  |
|  |  - Multi-Currency & Locale Formatter (USD, EUR, GBP, INR, JPY, etc.)     |  |
|  |  - Recharts Visual Data Aggregators                                     |  |
|  |  - jsPDF / AutoTable Client PDF Rendering Engine                        |  |
|  |  - CSV & JSON Backup Serializer                                         |  |
|  +-------------------------------------------------------------------------+  |
|                                      │                                        |
|  +-----------------------------------▼-------------------------------------+  |
|  |                   Local Persistence (localStorage)                      |  |
|  |  - Instant offline availability with automatic schema migration        |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
                                       │ (Optional REST Sync)
                                       ▼
+-------------------------------------------------------------------------------+
|                              BACKEND REST SERVICE                             |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                           FastAPI REST API                              |  |
|  |  - /api/transactions  (CRUD, batch operations, multi-filter query)       |  |
|  |  - /api/categories    (Income & expense taxonomy, budget allocations)   |  |
|  |  - /api/analytics     (Monthly rollups, KPIs, spending velocity)        |  |
|  |  - /api/reports       (Server-side CSV exports, JSON DB backups)        |  |
|  +-------------------------------------------------------------------------+  |
|                                      │                                        |
|  +-----------------------------------▼-------------------------------------+  |
|  |                       SQLAlchemy ORM + SQLite / PostgreSQL              |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

---

## 2. Component Hierarchy & Flow

- **Root Container (`App.jsx`)**:
  - Encapsulated by `ExpenseProvider` and React Router `BrowserRouter`.
  - Defines routes (`/dashboard`, `/transactions`, `/analytics`, `/budgets`, `/reports`, `/settings`).
- **Dashboard Layout (`DashboardLayout.jsx`)**:
  - **Sidebar**: Responsive side navigation with collapsed mode, budget warning counter, and global quick-add CTA.
  - **Header**: Active currency switcher, theme mode toggle (Dark/Light), budget notification drawer, and page metadata.
  - **Global Modals**: `TransactionModal` (Add/Edit) and `CategoryModal` (Add/Edit) accessible from any view.

---

## 3. Data Schema & Model Definitions

### Transaction Entity
| Field | Type | Description |
|---|---|---|
| `id` | String | Unique UUID or timestamp key (e.g. `tx_1723984812_a8b9`) |
| `title` | String | Description / Merchant / Source |
| `amount` | Float | Absolute numeric transaction value |
| `type` | Enum | `'income'` or `'expense'` |
| `categoryId` | String | Reference to category ID |
| `date` | String | ISO date `YYYY-MM-DD` |
| `paymentMethod`| String | Method used (Bank Transfer, Credit Card, UPI, Cash, etc.) |
| `tags` | Array[String]| Searchable labels (e.g. `['Work', 'Tax', 'Subscription']`) |
| `notes` | String | Additional context, invoice notes, or receipts |
| `recurring` | Boolean | True if recurring monthly bill/salary |

### Category Entity
| Field | Type | Description |
|---|---|---|
| `id` | String | Unique ID (e.g. `cat_housing`, `cat_salary`) |
| `name` | String | Display name |
| `type` | Enum | `'income'` or `'expense'` |
| `icon` | String | Lucide icon identifier |
| `color` | String | Hex color accent code |
| `budget` | Float | Monthly budget limit (0 for unlimited/income) |

---

## 4. Key Architectural Pillars

1. **Deterministic State Aggregations**:
   - Monthly and category aggregations are calculated using memoized selectors (`useMemo`) to prevent redundant CPU cycles.
2. **Offline-First Zero-Latency**:
   - All state mutations immediately update the UI and commit to local storage, ensuring the app is 100% usable without an active internet connection.
3. **Client-Side Document Compilation**:
   - PDF financial statements and CSV files are synthesized natively in the browser via `jspdf` and binary `Blob` streams without sending sensitive financial data to 3rd-party servers.
4. **Accessible Design System**:
   - Pure CSS variables token system supporting instant Dark/Light theme switching with high-contrast color palettes.
