/**
 * Personal Expense Tracker - Global UI, Utilities & State Management
 * Includes Smart Budget Allocation Engine & Mobile Navigation
 */

// Global App State
const AppState = {
  currency: '₹',
  theme: localStorage.getItem('theme') || 'dark',
  isDemoMode: localStorage.getItem('demo_mode') === 'true',
  totalBudget: parseFloat(localStorage.getItem('user_total_budget') || '30000'),
  budgetStrategy: localStorage.getItem('user_budget_strategy') || '50-30-20',
  categories: [
    { id: 1, name: 'Food & Dining', icon: 'fa-utensils', color: '#f97316', p50: 25, pStudent: 30, pSaver: 15 },
    { id: 2, name: 'Transportation', icon: 'fa-car', color: '#06b6d4', p50: 12, pStudent: 15, pSaver: 10 },
    { id: 3, name: 'Shopping', icon: 'fa-bag-shopping', color: '#ec4899', p50: 15, pStudent: 10, pSaver: 5 },
    { id: 4, name: 'Bills & Utilities', icon: 'fa-file-invoice-dollar', color: '#8b5cf6', p50: 18, pStudent: 20, pSaver: 15 },
    { id: 5, name: 'Entertainment', icon: 'fa-film', color: '#eab308', p50: 8, pStudent: 8, pSaver: 5 },
    { id: 6, name: 'Health & Fitness', icon: 'fa-heart-pulse', color: '#10b981', p50: 7, pStudent: 5, pSaver: 5 },
    { id: 7, name: 'Education', icon: 'fa-graduation-cap', color: '#3b82f6', p50: 10, pStudent: 15, pSaver: 5 },
    { id: 8, name: 'Groceries', icon: 'fa-basket-shopping', color: '#14b8a6', p50: 15, pStudent: 15, pSaver: 15 },
    { id: 9, name: 'Other', icon: 'fa-ellipsis', color: '#64748b', p50: 5, pStudent: 2, pSaver: 5 }
  ]
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSidebarAndBackdrop();
  initExpenseModal();
  initSmartBudgetModal();
  initLiveClock();
});

/* -------------------------------------------------------------
 * Theme Management (Dark / Light)
 * ------------------------------------------------------------- */
function initTheme() {
  document.documentElement.setAttribute('data-theme', AppState.theme);
  updateThemeIcon();

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', AppState.theme);
  localStorage.setItem('theme', AppState.theme);
  updateThemeIcon();

  if (window.dispatchEvent) {
    window.dispatchEvent(new Event('themeChanged'));
  }
}

function updateThemeIcon() {
  const icon = document.querySelector('#theme-toggle-btn i');
  if (icon) {
    icon.className = AppState.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}

/* -------------------------------------------------------------
 * Mobile Responsive Navigation & Backdrop
 * ------------------------------------------------------------- */
function initSidebarAndBackdrop() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.app-sidebar');

  // Create backdrop element if it doesn't exist
  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  function openSidebar() {
    sidebar.classList.add('mobile-open');
    backdrop.classList.add('active');
  }

  function closeSidebar() {
    sidebar.classList.remove('mobile-open');
    backdrop.classList.remove('active');
  }

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar.classList.contains('mobile-open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    backdrop.addEventListener('click', closeSidebar);
  }
}

/* -------------------------------------------------------------
 * Header Live Clock
 * ------------------------------------------------------------- */
function initLiveClock() {
  const dateEl = document.getElementById('current-date-display');
  if (dateEl) {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
  }
}

/* -------------------------------------------------------------
 * Toast Notification System
 * ------------------------------------------------------------- */
