    </main>
  </div>
</div>

<!-- ========================================================
     MOBILE BOTTOM NAVIGATION BAR (Thumb-friendly mobile UX)
     ======================================================== -->
<nav class="mobile-bottom-nav">
  <a href="index.php" class="mobile-nav-link <?php echo $currentPage === 'index.php' ? 'active' : ''; ?>">
    <i class="fa-solid fa-chart-pie"></i>
    <span>Overview</span>
  </a>

  <a href="expenses.php" class="mobile-nav-link <?php echo $currentPage === 'expenses.php' ? 'active' : ''; ?>">
    <i class="fa-solid fa-receipt"></i>
    <span>Expenses</span>
  </a>

  <!-- Floating Center Plus Button -->
  <button class="mobile-nav-cta open-add-expense-modal" title="Add Daily Expense">
    <i class="fa-solid fa-plus"></i>
  </button>

  <a href="budgets.php" class="mobile-nav-link <?php echo $currentPage === 'budgets.php' ? 'active' : ''; ?>">
    <i class="fa-solid fa-bullseye"></i>
    <span>Budgets</span>
  </a>

  <a href="reports.php" class="mobile-nav-link <?php echo $currentPage === 'reports.php' ? 'active' : ''; ?>">
    <i class="fa-solid fa-file-invoice"></i>
    <span>Reports</span>
  </a>
</nav>

<!-- ========================================================
     MODAL: Smart Budget Planner & Auto-Allocation Wizard
     (The requested feature: enter total budget and plan)
     ======================================================== -->
<div class="modal-overlay" id="smart-budget-modal">
  <div class="modal-content animate-modal" style="max-width: 580px;">
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="brand-icon" style="width: 34px; height: 34px; font-size: 0.95rem; background: linear-gradient(135deg, #10b981, #06b6d4);">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
        </div>
        <div>
          <h3 style="font-size: 1.15rem;">Smart Budget Planner</h3>
          <p style="font-size: 0.74rem; color: var(--text-muted); margin: 0;">Enter your total budget & auto-allocate by strategy</p>
        </div>
      </div>
      <button class="modal-close-btn close-smart-budget-modal" title="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <form id="smart-budget-form">
      <div class="modal-body">
        <!-- Total Budget Input -->
        <div class="form-group">
          <label for="smart-total-budget">Total Monthly Budget / Income (<?php echo CURRENCY_SYMBOL; ?>) *</label>
          <div class="input-with-icon">
            <i class="fa-solid fa-indian-rupee-sign"></i>
            <input type="number" id="smart-total-budget" class="form-control" placeholder="30000" step="500" min="1000" required>
          </div>
          <small style="color: var(--text-muted); font-size: 0.74rem; margin-top: 4px; display: block;">
            The app will automatically calculate and distribute spending limits for each category.
          </small>
        </div>

        <!-- Strategy Selection -->
        <div class="form-group">
          <label>Choose Budgeting Strategy</label>
          <div class="strategy-cards-grid">
            <div class="strategy-card active" data-strategy="50-30-20">
              <h5>50 / 30 / 20 Rule</h5>
              <p>50% Needs & Bills, 30% Dining & Fun, 20% Savings & Education</p>
            </div>
            <div class="strategy-card" data-strategy="student">
              <h5>Student Plan</h5>
              <p>Higher allocation for Food, Transport, and Study materials</p>
            </div>
            <div class="strategy-card" data-strategy="saver">
              <h5>Aggressive Saver</h5>
              <p>Strict caps on shopping and leisure to maximize monthly savings</p>
            </div>
          </div>
        </div>

        <!-- Calculated Allocations Live Preview -->
        <div class="form-group">
          <label style="display: flex; justify-content: space-between;">
            <span>Auto-Calculated Allocations</span>
            <span style="color: var(--success); font-weight: 700;">Live Preview</span>
          </label>
          <div id="budget-allocation-preview" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 14px; max-height: 180px; overflow-y: auto;">
            <!-- Populated dynamically via main.js -->
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary close-smart-budget-modal">Cancel</button>
        <button type="submit" class="btn btn-primary btn-interactive">
          <i class="fa-solid fa-check"></i> Apply Budget Plan
        </button>
      </div>
    </form>
  </div>
</div>

<!-- ========================================================
     MODAL: Add / Edit Expense (Glassmorphic)
     ======================================================== -->
