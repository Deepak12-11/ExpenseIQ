<?php
/**
 * Common Header Template - Modern FinTech & Executive Dashboard
 * Personal Expense Tracker
 */
require_once __DIR__ . '/../config/db.php';

$currentPage = basename($_SERVER['PHP_SELF']);
$dbConnected = isDatabaseConnected();
$csrfToken = getCsrfToken();
?>
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
  <meta name="description" content="Personal Expense Tracker - Full stack budgeting and analytics web app">
  <meta name="theme-color" content="#0a0e1a">
  <title><?php echo isset($pageTitle) ? htmlspecialchars($pageTitle) . ' - ' : ''; ?>ExpenseIQ - Smart Personal Finance</title>

  <!-- Google Fonts: Plus Jakarta Sans & Outfit -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Font Awesome 6 Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

  <!-- Chart.js for Data Visualizations -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

  <!-- Custom CSS -->
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/animations.css">
</head>
<body>

<div class="sidebar-backdrop"></div>

<div class="app-container">

  <!-- Sidebar Navigation (Laptop & Desktop) -->
  <aside class="app-sidebar">
    <div class="sidebar-brand">
      <div class="brand-icon">
        <i class="fa-solid fa-wallet"></i>
      </div>
      <div class="brand-text">
        <h2>ExpenseIQ</h2>
        <p>Smart Finance</p>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-title">Navigation</div>
      
      <a href="index.php" class="nav-item <?php echo $currentPage === 'index.php' ? 'active' : ''; ?>">
        <i class="fa-solid fa-chart-pie"></i>
        <span>Dashboard</span>
      </a>

      <a href="expenses.php" class="nav-item <?php echo $currentPage === 'expenses.php' ? 'active' : ''; ?>">
        <i class="fa-solid fa-receipt"></i>
        <span>All Expenses</span>
      </a>

      <a href="budgets.php" class="nav-item <?php echo $currentPage === 'budgets.php' ? 'active' : ''; ?>">
        <i class="fa-solid fa-bullseye"></i>
        <span>Budget Planner</span>
      </a>

      <a href="reports.php" class="nav-item <?php echo $currentPage === 'reports.php' ? 'active' : ''; ?>">
        <i class="fa-solid fa-file-invoice"></i>
        <span>Monthly Reports</span>
      </a>

      <div class="nav-section-title" style="margin-top: 14px;">Smart Tools</div>

      <a href="javascript:void(0)" class="nav-item open-smart-budget-modal" style="color: #10b981;">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        <span>Smart Budget Auto-Plan</span>
      </a>

      <a href="javascript:void(0)" class="nav-item open-add-expense-modal" style="color: var(--accent-primary);">
        <i class="fa-solid fa-circle-plus"></i>
        <span>Add Daily Expense</span>
      </a>
    </nav>

    <div class="sidebar-footer">
      <div class="user-snippet">
        <div class="avatar-badge">SD</div>
        <div class="user-info">
          <div class="user-name"><?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Student Dev'); ?></div>
          <div class="user-status" style="<?php echo $dbConnected ? '' : 'color: var(--warning);'; ?>">
            <?php echo $dbConnected ? 'Secured Session' : 'Interactive Demo'; ?>
          </div>
        </div>
      </div>
    </div>
  </aside>

  <!-- Main Content Wrap -->
  <div class="app-main">

    <!-- Top Sticky Header -->
    <header class="app-header">
      <div class="header-left">
        <button class="mobile-menu-toggle" id="mobile-menu-btn" title="Toggle Navigation Drawer">
          <i class="fa-solid fa-bars"></i>
        </button>
        <div class="header-title-wrap">
          <h1><?php echo isset($pageTitle) ? htmlspecialchars($pageTitle) : 'Dashboard Overview'; ?></h1>
          <p><?php echo isset($pageSubtitle) ? htmlspecialchars($pageSubtitle) : 'Real-time financial analytics & expense tracking'; ?></p>
        </div>
      </div>

      <div class="header-right">
        <!-- Live Date Badge -->
        <div class="date-badge">
          <i class="fa-regular fa-calendar"></i>
          <span id="current-date-display">Today</span>
        </div>

        <!-- Smart Budget Planner CTA -->
        <button class="btn btn-secondary open-smart-budget-modal btn-interactive" style="border-color: rgba(16, 185, 129, 0.3); color: #10b981;">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          <span class="d-none-mobile">Plan Budget</span>
        </button>

        <!-- Theme Toggle -->
        <button class="btn-icon-only" id="theme-toggle-btn" title="Toggle Dark/Light Mode">
          <i class="fa-solid fa-sun"></i>
        </button>

        <!-- Quick Add Expense CTA -->
        <button class="btn btn-primary open-add-expense-modal btn-interactive">
          <i class="fa-solid fa-plus"></i>
          <span>Add Expense</span>
        </button>
      </div>
    </header>

    <!-- Main Dynamic Content -->
    <main class="app-content">

      <?php if (!$dbConnected): ?>
      <div class="db-alert-banner animate-fadeInDown">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-shield-halved" style="font-size: 1.15rem; color: #fbbf24;"></i>
          <div>
            <strong>Client Preview Mode:</strong> MySQL database is optional. The app is running with active interactive mock data. Import <code>database.sql</code> into phpMyAdmin for full multi-user database storage.
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('db-guide-modal').classList.add('active');">
          Database Guide
        </button>
      </div>
      <?php endif; ?>
