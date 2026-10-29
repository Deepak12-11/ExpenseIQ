<?php
$pageTitle = 'Executive Dashboard';
$pageSubtitle = 'Real-time financial analytics, smart budgeting, and expense control';
$pageScript = 'assets/js/dashboard.js';

require_once __DIR__ . '/includes/header.php';
?>

<!-- 1. Executive Budget Health & Intelligence Hero -->
<div class="budget-hero-card animate-fadeInUp delay-1">
  <div class="budget-hero-header">
    <div style="display: flex; align-items: center; gap: 14px;">
      <div class="brand-icon" style="background: linear-gradient(135deg, #10b981, #06b6d4);">
        <i class="fa-solid fa-chart-line"></i>
      </div>
      <div>
        <h3 style="font-size: 1.28rem; margin-bottom: 2px;">Monthly Budget Health</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">
          Auto-adjusting financial ceiling & burn rate tracker
        </p>
      </div>
    </div>

    <!-- Quick Action to customize total budget & auto-allocate -->
    <div style="display: flex; align-items: center; gap: 10px;">
      <span class="badge" id="hero-utilization-pct" style="background: rgba(99, 102, 241, 0.2); color: #818cf8; font-size: 0.82rem; padding: 6px 12px;">
        0% utilized
      </span>
      <button class="btn btn-primary btn-sm open-smart-budget-modal btn-interactive">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        <span>Configure Budget</span>
      </button>
    </div>
  </div>

  <!-- Overall Progress Bar -->
  <div class="progress-track" style="height: 10px; margin-bottom: 12px;">
    <div class="progress-bar-fill progress-success" id="hero-progress-bar" style="width: 0%;"></div>
  </div>

  <!-- Four Key Health Metrics -->
  <div class="hero-stats-row">
    <div class="hero-stat-box">
      <span class="hero-stat-label">Total Monthly Budget</span>
      <span class="hero-stat-val" id="hero-total-budget">₹ 0.00</span>
    </div>
    <div class="hero-stat-box">
      <span class="hero-stat-label">Total Outflow (Spent)</span>
      <span class="hero-stat-val" id="hero-total-spent">₹ 0.00</span>
    </div>
    <div class="hero-stat-box">
      <span class="hero-stat-label">Remaining Buffer</span>
      <span class="hero-stat-val" id="hero-remaining-budget" style="color: var(--success);">₹ 0.00</span>
    </div>
    <div class="hero-stat-box">
      <span class="hero-stat-label">Safe Daily Spending Cap</span>
      <span class="hero-stat-val" id="hero-safe-daily" style="color: #38bdf8;">₹ 0.00/day</span>
    </div>
  </div>
</div>

