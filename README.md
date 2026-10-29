# ExpenseIQ - Personal Expense Tracker & Smart Budget Planner 📊💰

An executive, fully-responsive, full-stack **Personal Expense Tracker & Smart Budget Planner** built with **HTML5, CSS3, JavaScript (ES6+), PHP, and MySQL**. Features an executive FinTech interface, smooth micro-animations, interactive **Chart.js** visualizations, an auto-calculating **Smart Budget Planner**, multi-device responsiveness (Mobile, Tablet, Laptop, Desktop), and strict **Data Leakage & Security Hardening**.

---

## 🌟 Key Highlights & New Capabilities

### 1. 🎯 Smart Budget Planner & Auto-Allocation Engine (New Feature)
- **Total Budget Entry**: The user can enter their **Total Monthly Budget / Income** (e.g. ₹30,000).
- **Rule-Based Financial Allocation**:
  - **50 / 30 / 20 Rule**: 50% Needs & Utilities, 30% Dining & Leisure, 20% Savings & Education.
  - **College Student Plan**: Custom weighting focusing on Groceries, Commute, Books & Study.
  - **Aggressive Saver Plan**: Strict caps on shopping and luxury to maximize monthly capital growth.
- **Auto-Distribution**: Automatically calculates and distributes spending ceilings across all 9 categories with 1 click.
- **Budget Health & Intelligence Hero**: Real-time dashboard meter tracking total outflow, remaining buffer, burn rate, and **Safe Daily Spending Limit** (`Remaining ÷ Days Left`).

### 2. 📱 Multi-Device Responsiveness (Laptops, Tablets, and Mobile Phones)
- **Fluid Layout**: Adapts from 4-column executive cards on wide laptop monitors to 2-column cards on tablets and 1-column cards on smartphones.
- **Mobile Bottom Navigation Bar**: Native app-like thumb-friendly bottom bar on mobile screens (Overview, Expenses, Center Plus CTA, Budgets, Reports).
- **Off-Canvas Drawer & Backdrop**: Smooth sliding sidebar with blurred backdrop overlay on touch devices.
- **Touch-Friendly Controls**: Minimum 44px touch targets, horizontally scrollable data tables, and fluid modals.

### 3. 🔒 Enterprise Security & Data Privacy (Preventing Data Leaks)
- **User Data Isolation**: Every transaction and budget record is strictly bound to `user_id`. Queries always enforce `WHERE user_id = ?`, ensuring no cross-user data leakage.
- **SQL Injection Elimination**: 100% of SQL statements in `api/*.php` utilize PDO prepared statements with native emulation disabled (`ATTR_EMULATE_PREPARES => false`).
- **CSRF Defense**: Cryptographic token generation (`getCsrfToken()`) and session verification for mutations.
- **Secure Session Headers**:
  - `cookie_httponly = true` (blocks JavaScript cookie harvesting)
  - `cookie_samesite = 'Lax'` (mitigates Cross-Site Request Forgery)
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
  - `X-XSS-Protection: 1; mode=block`
- **Apache Hardening (`.htaccess`)**: Direct access to `database.sql`, `.env`, and `config/` is strictly forbidden (`403 Forbidden`). Directory indexing is disabled (`Options -Indexes`).

### 4. 📈 Interactive Visualizations (Chart.js)
- **Category Doughnut Chart**: Interactive percentage share and spending distribution.
- **Daily Spline Curve**: Smooth gradient area chart charting daily spending throughout the active month.
- **6-Month Trend Bar Chart**: Historic monthly comparisons.
- **Payment Method Distribution**: Spending grouped across UPI, Credit Card, Debit Card, Cash, and Net Banking.

### 5. 📑 Monthly Statements & Exports
- **Date Selector**: Switch between historical months with a single dropdown.
- **One-Click CSV Export**: Formatted download of monthly transactions.
- **Print / PDF Ready**: Dedicated `@media print` CSS layout for clean printed executive statements.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies Used | Description |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, CSS3, Modern CSS Grid & Flexbox | Executive FinTech Dark & Light theme with Glassmorphism, animations, and mobile bottom navigation. |
| **Typography & Icons**| Google Fonts (*Outfit*, *Plus Jakarta Sans*), FontAwesome 6 | Crisp vector icons and modern typography. |
| **Client Scripting** | JavaScript (ES6+), Fetch API, Chart.js 4.4 | Real-time DOM updates, animated number counters, smart allocation calculator, and local storage fallback. |
| **Backend API** | PHP 7.4+ / 8.x (PDO) | User-scoped RESTful endpoints with prepared statements and CSRF verification. |
| **Database** | MySQL / MariaDB | Normalized schema with foreign key constraints, cascading deletes, and user data isolation. |
| **Security Layer** | PHP Session Hardening, HTTP Security Headers, `.htaccess` | Complete data leakage prevention and access control. |

---

## 📁 Directory Structure

```
expense-tracker/
├── index.php                 # Executive Dashboard (Budget Hero, KPIs, Charts, Recent Items)
├── expenses.php              # Full Expense List with Live Debounce Filter & CSV Export
├── budgets.php               # Budget Planner & Category Spending Caps
├── reports.php               # Monthly Financial Reports, Visualizations & Print/PDF
├── demo.html                 # Standalone Browser Preview (Instant Testing without MySQL)
├── database.sql              # Hardened MySQL Database Schema + Starter Data
├── .htaccess                 # Apache Access Control, Security Headers & Folder Protection
├── config/
│   ├── security.php          # Session Hardening, CSRF Tokens & Data Isolation Helpers
│   └── db.php                # Secure PDO Connection & Error Logging
├── api/
│   ├── expenses.php          # Scoped REST API for Expenses CRUD
│   ├── budgets.php           # Smart Total Budget & Category Allocations Endpoint
│   ├── reports.php           # Aggregated Monthly Analytics & Trends
│   └── categories.php        # Category Metadata & Colors
├── assets/
│   ├── css/
│   │   ├── style.css         # FinTech Styles, Mobile Bottom Nav, Responsive Rules
│   │   └── animations.css    # Keyframe Animations, Stagger Delays & Transitions
│   └── js/
│       ├── main.js           # Theme, Toasts, Modals & Smart Budget Allocation Engine
│       ├── dashboard.js      # Hero Budget Meter, Chart.js & Counters
│       ├── expenses.js       # Live Filter, Pagination & CSV Export
│       ├── reports.js        # Monthly Report Generator & Print Layout
│       └── budgets.js        # Budget Grid & Category Cap Editor
└── includes/
    ├── header.php            # Mobile-Ready Header, Sidebar & Security Meta
    └── footer.php            # Smart Budget Modal, Add Modal, Mobile Bottom Nav
```

---

## 🚀 How to Run the Application

### Option 1: Instant Browser Preview (Zero Setup Required)
- Double click **`demo.html`** or right click and select **Open with Live Server / Google Chrome / Edge**.
- Tests the entire UI, responsive mobile layout, Dark/Light mode toggle, interactive Chart.js charts, and the **Smart Budget Auto-Planner** directly in your browser.

### Option 2: Full PHP & MySQL Setup (Using XAMPP, WAMP, or Laragon)
1. **Start Apache & MySQL** in your XAMPP Control Panel.
2. Open `http://localhost/phpmyadmin` in your browser.
3. Click the **Import** tab, select `database.sql`, and click **Go**.
4. Copy/move this folder into your web root (e.g. `C:\xampp\htdocs\expense-tracker`).
5. Open your browser and navigate to:
   ```
   http://localhost/expense-tracker
   ```