function showToast(type = 'success', title = 'Success', message = '') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} toast-enter`;

  const iconMap = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };

  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || 'fa-bell'}"></i>
    <div class="toast-content">
      <h4>${escapeHtml(title)}</h4>
      ${message ? `<p>${escapeHtml(message)}</p>` : ''}
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-leave');
    setTimeout(() => toast.remove(), 350);
  }, 3800);
}

/* -------------------------------------------------------------
 * Currency & Formatting Helpers
 * ------------------------------------------------------------- */
function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return `${AppState.currency} ${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function animateCounter(elementId, targetValue, duration = 1200, prefix = '₹ ') {
  const el = document.getElementById(elementId);
  if (!el) return;

  const startValue = 0;
  const target = parseFloat(targetValue) || 0;
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = startValue + (target - startValue) * easeProgress;

    el.textContent = `${prefix}${current.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    }
  }

  requestAnimationFrame(updateCount);
}

/* -------------------------------------------------------------
 * Smart Budget Allocation Wizard (The Requested Feature)
 * ------------------------------------------------------------- */
function initSmartBudgetModal() {
  const modal = document.getElementById('smart-budget-modal');
  const openBtns = document.querySelectorAll('.open-smart-budget-modal');
  const closeBtns = document.querySelectorAll('.close-smart-budget-modal');
  const form = document.getElementById('smart-budget-form');
  const budgetInput = document.getElementById('smart-total-budget');
  const strategyCards = document.querySelectorAll('.strategy-card');

  if (!modal || !form) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      openSmartBudgetModal();
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // Strategy cards click listener
  strategyCards.forEach(card => {
    card.addEventListener('click', () => {
      strategyCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      AppState.budgetStrategy = card.dataset.strategy;
      updateAllocationPreview();
    });
  });

  // Live calculation when user types their total budget
  if (budgetInput) {
    budgetInput.addEventListener('input', () => {
      updateAllocationPreview();
    });
  }

  // Submit Handler
  form.addEventListener('submit', handleSmartBudgetSubmit);
}

function openSmartBudgetModal() {
  const modal = document.getElementById('smart-budget-modal');
  const budgetInput = document.getElementById('smart-total-budget');
  const strategyCards = document.querySelectorAll('.strategy-card');

  if (!modal) return;

  if (budgetInput) {
    budgetInput.value = AppState.totalBudget || 30000;
  }

  strategyCards.forEach(c => {
    c.classList.toggle('active', c.dataset.strategy === AppState.budgetStrategy);
  });

  updateAllocationPreview();
  modal.classList.add('active');
  if (budgetInput) budgetInput.focus();
}

/**
 * Calculates category-by-category breakdown based on user's entered budget & strategy
 */
function calculateSmartAllocations(totalBudget, strategy = '50-30-20') {
  const total = parseFloat(totalBudget) || 0;
  const allocations = {};

  AppState.categories.forEach(cat => {
    let pct = cat.p50;
    if (strategy === 'student') pct = cat.pStudent;
    if (strategy === 'saver') pct = cat.pSaver;

    const allocatedAmount = Math.round((total * pct) / 100);
    allocations[cat.id] = allocatedAmount;
  });

  return allocations;
}

/**
 * Live updates the preview table in the Smart Budget modal
 */
function updateAllocationPreview() {
  const budgetInput = document.getElementById('smart-total-budget');
  const previewContainer = document.getElementById('budget-allocation-preview');
  if (!previewContainer || !budgetInput) return;

  const total = parseFloat(budgetInput.value) || 0;
  const activeStrategy = document.querySelector('.strategy-card.active')?.dataset.strategy || '50-30-20';
  const allocations = calculateSmartAllocations(total, activeStrategy);

  previewContainer.innerHTML = '';

  AppState.categories.forEach(cat => {
    const amount = allocations[cat.id] || 0;
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-light); font-size: 0.82rem;';
    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid ${cat.icon}" style="color: ${cat.color}; width: 16px;"></i>
        <span>${escapeHtml(cat.name)}</span>
      </div>
      <strong style="font-family: 'Outfit', sans-serif; color: var(--text-primary);">${formatCurrency(amount)}</strong>
    `;
    previewContainer.appendChild(row);
  });
}

/**
 * Save smart budget allocations (API or LocalStorage fallback)
 */