<!-- 2. KPI Summary Cards -->
<div class="dashboard-grid">
  <!-- Monthly Outflow -->
  <div class="card kpi-card card-hover animate-fadeInUp delay-2">
    <div>
      <div class="kpi-header">
        <span class="kpi-title">Spent This Month</span>
        <div class="kpi-icon-wrap icon-purple">
          <i class="fa-solid fa-wallet"></i>
        </div>
      </div>
      <div class="kpi-value" id="kpi-month-total">₹ 0.00</div>
    </div>
    <div class="kpi-footer">
      <span class="badge-trend trend-neutral" id="kpi-month-trend">
        <i class="fa-solid fa-spinner fa-spin"></i> Calculating trend...
      </span>
    </div>
  </div>

  <!-- Today's Expenses -->
  <div class="card kpi-card card-hover animate-fadeInUp delay-3">
    <div>
      <div class="kpi-header">
        <span class="kpi-title">Today's Expenses</span>
        <div class="kpi-icon-wrap icon-green">
          <i class="fa-solid fa-calendar-day"></i>
        </div>
      </div>
      <div class="kpi-value" id="kpi-today-total">₹ 0.00</div>
    </div>
    <div class="kpi-footer">
      <span style="color: var(--text-muted); font-size: 0.78rem;">
        <i class="fa-regular fa-clock"></i> Live calculations
      </span>
    </div>
  </div>

  <!-- Daily Average -->
  <div class="card kpi-card card-hover animate-fadeInUp delay-4">
    <div>
      <div class="kpi-header">
        <span class="kpi-title">Daily Average Spend</span>
        <div class="kpi-icon-wrap icon-amber">
          <i class="fa-solid fa-chart-line"></i>
        </div>
      </div>
      <div class="kpi-value" id="kpi-daily-avg">₹ 0.00</div>
    </div>
    <div class="kpi-footer">
      <span style="color: var(--text-muted); font-size: 0.78rem;">
        Based on active days
      </span>
    </div>
  </div>

  <!-- Highest Single Expense -->
  <div class="card kpi-card card-hover animate-fadeInUp delay-5">
    <div>
      <div class="kpi-header">
        <span class="kpi-title">Peak Transaction</span>
        <div class="kpi-icon-wrap icon-cyan">
          <i class="fa-solid fa-arrow-trend-up"></i>
        </div>
      </div>
      <div class="kpi-value" id="kpi-highest-expense">₹ 0.00</div>
    </div>
    <div class="kpi-footer">
      <span style="color: var(--text-muted); font-size: 0.78rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" id="kpi-highest-title">
        Largest single expense
      </span>
    </div>
  </div>
</div>

<!-- 3. Charts Row: Daily Spending Trajectory & Category Distribution -->
<div class="charts-grid-2">
  <div class="card animate-fadeInUp delay-3">
    <div class="card-header-flex">
      <div class="card-title-group">
        <h3>Daily Spending Trend</h3>
        <p>Curved trajectory throughout the current month</p>
      </div>
      <span class="badge badge-outline">
        <i class="fa-solid fa-chart-area"></i> Active Month
      </span>
    </div>
    <div class="chart-container">
      <canvas id="dailyTrendChart"></canvas>
    </div>
  </div>

  <div class="card animate-fadeInUp delay-4">
    <div class="card-header-flex">
      <div class="card-title-group">
        <h3>Category Allocation</h3>
        <p>Spending share across categories</p>
      </div>
      <a href="reports.php" class="btn btn-secondary btn-sm" style="font-size: 0.78rem; padding: 4px 10px;">
        Detailed Report
      </a>
    </div>
    <div class="chart-container" style="min-height: 200px; max-height: 210px;">
      <canvas id="categoryDoughnutChart"></canvas>
    </div>
    <div class="category-summary-list" id="category-legend-list"></div>
  </div>
</div>

<!-- 4. Bottom Row: Recent Transactions & Monthly History -->
<div class="charts-grid-2">
  <div class="card animate-fadeInUp delay-5">
    <div class="card-header-flex">
      <div class="card-title-group">
        <h3>Recent Transactions</h3>
        <p>Latest recorded spending items</p>
      </div>
      <a href="expenses.php" class="btn btn-secondary btn-sm">
        <span>View All</span>
        <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>

    <div class="table-responsive">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Expense</th>
            <th>Method</th>
            <th>Date</th>
            <th>Amount</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody id="recent-transactions-tbody"></tbody>
      </table>
    </div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 24px;">
    <!-- Monthly Trend History -->
    <div class="card animate-fadeInUp delay-5">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>Monthly Trend Comparison</h3>
          <p>Spending history over the past 6 months</p>
        </div>
      </div>
      <div class="chart-container" style="min-height: 180px; max-height: 190px;">
        <canvas id="monthlyHistoryChart"></canvas>
      </div>
    </div>

    <!-- Category Budget Snapshot -->
    <div class="card animate-fadeInUp delay-6">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>Category Limits Snapshot</h3>
          <p>Monthly cap progress per category</p>
        </div>
        <a href="budgets.php" class="btn btn-secondary btn-sm" style="font-size: 0.78rem; padding: 4px 10px;">
          Manage
        </a>
      </div>
      <div id="dashboard-budget-list"></div>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
