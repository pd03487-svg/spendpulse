# 📡 SpendPulse REST API Reference

SpendPulse includes an optional high-performance **FastAPI REST API** backend for multi-device sync, database persistence, and automated financial integrations.

Base URL (Local Development): `http://localhost:8000`  
Interactive Swagger UI Docs: `http://localhost:8000/docs`  
ReDoc Documentation: `http://localhost:8000/redoc`

---

## Endpoints Overview

### 1. Transactions (`/api/transactions`)

#### `GET /api/transactions`
Retrieve all transactions with optional query filters.

**Query Parameters:**
- `type` (optional, string): `'income'` or `'expense'`
- `category_id` (optional, string): Filter by specific category ID
- `start_date` (optional, string): Minimum date `YYYY-MM-DD`
- `end_date` (optional, string): Maximum date `YYYY-MM-DD`
- `search` (optional, string): Keyword substring search in title, tags, and notes

**Sample Response:**
```json
[
  {
    "id": "tx_1723984812_a8b9",
    "title": "Supermarket Pantry",
    "amount": 142.50,
    "type": "expense",
    "category_id": "cat_groceries",
    "date": "2026-08-15",
    "payment_method": "Credit Card",
    "tags": ["Food", "Essentials"],
    "notes": "Weekly grocery run",
    "recurring": false,
    "created_at": "2026-08-15T10:30:00Z"
  }
]
```

#### `POST /api/transactions`
Create a new income or expense transaction.

**Request Payload:**
```json
{
  "title": "Freelance Design Deliverable",
  "amount": 950.00,
  "type": "income",
  "category_id": "cat_freelance",
  "date": "2026-08-18",
  "payment_method": "Bank Transfer",
  "tags": ["Client", "Design"],
  "notes": "Milestone #2 complete",
  "recurring": false
}
```

#### `PUT /api/transactions/{id}`
Update an existing transaction by ID.

#### `DELETE /api/transactions/{id}`
Delete a transaction by ID.

#### `POST /api/transactions/batch-delete`
Delete multiple transactions in one atomic request.

**Request Payload:**
```json
["tx_1723984812_a8b9", "tx_1723984920_c4d2"]
```

---

### 2. Categories (`/api/categories`)

#### `GET /api/categories`
List all income and expense categories (auto-seeds defaults if initial start).

#### `POST /api/categories`
Create a custom category.

**Request Payload:**
```json
{
  "name": "Cloud Subscriptions",
  "type": "expense",
  "icon": "Repeat",
  "color": "#d946ef",
  "budget": 120.00
}
```

#### `PUT /api/categories/{id}`
Update category details or adjust budget limit.

#### `DELETE /api/categories/{id}`
Delete a custom category.

---

### 3. Analytics (`/api/analytics`)

#### `GET /api/analytics/summary`
Get high-level financial summary KPIs.

**Sample Response:**
```json
{
  "total_income": 6250.00,
  "total_expense": 2840.50,
  "net_balance": 3409.50,
  "savings_rate": 54.55,
  "transaction_count": 48
}
```

#### `GET /api/analytics/monthly`
Get aggregated monthly breakdown data for charting.

---

### 4. Reports & Backups (`/api/reports`)

#### `GET /api/reports/csv`
Download a formatted CSV attachment containing all recorded transactions.

#### `GET /api/reports/backup`
Download a complete JSON database dump for backup.
