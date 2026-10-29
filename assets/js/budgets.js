/**
 * Personal Expense Tracker - Budget Planning & Category Limits
 */

document.addEventListener('DOMContentLoaded', () => {
  initBudgetsPage();

  window.addEventListener('budgetChanged', () => {
    const monthSelector = document.getElementById('budget-month-select');
    const m = monthSelector ? monthSelector.value : new Date().toISOString().slice(0, 7);
    loadCategoryBudgets(m);
  });
});

function initBudgetsPage() {
  const monthSelector = document.getElementById('budget-month-select');
  const modal = document.getElementById('budget-edit-modal');
  const form = document.getElementById('budget-edit-form');
  const closeBtns = document.querySelectorAll('.close-budget-modal');

  if (monthSelector) {
    populateMonthOptions(monthSelector);
    monthSelector.addEventListener('change', () => {
      loadCategoryBudgets(monthSelector.value);
    });
  }

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modal) modal.classList.remove('active');
    });
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  if (form) {
    form.addEventListener('submit', handleBudgetSubmit);
  }

  const initialMonth = monthSelector ? monthSelector.value : new Date().toISOString().slice(0, 7);
  loadCategoryBudgets(initialMonth);
}

function populateMonthOptions(selectEl) {
  selectEl.innerHTML = '';
  const currentDate = new Date();

  for (let i = 0; i < 6; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const val = d.toISOString().slice(0, 7);
    const text = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = text;
    if (i === 0) opt.selected = true;
    selectEl.appendChild(opt);
  }
}

async function loadCategoryBudgets(month) {
  const container = document.getElementById('budgets-grid-container');
  if (!container) return;

  try {
    const res = await fetch(`api/budgets.php?month=${month}`);
    const json = await res.json();

    if (json.success && json.data) {
      renderBudgetsGrid(json.data, month, json.overview);
    } else {
      loadFallbackBudgets(month);
    }
  } catch (e) {
    loadFallbackBudgets(month);
  }
}