async function handleSmartBudgetSubmit(e) {
  e.preventDefault();

  const totalBudget = parseFloat(document.getElementById('smart-total-budget').value);
  const activeStrategy = document.querySelector('.strategy-card.active')?.dataset.strategy || '50-30-20';
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (isNaN(totalBudget) || totalBudget <= 0) {
    showToast('error', 'Invalid Budget', 'Please enter a valid monthly budget amount.');
    return;
  }

  const allocations = calculateSmartAllocations(totalBudget, activeStrategy);

  AppState.totalBudget = totalBudget;
  AppState.budgetStrategy = activeStrategy;
  localStorage.setItem('user_total_budget', totalBudget);
  localStorage.setItem('user_budget_strategy', activeStrategy);
  localStorage.setItem('demo_budgets', JSON.stringify(allocations));

  try {
    const res = await fetch('api/budgets.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'set_total_budget',
        month: currentMonth,
        total_budget: totalBudget,
        strategy: activeStrategy,
        allocations: allocations
      })
    });
    const json = await res.json();

    if (json.success) {
      showToast('success', 'Smart Budget Applied!', `Allocated ${formatCurrency(totalBudget)} across all categories.`);
    } else {
      showToast('info', 'Demo Budget Applied', `Allocated ${formatCurrency(totalBudget)} in local preview mode.`);
    }
  } catch (err) {
    showToast('info', 'Demo Budget Applied', `Allocated ${formatCurrency(totalBudget)} in local preview mode.`);
  }

  const modal = document.getElementById('smart-budget-modal');
  if (modal) modal.classList.remove('active');

  // Notify listeners to recalculate dashboard & budgets
  window.dispatchEvent(new CustomEvent('budgetChanged'));
}

/* -------------------------------------------------------------
 * Expense Modal Controller
 * ------------------------------------------------------------- */
function initExpenseModal() {
  const modalOverlay = document.getElementById('expense-modal');
  const openBtns = document.querySelectorAll('.open-add-expense-modal');
  const closeBtns = document.querySelectorAll('.close-expense-modal');
  const form = document.getElementById('expense-form');
  const paymentPills = document.querySelectorAll('.payment-pill');

  if (!modalOverlay || !form) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => openExpenseModal());
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', closeExpenseModal);
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeExpenseModal();
  });

  paymentPills.forEach(pill => {
    pill.addEventListener('click', () => {
      paymentPills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      const hiddenInput = document.getElementById('expense-payment-method');
      if (hiddenInput) hiddenInput.value = pill.dataset.method;
    });
  });

  const dateInput = document.getElementById('expense-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  form.addEventListener('submit', handleExpenseFormSubmit);
}

function openExpenseModal(expenseData = null) {
  const modalOverlay = document.getElementById('expense-modal');
  const form = document.getElementById('expense-form');
  const modalTitle = document.getElementById('modal-title');
  const submitBtn = document.getElementById('expense-submit-btn');

  if (!modalOverlay || !form) return;

  form.reset();

  if (expenseData) {
    modalTitle.textContent = 'Edit Expense';
    submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Update Expense';
    document.getElementById('expense-id').value = expenseData.id;
    document.getElementById('expense-title').value = expenseData.title;
    document.getElementById('expense-amount').value = expenseData.amount;
    document.getElementById('expense-category').value = expenseData.category_id;
    document.getElementById('expense-date').value = expenseData.expense_date;
    document.getElementById('expense-notes').value = expenseData.notes || '';

    const method = expenseData.payment_method || 'UPI';
    document.getElementById('expense-payment-method').value = method;
    document.querySelectorAll('.payment-pill').forEach(pill => {
      pill.classList.toggle('selected', pill.dataset.method === method);
    });
  } else {
    modalTitle.textContent = 'Add New Expense';
    submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Save Expense';
    document.getElementById('expense-id').value = '';
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('expense-payment-method').value = 'UPI';
    document.querySelectorAll('.payment-pill').forEach(pill => {
      pill.classList.toggle('selected', pill.dataset.method === 'UPI');
    });
  }

  modalOverlay.classList.add('active');
  document.getElementById('expense-title').focus();
}

function closeExpenseModal() {
  const modalOverlay = document.getElementById('expense-modal');
  if (modalOverlay) modalOverlay.classList.remove('active');
}