<div class="modal-overlay" id="expense-modal">
  <div class="modal-content animate-modal">
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="brand-icon" style="width: 32px; height: 32px; font-size: 0.95rem;">
          <i class="fa-solid fa-receipt"></i>
        </div>
        <h3 id="modal-title">Add New Expense</h3>
      </div>
      <button class="modal-close-btn close-expense-modal" title="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <form id="expense-form">
      <input type="hidden" id="expense-id" name="id" value="">
      <input type="hidden" id="expense-payment-method" name="payment_method" value="UPI">

      <div class="modal-body">
        <div class="form-group">
          <label for="expense-title">Expense Title / Description *</label>
          <div class="input-with-icon">
            <i class="fa-solid fa-tag"></i>
            <input type="text" id="expense-title" class="form-control" placeholder="e.g. Grocery Run, Metro Pass, Coffee" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="expense-amount">Amount (<?php echo CURRENCY_SYMBOL; ?>) *</label>
            <div class="input-with-icon">
              <i class="fa-solid fa-indian-rupee-sign"></i>
              <input type="number" id="expense-amount" class="form-control" placeholder="0.00" step="0.01" min="0.01" required>
            </div>
          </div>

          <div class="form-group">
            <label for="expense-category">Category *</label>
            <select id="expense-category" class="custom-select" style="width: 100%; height: 44px;" required>
              <option value="">Select Category</option>
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
          </div>
        </div>

        <div class="form-group">
          <label for="expense-date">Expense Date *</label>
          <div class="input-with-icon">
            <i class="fa-regular fa-calendar-days"></i>
            <input type="date" id="expense-date" class="form-control" required>
          </div>
        </div>

        <div class="form-group">
          <label>Payment Method</label>
          <div class="payment-methods-grid">
            <div class="payment-pill selected" data-method="UPI">
              <i class="fa-solid fa-mobile-screen"></i>
              <span>UPI / QR</span>
            </div>
            <div class="payment-pill" data-method="Credit Card">
              <i class="fa-regular fa-credit-card"></i>
              <span>Credit Card</span>
            </div>
            <div class="payment-pill" data-method="Debit Card">
              <i class="fa-solid fa-credit-card"></i>
              <span>Debit Card</span>
            </div>
            <div class="payment-pill" data-method="Cash">
              <i class="fa-solid fa-money-bill-wave"></i>
              <span>Cash</span>
            </div>
            <div class="payment-pill" data-method="Net Banking">
              <i class="fa-solid fa-building-columns"></i>
              <span>Net Banking</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="expense-notes">Optional Notes</label>
          <div class="input-with-icon">
            <i class="fa-regular fa-note-sticky"></i>
            <input type="text" id="expense-notes" class="form-control" placeholder="Add additional details or merchant name...">
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary close-expense-modal">Cancel</button>
        <button type="submit" class="btn btn-primary btn-interactive" id="expense-submit-btn">
          <i class="fa-solid fa-plus"></i> Save Expense
        </button>
      </div>
    </form>
  </div>
</div>

<!-- ========================================================
     MODAL: Database Setup Guide
     ======================================================== -->
<div class="modal-overlay" id="db-guide-modal">
  <div class="modal-content animate-modal" style="max-width: 600px;">
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="fa-solid fa-shield-halved" style="color: var(--accent-primary); font-size: 1.2rem;"></i>
        <h3>Secure Database Setup Guide</h3>
      </div>
      <button class="modal-close-btn" onclick="document.getElementById('db-guide-modal').classList.remove('active');">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="modal-body" style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary);">
      <p style="margin-bottom: 12px;">To connect this application to MySQL:</p>
      <ol style="margin-left: 20px; display: flex; flex-direction: column; gap: 10px;">
        <li>Start <strong>Apache & MySQL</strong> in XAMPP or Laragon.</li>
        <li>Open <code>http://localhost/phpmyadmin</code>.</li>
        <li>Import <code>database.sql</code> located in the project root.</li>
        <li>Open <code>http://localhost/expense-tracker</code> in your browser.</li>
      </ol>
      <div style="margin-top: 16px; padding: 12px; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.82rem;">
        🔒 <strong>Data Security:</strong> All queries use prepared statements, CSRF protection, and user-scoped data queries to prevent SQL injection and cross-user leaks.
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary" onclick="document.getElementById('db-guide-modal').classList.remove('active');">
        Understood
      </button>
    </div>
  </div>
</div>

<div id="toast-container"></div>

<script src="assets/js/main.js"></script>
<?php if (isset($pageScript)): ?>
  <script src="<?php echo htmlspecialchars($pageScript); ?>"></script>
<?php endif; ?>

</body>
</html>