function renderBudgetsGrid(budgets, month, overview = null) {
  const container = document.getElementById('budgets-grid-container');
  if (!container) return;

  container.innerHTML = '';

  let totalBudget = overview ? overview.total_budget : AppState.totalBudget;
  let totalSpent = overview ? overview.total_spent : 0;

  budgets.forEach((item, index) => {
    if (!overview) totalSpent += item.current_spent;

    const pct = item.monthly_limit > 0 ? Math.round((item.current_spent / item.monthly_limit) * 100) : 0;
    const isOver = item.monthly_limit > 0 && item.current_spent > item.monthly_limit;

    let barClass = 'progress-success';
    let statusBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">On Track</span>`;

    if (item.monthly_limit === 0) {
      statusBadge = `<span class="badge badge-outline">No Limit Set</span>`;
    } else if (isOver) {
      barClass = 'progress-danger';
      statusBadge = `<span class="badge" style="background: rgba(244, 63, 94, 0.2); color: #f43f5e;"><i class="fa-solid fa-triangle-exclamation"></i> Over Budget</span>`;
    } else if (pct >= 75) {
      barClass = 'progress-warning';
      statusBadge = `<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">Near Cap (${pct}%)</span>`;
    }

    const card = document.createElement('div');
    card.className = `card card-hover animate-fadeInUp delay-${Math.min((index % 6) + 1, 6)}`;
    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="cat-avatar-icon" style="background-color: ${item.category_color}20; color: ${item.category_color};">
            <i class="fa-solid ${item.category_icon}"></i>
          </div>
          <div>
            <h4 style="font-size: 1rem; font-weight: 700;">${escapeHtml(item.category_name)}</h4>
            <span style="font-size: 0.76rem; color: var(--text-muted);">Allocated Cap</span>
          </div>
        </div>
        ${statusBadge}
      </div>

      <div style="margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
          <span style="font-size: 0.8rem; color: var(--text-muted);">Current Outflow:</span>
          <span style="font-size: 1.15rem; font-weight: 800; font-family: 'Outfit', sans-serif; color: ${isOver ? 'var(--danger)' : 'var(--text-primary)'};">
            ${formatCurrency(item.current_spent)}
          </span>
        </div>
        <div class="progress-track" style="height: 8px;">
          <div class="progress-bar-fill ${barClass}" style="width: ${Math.min(pct, 100)}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.76rem; color: var(--text-muted);">
          <span>Limit: ${formatCurrency(item.monthly_limit)}</span>
          <span>${item.monthly_limit > 0 ? (isOver ? `Exceeded by ${formatCurrency(item.current_spent - item.monthly_limit)}` : `${formatCurrency(item.remaining)} left`) : 'Unlimited'}</span>
        </div>
      </div>

      <div style="border-top: 1px solid var(--border-light); padding-top: 14px; display: flex; justify-content: flex-end;">
        <button class="btn btn-secondary btn-sm" onclick="openBudgetEditModal(${item.category_id}, '${escapeHtml(item.category_name)}', ${item.monthly_limit}, '${month}')">
          <i class="fa-regular fa-pen-to-square"></i> Set Limit
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  animateCounter('total-budget-cap', totalBudget);
  animateCounter('total-budget-spent', totalSpent);
  animateCounter('total-budget-remaining', Math.max(0, totalBudget - totalSpent));
}

window.openBudgetEditModal = function(categoryId, categoryName, currentLimit, month) {
  const modal = document.getElementById('budget-edit-modal');
  if (!modal) return;

  document.getElementById('edit-budget-cat-id').value = categoryId;
  document.getElementById('edit-budget-month').value = month;
  document.getElementById('edit-budget-cat-name').textContent = categoryName;
  document.getElementById('edit-budget-amount').value = currentLimit || '';

  modal.classList.add('active');
  document.getElementById('edit-budget-amount').focus();
};

async function handleBudgetSubmit(e) {
  e.preventDefault();

  const category_id = parseInt(document.getElementById('edit-budget-cat-id').value);
  const month = document.getElementById('edit-budget-month').value;
  const monthly_limit = parseFloat(document.getElementById('edit-budget-amount').value);

  if (isNaN(monthly_limit) || monthly_limit < 0) {
    showToast('error', 'Error', 'Please enter a valid amount.');
    return;
  }

  const payload = { category_id, month, monthly_limit };

  try {
    const res = await fetch('api/budgets.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (json.success) {
      showToast('success', 'Budget Saved', 'Category spending cap updated!');
      document.getElementById('budget-edit-modal').classList.remove('active');
      loadCategoryBudgets(month);
      window.dispatchEvent(new CustomEvent('budgetChanged'));
    } else {
      saveFallbackBudget(payload);
    }
  } catch (err) {
    saveFallbackBudget(payload);
  }
}

function loadFallbackBudgets(month) {
  const storedBudgets = JSON.parse(localStorage.getItem('demo_budgets') || '{}');
  const demoExpenses = getDemoExpenses();
  const totalBudget = AppState.totalBudget || 30000;

  const budgets = AppState.categories.map(c => {
    const limit = storedBudgets[c.id] !== undefined ? storedBudgets[c.id] : Math.round((totalBudget * c.p50) / 100);
    const spent = demoExpenses
      .filter(e => e.category_id == c.id)
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return {
      category_id: c.id,
      category_name: c.name,
      category_icon: c.icon,
      category_color: c.color,
      monthly_limit: limit,
      current_spent: spent,
      remaining: Math.max(0, limit - spent)
    };
  });

  renderBudgetsGrid(budgets, month);
}

function saveFallbackBudget(payload) {
  const storedBudgets = JSON.parse(localStorage.getItem('demo_budgets') || '{}');
  storedBudgets[payload.category_id] = payload.monthly_limit;
  localStorage.setItem('demo_budgets', JSON.stringify(storedBudgets));

  document.getElementById('budget-edit-modal').classList.remove('active');
  showToast('info', 'Budget Updated', 'Saved in local mode.');
  loadCategoryBudgets(payload.month);
  window.dispatchEvent(new CustomEvent('budgetChanged'));
}
