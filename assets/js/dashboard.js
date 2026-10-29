/**
 * Personal Expense Tracker - Executive Dashboard Visualizations & Analytics
 */

let categoryDonutChart = null;
let dailyTrendChart = null;
let monthlyHistoryChart = null;

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();

  window.addEventListener('expenseChanged', () => loadDashboardData());
  window.addEventListener('budgetChanged', () => loadDashboardData());
  window.addEventListener('themeChanged', () => loadDashboardData());
});

async function loadDashboardData() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  try {
    const response = await fetch(`api/reports.php?month=${currentMonth}`);
    const res = await response.json();

    if (res.success) {
      renderDashboardSummary(res.summary, res.budget);
      renderCategoryChart(res.categories, res.summary.total_spent);
      renderDailyTrendChart(res.daily_trend);
      renderMonthlyHistoryChart(res.monthly_history);
      renderBudgetProgressWidget(res.categories);
      loadRecentTransactions();
    } else {
      loadFallbackDashboardData();
    }
  } catch (error) {
    loadFallbackDashboardData();
  }
}

/**
 * Render KPI Cards and Executive Budget Hero
 */
function renderDashboardSummary(summary, budget) {
  if (!summary) return;

  // 1. KPI Cards
  animateCounter('kpi-month-total', summary.total_spent);
  animateCounter('kpi-today-total', summary.today_spent);
  animateCounter('kpi-daily-avg', summary.daily_average);

  const highEl = document.getElementById('kpi-highest-expense');
  if (highEl) {
    if (summary.highest_expense) {
      highEl.textContent = formatCurrency(summary.highest_expense.amount);
      const titleEl = document.getElementById('kpi-highest-title');
      if (titleEl) {
        titleEl.textContent = `${summary.highest_expense.title} (${summary.highest_expense.category_name})`;
      }
    } else {
      highEl.textContent = formatCurrency(0);
    }
  }

  const trendBadge = document.getElementById('kpi-month-trend');
  if (trendBadge) {
    const pct = summary.percent_change;
    if (pct > 0) {
      trendBadge.className = 'badge-trend trend-up';
      trendBadge.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> +${pct}% vs last month`;
    } else if (pct < 0) {
      trendBadge.className = 'badge-trend trend-down';
      trendBadge.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> ${pct}% vs last month`;
    } else {
      trendBadge.className = 'badge-trend trend-neutral';
      trendBadge.innerHTML = `<i class="fa-solid fa-minus"></i> Same as last month`;
    }
  }

  // 2. Executive Budget Health Hero Card
  const totalBudget = (budget && budget.total_budget) ? budget.total_budget : AppState.totalBudget;
  const totalSpent = summary.total_spent;
  const remaining = Math.max(0, totalBudget - totalSpent);
  const utilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);
  const safeDaily = (budget && budget.safe_daily_spend) ? budget.safe_daily_spend : Math.round(remaining / daysLeft);

  animateCounter('hero-total-budget', totalBudget);
  animateCounter('hero-total-spent', totalSpent);
  animateCounter('hero-remaining-budget', remaining);
  animateCounter('hero-safe-daily', safeDaily);

  const pctLabel = document.getElementById('hero-utilization-pct');
  if (pctLabel) pctLabel.textContent = `${utilization}% utilized`;

  const heroBar = document.getElementById('hero-progress-bar');
  if (heroBar) {
    heroBar.style.width = `${Math.min(utilization, 100)}%`;
    heroBar.className = 'progress-bar-fill ' + (utilization >= 100 ? 'progress-danger' : utilization >= 75 ? 'progress-warning' : 'progress-success');
  }
}

/**
 * Render Category Breakdown Donut Chart
 */
