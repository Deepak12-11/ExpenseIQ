<?php
$pageTitle = 'Budget Planner & Optimizer';
$pageSubtitle = 'Set spending caps, auto-allocate by financial strategies, and track limits';
$pageScript = 'assets/js/budgets.js';

require_once __DIR__ . '/includes/header.php';
?>

<!-- 1. Executive Budget Strategy & Auto-Plan Hero -->
<div class="budget-hero-card animate-fadeInUp delay-1">
  <div class="budget-hero-header">
    <div style="display: flex; align-items: center; gap: 14px;">
      <div class="brand-icon" style="background: linear-gradient(135deg, #10b981, #06b6d4);">
        <i class="fa-solid fa-bullseye"></i>
      </div>
      <div>
        <h3 style="font-size: 1.25rem;">Monthly Budget Intelligence</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">
          Enter your total monthly budget and let the planner automatically distribute spending caps
        </p>
      </div>
    </div>

    <!-- Quick Auto-Plan CTA -->
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <label for="budget-month-select" style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);">Period:</label>
        <select id="budget-month-select" class="custom-select" style="font-weight: 600;">
          <!-- Populated via budgets.js -->
        </select>
      </div>

      <button class="btn btn-primary open-smart-budget-modal btn-interactive">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        <span>Auto-Plan Budget</span>
      </button>
    </div>
  </div>

  <!-- Four Metric Boxes -->
  <div class="hero-stats-row">
    <div class="hero-stat-box">
      <span class="hero-stat-label">Total Monthly Budget</span>
      <span class="hero-stat-val" id="total-budget-cap">₹ 0.00</span>
    </div>
    <div class="hero-stat-box">
      <span class="hero-stat-label">Total Outflow (Spent)</span>
      <span class="hero-stat-val" id="total-budget-spent">₹ 0.00</span>
    </div>
    <div class="hero-stat-box">
      <span class="hero-stat-label">Remaining Buffer</span>
      <span class="hero-stat-val" id="total-budget-remaining" style="color: var(--success);">₹ 0.00</span>
    </div>
    <div class="hero-stat-box">
      <span class="hero-stat-label">Threshold Legend</span>
      <div style="font-size: 0.74rem; display: flex; flex-direction: column; gap: 2px; margin-top: 4px;">
        <span style="color: var(--success);"><i class="fa-solid fa-circle" style="font-size: 0.55rem;"></i> &lt; 75%: Healthy</span>
        <span style="color: var(--warning);"><i class="fa-solid fa-circle" style="font-size: 0.55rem;"></i> 75% - 99%: Near Cap</span>
        <span style="color: var(--danger);"><i class="fa-solid fa-circle" style="font-size: 0.55rem;"></i> ≥ 100%: Exceeded</span>
      </div>
    </div>
  </div>
</div>

<!-- 2. Category Budgets Grid -->
<div class="charts-grid-3" id="budgets-grid-container">
  <!-- Populated dynamically via budgets.js -->
</div>

<!-- ========================================================
     MODAL: Single Category Limit Editor
     ======================================================== -->
<div class="modal-overlay" id="budget-edit-modal">
  <div class="modal-content animate-modal">
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="fa-solid fa-bullseye" style="color: var(--accent-primary); font-size: 1.2rem;"></i>
        <h3>Edit Category Spending Limit</h3>
      </div>
      <button class="modal-close-btn close-budget-modal" title="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <form id="budget-edit-form">
      <input type="hidden" id="edit-budget-cat-id" value="">
      <input type="hidden" id="edit-budget-month" value="">

      <div class="modal-body">
        <p style="font-size: 0.86rem; color: var(--text-secondary); margin-bottom: 16px;">
          Set monthly spending ceiling for <strong id="edit-budget-cat-name" style="color: var(--text-primary);">Category</strong>.
        </p>

        <div class="form-group">
          <label for="edit-budget-amount">Monthly Limit Amount (<?php echo CURRENCY_SYMBOL; ?>) *</label>
          <div class="input-with-icon">
            <i class="fa-solid fa-indian-rupee-sign"></i>
            <input type="number" id="edit-budget-amount" class="form-control" placeholder="e.g. 5000" step="100" min="0" required>
          </div>
          <small style="color: var(--text-muted); font-size: 0.75rem; margin-top: 4px; display: block;">
            Set to 0 if you do not want an enforced spending cap for this category.
          </small>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary close-budget-modal">Cancel</button>
        <button type="submit" class="btn btn-primary btn-interactive">
          <i class="fa-solid fa-check"></i> Save Budget
        </button>
      </div>
    </form>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