async function handleExpenseFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('expense-id').value;
  const title = document.getElementById('expense-title').value.trim();
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const category_id = parseInt(document.getElementById('expense-category').value);
  const expense_date = document.getElementById('expense-date').value;
  const payment_method = document.getElementById('expense-payment-method').value || 'UPI';
  const notes = document.getElementById('expense-notes').value.trim();

  if (!title || isNaN(amount) || amount <= 0 || !category_id || !expense_date) {
    showToast('error', 'Validation Error', 'Please complete all required fields.');
    return;
  }

  const payload = {
    id: id ? parseInt(id) : null,
    title,
    amount,
    category_id,
    expense_date,
    payment_method,
    notes
  };

  const isEdit = Boolean(id);

  try {
    const response = await fetch(`api/expenses.php${isEdit ? '?action=update' : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      showToast('success', isEdit ? 'Updated!' : 'Saved!', result.message || 'Expense recorded.');
      closeExpenseModal();
      window.dispatchEvent(new CustomEvent('expenseChanged', { detail: result.data }));
    } else {
      if (result.status === 'db_offline') {
        saveDemoExpense(payload, isEdit);
      } else {
        showToast('error', 'Error', result.message || 'Could not record expense.');
      }
    }
  } catch (err) {
    saveDemoExpense(payload, isEdit);
  }
}

/* -------------------------------------------------------------
 * Demo & Mock Data Management
 * ------------------------------------------------------------- */
function getDemoExpenses() {
  const stored = localStorage.getItem('demo_expenses');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }

  const today = new Date();
  const makeDate = (daysAgo) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const seed = [
    { id: 101, title: 'Starbucks Coffee & Snacks', amount: 380, category_id: 1, expense_date: makeDate(0), payment_method: 'UPI', notes: 'Quick breakfast' },
    { id: 102, title: 'Metro Card Recharge', amount: 500, category_id: 2, expense_date: makeDate(0), payment_method: 'Debit Card', notes: 'Monthly pass' },
    { id: 103, title: 'Supermarket Grocery Run', amount: 1450.5, category_id: 8, expense_date: makeDate(1), payment_method: 'Credit Card', notes: 'Weekly fruits & bread' },
    { id: 104, title: 'Netflix & Spotify Subs', amount: 649, category_id: 5, expense_date: makeDate(2), payment_method: 'Credit Card', notes: 'Entertainment subs' },
    { id: 105, title: 'Pharmacy Vitamins', amount: 720, category_id: 6, expense_date: makeDate(3), payment_method: 'UPI', notes: 'Health essentials' },
    { id: 106, title: 'Weekend Bistro Dinner', amount: 1850, category_id: 1, expense_date: makeDate(4), payment_method: 'Credit Card', notes: 'Dinner with friends' },
    { id: 107, title: 'Algorithms Textbook', amount: 899, category_id: 7, expense_date: makeDate(6), payment_method: 'UPI', notes: 'Web development books' },
    { id: 108, title: 'Electricity & Water Bill', amount: 2150, category_id: 4, expense_date: makeDate(8), payment_method: 'Net Banking', notes: 'Utility bills' },
    { id: 109, title: 'Gym Membership Fee', amount: 1500, category_id: 6, expense_date: makeDate(11), payment_method: 'UPI', notes: 'Monthly fitness' },
    { id: 110, title: 'Petrol / Fuel Refill', amount: 1200, category_id: 2, expense_date: makeDate(14), payment_method: 'Cash', notes: 'Vehicle fuel' }
  ];

  localStorage.setItem('demo_expenses', JSON.stringify(seed));
  return seed;
}

function saveDemoExpense(expense, isEdit) {
  let list = getDemoExpenses();

  if (isEdit) {
    list = list.map(item => item.id === expense.id ? { ...item, ...expense } : item);
  } else {
    expense.id = Date.now();
    list.unshift(expense);
  }

  localStorage.setItem('demo_expenses', JSON.stringify(list));
  closeExpenseModal();
  showToast('info', isEdit ? 'Demo Updated' : 'Demo Added', 'Saved in local mode.');
  window.dispatchEvent(new CustomEvent('expenseChanged', { detail: expense }));
}

function deleteDemoExpense(id) {
  let list = getDemoExpenses();
  list = list.filter(item => item.id !== id);
  localStorage.setItem('demo_expenses', JSON.stringify(list));
  showToast('success', 'Deleted', 'Expense deleted.');
  window.dispatchEvent(new CustomEvent('expenseChanged', { detail: { id } }));
}