function renderCategoryChart(categories, totalSpent) {
  const canvas = document.getElementById('categoryDoughnutChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const isDark = AppState.theme === 'dark';
  const activeCats = categories.filter(c => c.total_amount > 0);

  const labels = activeCats.length ? activeCats.map(c => c.category_name) : ['No Expenses Yet'];
  const data = activeCats.length ? activeCats.map(c => c.total_amount) : [1];
  const bgColors = activeCats.length ? activeCats.map(c => c.category_color) : ['#475569'];

  if (categoryDonutChart) categoryDonutChart.destroy();

  categoryDonutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderWidth: 2,
        borderColor: isDark ? '#0f1629' : '#ffffff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 22, 41, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#f8fafc' : '#0f172a',
          bodyColor: isDark ? '#cbd5e1' : '#334155',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context) => {
              const val = context.raw || 0;
              const pct = totalSpent > 0 ? ((val / totalSpent) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
            }
          }
        }
      },
      animation: { animateScale: true, animateRotate: true, duration: 800 }
    }
  });

  const listContainer = document.getElementById('category-legend-list');
  if (listContainer) {
    listContainer.innerHTML = '';
    const topCats = activeCats.slice(0, 5);

    if (topCats.length === 0) {
      listContainer.innerHTML = `<div class="empty-state" style="padding: 20px 0;"><p>No category expenses recorded yet.</p></div>`;
      return;
    }

    topCats.forEach(cat => {
      const item = document.createElement('div');
      item.className = 'cat-item animate-fadeInUp';
      item.innerHTML = `
        <div class="cat-left">
          <span class="cat-dot" style="background-color: ${cat.category_color};"></span>
          <span class="cat-name">${escapeHtml(cat.category_name)}</span>
        </div>
        <div class="cat-right">
          <span class="cat-amount">${formatCurrency(cat.total_amount)}</span>
          <span class="cat-pct">${cat.percentage}%</span>
        </div>
      `;
      listContainer.appendChild(item);
    });
  }
}

/**
 * Render Daily Trend Spline Area Chart
 */
function renderDailyTrendChart(dailyTrend) {
  const canvas = document.getElementById('dailyTrendChart');
  if (!canvas || !dailyTrend) return;

  const ctx = canvas.getContext('2d');
  const isDark = AppState.theme === 'dark';

  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  if (dailyTrendChart) dailyTrendChart.destroy();

  dailyTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dailyTrend.labels,
      datasets: [{
        label: 'Daily Spending',
        data: dailyTrend.amounts,
        borderColor: '#6366f1',
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: isDark ? '#0f1629' : '#ffffff',
        pointHoverRadius: 6,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 22, 41, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#f8fafc' : '#0f172a',
          bodyColor: isDark ? '#cbd5e1' : '#334155',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          padding: 10,
          callbacks: { label: (ctx) => ` Spent: ${formatCurrency(ctx.raw)}` }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: isDark ? '#64748b' : '#94a3b8', maxTicksLimit: 8, font: { size: 11 } }
        },
        y: {
          grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)' },
          ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { size: 11 }, callback: (v) => `${AppState.currency}${v}` }
        }
      },
      animation: { duration: 900, easing: 'easeOutQuart' }
    }
  });
}

/**
 * 6-Month Comparison Bar Chart
 */
function renderMonthlyHistoryChart(history) {
  const canvas = document.getElementById('monthlyHistoryChart');
  if (!canvas || !history) return;

  const ctx = canvas.getContext('2d');
  const isDark = AppState.theme === 'dark';

  if (monthlyHistoryChart) monthlyHistoryChart.destroy();

  const labels = history.map(h => h.month_label);
  const data = history.map(h => parseFloat(h.monthly_total));

  monthlyHistoryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monthly Total',
        data: data,
        backgroundColor: '#10b981',
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: '#059669'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 22, 41, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#f8fafc' : '#0f172a',
          bodyColor: isDark ? '#cbd5e1' : '#334155',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          padding: 10,
          callbacks: { label: (ctx) => ` Total: ${formatCurrency(ctx.raw)}` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: isDark ? '#64748b' : '#94a3b8' } },
        y: {
          grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)' },
          ticks: { color: isDark ? '#64748b' : '#94a3b8', callback: (v) => `${AppState.currency}${v}` }
        }
      },
      animation: { duration: 900, easing: 'easeOutQuart' }
    }
  });
}

