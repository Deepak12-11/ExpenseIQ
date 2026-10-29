<?php
$pageTitle = 'Monthly Reports & Analytics';
$pageSubtitle = 'Comprehensive breakdown, category distribution, and printable financial statements';
$pageScript = 'assets/js/reports.js';

require_once __DIR__ . '/includes/header.php';
?>

<!-- Report Period Header & Controls -->
<div class="card animate-fadeInUp delay-1" style="margin-bottom: 24px; padding: 20px;">
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
    <div style="display: flex; align-items: center; gap: 14px;">
      <div class="brand-icon" style="width: 44px; height: 44px;">
        <i class="fa-solid fa-file-invoice"></i>
      </div>
      <div>
        <h3 id="report-period-title" style="font-size: 1.25rem;">Financial Summary</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted);" id="report-comparison-stat">
          Loading comparison data...
        </p>
      </div>
    </div>

    <!-- Month Picker and Export Actions -->
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <!-- Month Dropdown -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <label for="report-month-select" style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);">Period:</label>
        <select id="report-month-select" class="custom-select" style="font-weight: 600;">
          <!-- Populated via reports.js -->
        </select>
      </div>

      <!-- Export to CSV -->
      <button class="btn btn-secondary btn-interactive" id="export-report-csv-btn">
        <i class="fa-solid fa-file-arrow-down"></i>
        <span>Export CSV</span>
      </button>

      <!-- Print / PDF -->
      <button class="btn btn-primary btn-interactive" id="print-report-btn">
        <i class="fa-solid fa-print"></i>
        <span>Print / PDF</span>
      </button>
    </div>
  </div>
</div>

<!-- Monthly Metric Cards -->
<div class="dashboard-grid">
  <!-- Total Spent -->
  <div class="card kpi-card card-hover animate-fadeInUp delay-2">
    <div class="kpi-header">
      <span class="kpi-title">Monthly Total Spend</span>
      <div class="kpi-icon-wrap icon-purple">
        <i class="fa-solid fa-receipt"></i>
      </div>
    </div>
    <div class="kpi-value" id="report-total-spent">₹ 0.00</div>
    <div class="kpi-footer" style="color: var(--text-muted); font-size: 0.78rem;">
      Total outflow for selected month
    </div>
  </div>

  <!-- Total Transactions -->
  <div class="card kpi-card card-hover animate-fadeInUp delay-3">
    <div class="kpi-header">
      <span class="kpi-title">Transaction Volume</span>
      <div class="kpi-icon-wrap icon-green">
        <i class="fa-solid fa-arrow-down-up-across-line"></i>
      </div>
    </div>
    <div class="kpi-value" id="report-total-count">0 items</div>
    <div class="kpi-footer" style="color: var(--text-muted); font-size: 0.78rem;">
      Total expense entries
    </div>
  </div>

  <!-- Daily Average -->
  <div class="card kpi-card card-hover animate-fadeInUp delay-4">
    <div class="kpi-header">
      <span class="kpi-title">Daily Average Spend</span>
      <div class="kpi-icon-wrap icon-amber">
        <i class="fa-solid fa-calculator"></i>
      </div>
    </div>
    <div class="kpi-value" id="report-daily-avg">₹ 0.00</div>
    <div class="kpi-footer" style="color: var(--text-muted); font-size: 0.78rem;">
      Per day average consumption
    </div>
  </div>

  <!-- Max Expense -->
  <div class="card kpi-card card-hover animate-fadeInUp delay-5">
    <div class="kpi-header">
      <span class="kpi-title">Peak Transaction</span>
      <div class="kpi-icon-wrap icon-cyan">
        <i class="fa-solid fa-tag"></i>
      </div>
    </div>
    <div class="kpi-value" id="report-max-expense">₹ 0.00</div>
    <div class="kpi-footer" style="color: var(--text-muted); font-size: 0.78rem;">
      Single largest item
    </div>
  </div>
</div>

<!-- Visualizations Row -->
<div class="charts-grid-2">
  <!-- Daily Spending Timeline (Bar Chart) -->
  <div class="card animate-fadeInUp delay-4">
    <div class="card-header-flex">
      <div class="card-title-group">
        <h3>Daily Expense Timeline</h3>
        <p>Day-by-day distribution for the selected month</p>
      </div>
      <span class="badge badge-outline">Daily Bar Chart</span>
    </div>
    <div class="chart-container" style="min-height: 280px;">
      <canvas id="reportDailyChart"></canvas>
    </div>
  </div>

  <!-- Visual Breakdowns: Category & Payment Method -->
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <!-- Category Pie Chart -->
    <div class="card animate-fadeInUp delay-5">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>Category Distribution</h3>
          <p>Share of wallet across categories</p>
        </div>
      </div>
      <div class="chart-container" style="min-height: 200px; max-height: 210px;">
        <canvas id="reportCategoryChart"></canvas>
      </div>
    </div>

    <!-- Payment Method Doughnut Chart -->
    <div class="card animate-fadeInUp delay-6">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>Payment Channels</h3>
          <p>Spending by payment mode</p>
        </div>
      </div>
      <div class="chart-container" style="min-height: 180px; max-height: 190px;">
        <canvas id="reportPaymentChart"></canvas>
      </div>
    </div>
  </div>
</div>

<!-- Category Breakdown Table -->
<div class="card animate-fadeInUp delay-6">
  <div class="card-header-flex">
    <div class="card-title-group">
      <h3>Detailed Category Breakdown</h3>
      <p>Itemized statistics and budget compliance by category</p>
    </div>
  </div>

  <div class="table-responsive">
    <table class="modern-table">
      <thead>
        <tr>
          <th>Category Name</th>
          <th>Transactions</th>
          <th>Total Spent</th>
          <th>Share of Total</th>
          <th style="text-align: right;">Status</th>
        </tr>
      </thead>
      <tbody id="report-category-tbody">
        <!-- Populated via reports.js -->
      </tbody>
    </table>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>

