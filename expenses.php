<?php
$pageTitle = 'Manage Expenses';
$pageSubtitle = 'Search, filter, edit, and organize all your expense records';
$pageScript = 'assets/js/expenses.js';

require_once __DIR__ . '/includes/header.php';
?>

<!-- Filter & Search Toolbar -->
<div class="card animate-fadeInUp delay-1" style="margin-bottom: 24px; padding: 20px;">
  <div class="filter-bar">
    <div class="filter-left">
      <!-- Search Input -->
      <div class="search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="filter-search" placeholder="Search by title or note...">
      </div>

      <!-- Category Filter -->
      <select id="filter-category" class="custom-select">
        <option value="">All Categories</option>
        <option value="1">🍽️ Food & Dining</option>
        <option value="2">🚗 Transportation</option>
        <option value="3">🛍️ Shopping</option>
        <option value="4">💡 Bills & Utilities</option>
        <option value="5">🎬 Entertainment</option>
        <option value="6">💊 Health & Fitness</option>
        <option value="7">🎓 Education</option>
        <option value="8">🛒 Groceries</option>
        <option value="9">📦 Other</option>
      </select>

      <!-- Payment Method Filter -->
      <select id="filter-payment" class="custom-select">
        <option value="all">All Payment Methods</option>
        <option value="UPI">UPI / QR</option>
        <option value="Credit Card">Credit Card</option>
        <option value="Debit Card">Debit Card</option>
        <option value="Cash">Cash</option>
        <option value="Net Banking">Net Banking</option>
      </select>

      <!-- Period Filter Chips -->
      <div class="period-chips">
        <button class="chip-btn filter-period-chip active" data-period="all">All Time</button>
        <button class="chip-btn filter-period-chip" data-period="today">Today</button>
        <button class="chip-btn filter-period-chip" data-period="this_week">This Week</button>
        <button class="chip-btn filter-period-chip" data-period="this_month">This Month</button>
      </div>
    </div>

    <!-- Right Controls: Sort & Export -->
    <div style="display: flex; align-items: center; gap: 10px;">
      <select id="filter-sort" class="custom-select">
        <option value="expense_date:DESC">Newest Date First</option>
        <option value="expense_date:ASC">Oldest Date First</option>
        <option value="amount:DESC">Amount: High to Low</option>
        <option value="amount:ASC">Amount: Low to High</option>
      </select>

      <button class="btn btn-secondary" id="export-expenses-csv-btn" title="Download filtered expenses in CSV format">
        <i class="fa-solid fa-file-csv"></i>
        <span>Export CSV</span>
      </button>

      <button class="btn btn-primary open-add-expense-modal btn-interactive">
        <i class="fa-solid fa-plus"></i>
        <span>Add Expense</span>
      </button>
    </div>
  </div>

  <!-- Filter Summary Bar -->
  <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid var(--border-light); font-size: 0.84rem;">
    <span style="color: var(--text-muted);">
      Showing: <strong id="filtered-count" style="color: var(--text-primary);">0 expenses</strong>
    </span>
    <span style="color: var(--text-muted);">
      Filtered Total: <strong id="filtered-sum" style="color: var(--accent-primary); font-family: 'Outfit', sans-serif; font-size: 1rem;">₹ 0.00</strong>
    </span>
  </div>
</div>

<!-- Transactions Table Card -->
<div class="card animate-fadeInUp delay-2">
  <div class="table-responsive">
    <table class="modern-table">
      <thead>
        <tr>
          <th>Description & Note</th>
          <th>Category</th>
          <th>Payment Method</th>
          <th>Date</th>
          <th>Amount</th>
          <th style="text-align: right;">Actions</th>
        </tr>
      </thead>
      <tbody id="expenses-table-body">
        <!-- Populated via expenses.js -->
      </tbody>
    </table>
  </div>

  <!-- Pagination Controls -->
  <div id="pagination-container">
    <!-- Populated via expenses.js -->
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