function renderBudgetProgressWidget(categories) {
  const container = document.getElementById('dashboard-budget-list');
  if (!container) return;

  container.innerHTML = '';
  const budgeted = categories.filter(c => c.budget_limit > 0).slice(0, 4);

  if (budgeted.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 20px 0;">
        <i class="fa-solid fa-bullseye"></i>
        <h4>No category limits set</h4>
        <button class="btn btn-primary btn-sm open-smart-budget-modal" style="margin-top: 10px;">
          Configure Budget
        </button>
      </div>
    `;
    return;
  }

  budgeted.forEach(item => {
    const pct = item.budget_usage || 0;
    let barColor = 'progress-success';
    if (pct >= 100) barColor = 'progress-danger';
    else if (pct >= 75) barColor = 'progress-warning';

    const card = document.createElement('div');
    card.style.cssText = 'background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 12px;';
    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid ${item.category_icon}" style="color: ${item.category_color}; font-size: 0.95rem;"></i>
          <span style="font-weight: 600; font-size: 0.88rem;">${escapeHtml(item.category_name)}</span>
        </div>
        <span style="font-size: 0.82rem; font-weight: 700; color: ${pct >= 100 ? 'var(--danger)' : 'var(--text-secondary)'};">
          ${pct}%
        </span>
      </div>
      <div class="progress-track" style="height: 6px; margin-bottom: 6px;">
        <div class="progress-bar-fill ${barColor}" style="width: ${Math.min(pct, 100)}%;"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: var(--text-muted);">
        <span>${formatCurrency(item.total_amount)} spent</span>
        <span>${formatCurrency(item.budget_limit)} cap</span>
      </div>
    `;
    container.appendChild(card);
  });
}

async function loadRecentTransactions() {
  const tbody = document.getElementById('recent-transactions-tbody');
  if (!tbody) return;

  try {
    const res = await fetch('api/expenses.php?limit=6');
    const json = await res.json();

    if (json.success && json.data.length > 0) {
      renderRecentTransactionsTable(json.data);
    } else {
      renderRecentTransactionsTable(getDemoExpenses().slice(0, 6));
    }
  } catch (e) {
    renderRecentTransactionsTable(getDemoExpenses().slice(0, 6));
  }
}

function renderRecentTransactionsTable(expenses) {
  const tbody = document.getElementById('recent-transactions-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!expenses || expenses.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <i class="fa-solid fa-receipt"></i>
          <h4>No expenses found</h4>
          <p>Click "+ Add Expense" to log your first transaction</p>
        </td>
      </tr>
    `;
    return;
  }

  expenses.forEach((item, index) => {
    const cat = AppState.categories.find(c => c.id == item.category_id) || {
      name: item.category_name || 'General',
      icon: item.category_icon || 'fa-tags',
      color: item.category_color || '#6366f1'
    };

    const row = document.createElement('tr');
    row.className = `table-row-hover animate-fadeInUp delay-${Math.min(index + 1, 5)}`;
    row.innerHTML = `
      <td>
        <div class="table-title-cell">
          <div class="cat-avatar-icon" style="background-color: ${cat.color}20; color: ${cat.color};">
            <i class="fa-solid ${cat.icon}"></i>
          </div>
          <div>
            <span class="title-primary">${escapeHtml(item.title)}</span>
            <span class="title-sub">${escapeHtml(cat.name)}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="badge badge-outline">${escapeHtml(item.payment_method || 'UPI')}</span>
      </td>
      <td>
        <span style="font-size: 0.85rem; color: var(--text-muted);">${formatDate(item.expense_date)}</span>
      </td>
      <td class="amount-cell">
        - ${formatCurrency(item.amount)}
      </td>
      <td>
        <div class="actions-wrap">
          <button class="action-btn" title="Edit" onclick="editExpense(${item.id})">
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
          <button class="action-btn delete-btn" title="Delete" onclick="deleteExpense(${item.id})">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

window.editExpense = async function(id) {
  try {
    const res = await fetch(`api/expenses.php?id=${id}`);
    const json = await res.json();
    if (json.success && json.data) {
      openExpenseModal(json.data);
    } else {
      const demo = getDemoExpenses().find(i => i.id === id);
      if (demo) openExpenseModal(demo);
    }
  } catch (e) {
    const demo = getDemoExpenses().find(i => i.id === id);
    if (demo) openExpenseModal(demo);
  }
};

window.deleteExpense = async function(id) {
  if (!confirm('Are you sure you want to delete this expense?')) return;

  try {
    const res = await fetch(`api/expenses.php?action=delete&id=${id}`, { method: 'POST' });
    const json = await res.json();
    if (json.success) {
      showToast('success', 'Deleted', 'Expense deleted successfully.');
      window.dispatchEvent(new CustomEvent('expenseChanged'));
    } else {
      deleteDemoExpense(id);
    }
  } catch (e) {
    deleteDemoExpense(id);
  }
};

function loadFallbackDashboardData() {
  const expenses = getDemoExpenses();
  const total = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySpent = expenses
    .filter(i => i.expense_date === todayStr)
    .reduce((sum, i) => sum + parseFloat(i.amount), 0);

  const totalBudget = AppState.totalBudget || 30000;
  const allocations = JSON.parse(localStorage.getItem('demo_budgets') || '{}');

  const summary = {
    total_spent: total,
    today_spent: todaySpent,
    daily_average: (total / Math.max(1, new Date().getDate())).toFixed(2),
    percent_change: 8.4,
    highest_expense: expenses.reduce((max, i) => (parseFloat(i.amount) > (max ? max.amount : 0) ? i : max), null)
  };

  const budget = {
    total_budget: totalBudget,
    remaining: Math.max(0, totalBudget - total),
    safe_daily_spend: Math.round(Math.max(0, totalBudget - total) / (30 - new Date().getDate() + 1))
  };

  renderDashboardSummary(summary, budget);

  const catMap = {};
  expenses.forEach(item => {
    catMap[item.category_id] = (catMap[item.category_id] || 0) + parseFloat(item.amount);
  });

  const categories = AppState.categories.map(c => {
    const limit = allocations[c.id] || Math.round((totalBudget * c.p50) / 100);
    const spent = catMap[c.id] || 0;
    return {
      category_name: c.name,
      category_icon: c.icon,
      category_color: c.color,
      total_amount: spent,
      percentage: total > 0 ? ((spent / total) * 100).toFixed(1) : 0,
      budget_limit: limit,
      budget_usage: limit > 0 ? Math.round((spent / limit) * 100) : 0
    };
  });

  renderCategoryChart(categories, total);

  const labels = [];
  const amounts = [];
  for (let i = 1; i <= 30; i++) {
    labels.push(`Day ${i}`);
    amounts.push(Math.floor(Math.random() * 800) + 100);
  }
  renderDailyTrendChart({ labels, amounts });

  const history = [
    { month_label: 'May', monthly_total: 18500 },
    { month_label: 'Jun', monthly_total: 21300 },
    { month_label: 'Jul', monthly_total: 19800 },
    { month_label: 'Aug', monthly_total: 24100 },
    { month_label: 'Sep', monthly_total: 20500 },
    { month_label: 'Oct', monthly_total: total }
  ];
  renderMonthlyHistoryChart(history);
  renderBudgetProgressWidget(categories);
  renderRecentTransactionsTable(expenses.slice(0, 6));
}
