/**
 * Personal Expense Tracker - Monthly Reports & Data Visualizations
 */

let reportDailyChart = null;
let reportCategoryChart = null;
let reportPaymentChart = null;
let currentReportData = null;

document.addEventListener('DOMContentLoaded', () => {
  initReportsPage();
});

function initReportsPage() {
  const monthSelector = document.getElementById('report-month-select');
  const exportCsvBtn = document.getElementById('export-report-csv-btn');
  const printBtn = document.getElementById('print-report-btn');

  // Populate month picker with current and previous 12 months
  if (monthSelector) {
    populateMonthOptions(monthSelector);
    monthSelector.addEventListener('change', () => {
      loadMonthlyReport(monthSelector.value);
    });
  }

  // Export CSV
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportMonthlyReportCSV);
  }

  // Print / PDF
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Initial load with current month
  const initialMonth = monthSelector ? monthSelector.value : new Date().toISOString().slice(0, 7);
  loadMonthlyReport(initialMonth);
}

/**
 * Populate Month Selector Dropdown (e.g. October 2026, September 2026...)
 */
function populateMonthOptions(selectEl) {
  selectEl.innerHTML = '';
  const currentDate = new Date();

  for (let i = 0; i < 12; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const val = d.toISOString().slice(0, 7); // YYYY-MM
    const text = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = text;
    if (i === 0) opt.selected = true;
    selectEl.appendChild(opt);
  }
}

/**
 * Fetch and render monthly report data
 */
async function loadMonthlyReport(month) {
  try {
    const res = await fetch(`api/reports.php?month=${month}`);
    const json = await res.json();

    if (json.success) {
      currentReportData = json;
      renderReportMetrics(json.summary, json.month_name);
      renderReportCategoryTable(json.categories, json.summary.total_spent);
      renderReportDailyChart(json.daily_trend);
      renderReportCategoryChart(json.categories);
      renderReportPaymentChart(json.payment_methods);
    } else {
      loadFallbackReport(month);
    }
  } catch (e) {
    loadFallbackReport(month);
  }
}

/**
 * Render Top Summary KPI Cards for Report
 */
function renderReportMetrics(summary, monthName) {
  const titleEl = document.getElementById('report-period-title');
  if (titleEl) titleEl.textContent = `Financial Summary for ${monthName}`;

  animateCounter('report-total-spent', summary.total_spent);
  animateCounter('report-daily-avg', summary.daily_average);

  const countEl = document.getElementById('report-total-count');
  if (countEl) countEl.textContent = `${summary.total_count} transactions`;

  const maxEl = document.getElementById('report-max-expense');
  if (maxEl) maxEl.textContent = formatCurrency(summary.max_expense);

  // Growth / Comparison
  const compEl = document.getElementById('report-comparison-stat');
  if (compEl) {
    const pct = summary.percent_change;
    if (pct > 0) {
      compEl.innerHTML = `<span style="color: var(--danger); font-weight: 700;">+${pct}%</span> higher than previous month`;
    } else if (pct < 0) {
      compEl.innerHTML = `<span style="color: var(--success); font-weight: 700;">${pct}%</span> lower than previous month`;
    } else {
      compEl.innerHTML = `Identical to previous month`;
    }
  }
}

/**
 * Render Category Breakdown Progress Table
 */
function renderReportCategoryTable(categories, totalSpent) {
  const tbody = document.getElementById('report-category-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const activeCats = categories.filter(c => c.total_amount > 0);

  if (activeCats.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <i class="fa-solid fa-chart-pie"></i>
          <h4>No expenses recorded for this month</h4>
        </td>
      </tr>
    `;
    return;
  }

  activeCats.forEach((cat, index) => {
    const pct = cat.percentage;
    const row = document.createElement('tr');
    row.className = `table-row-hover animate-fadeInUp delay-${Math.min(index + 1, 5)}`;
    row.innerHTML = `
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="cat-dot" style="background-color: ${cat.category_color}; width: 12px; height: 12px;"></span>
          <span style="font-weight: 600; color: var(--text-primary);">${escapeHtml(cat.category_name)}</span>
        </div>
      </td>
      <td>${cat.transaction_count} items</td>
      <td style="font-weight: 700; color: var(--text-primary); font-family: 'Outfit', sans-serif;">
        ${formatCurrency(cat.total_amount)}
      </td>
      <td style="width: 35%;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="progress-track" style="margin-bottom: 0; flex: 1;">
            <div class="progress-bar-fill" style="width: ${pct}%; background-color: ${cat.category_color};"></div>
          </div>
          <span style="font-size: 0.78rem; font-weight: 700; width: 45px; text-align: right;">${pct}%</span>
        </div>
      </td>
      <td style="text-align: right;">
        <span class="badge ${cat.budget_usage > 100 ? 'progress-danger' : 'badge-outline'}">
          ${cat.budget_limit > 0 ? (cat.budget_usage > 100 ? 'Over Budget' : 'Within Budget') : 'No Limit'}
        </span>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Chart 1: Daily Expense Distribution Bar Chart
 */
function renderReportDailyChart(dailyTrend) {
  const canvas = document.getElementById('reportDailyChart');
  if (!canvas || !dailyTrend) return;

  const ctx = canvas.getContext('2d');
  const isDark = AppState.theme === 'dark';

  if (reportDailyChart) {
    reportDailyChart.destroy();
  }

  reportDailyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dailyTrend.labels,
      datasets: [{
        label: 'Daily Spend',
        data: dailyTrend.amounts,
        backgroundColor: '#6366f1',
        borderRadius: 6,
        hoverBackgroundColor: '#818cf8'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#f8fafc' : '#0f172a',
          bodyColor: isDark ? '#cbd5e1' : '#334155',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          padding: 10,
          callbacks: {
            label: (ctx) => ` Spent: ${formatCurrency(ctx.raw)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: isDark ? '#64748b' : '#94a3b8',
            maxTicksLimit: 12
          }
        },
        y: {
          grid: {
            color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)'
          },
          ticks: {
            color: isDark ? '#64748b' : '#94a3b8',
            callback: (v) => `${AppState.currency}${v}`
          }
        }
      },
      animation: {
        duration: 900,
        easing: 'easeOutQuart'
      }
    }
  });
}

/**
 * Chart 2: Category Breakdown Pie / Doughnut Chart
 */
function renderReportCategoryChart(categories) {
  const canvas = document.getElementById('reportCategoryChart');
  if (!canvas || !categories) return;

  const ctx = canvas.getContext('2d');
  const isDark = AppState.theme === 'dark';
  const activeCats = categories.filter(c => c.total_amount > 0);

  if (reportCategoryChart) {
    reportCategoryChart.destroy();
  }

  reportCategoryChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: activeCats.map(c => c.category_name),
      datasets: [{
        data: activeCats.map(c => c.total_amount),
        backgroundColor: activeCats.map(c => c.category_color),
        borderWidth: 2,
        borderColor: isDark ? '#111827' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: isDark ? '#cbd5e1' : '#334155',
            font: { size: 11 },
            boxWidth: 12
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}`
          }
        }
      }
    }
  });
}

/**
 * Chart 3: Payment Method Breakdown
 */
function renderReportPaymentChart(paymentMethods) {
  const canvas = document.getElementById('reportPaymentChart');
  if (!canvas || !paymentMethods) return;

  const ctx = canvas.getContext('2d');
  const isDark = AppState.theme === 'dark';

  if (reportPaymentChart) {
    reportPaymentChart.destroy();
  }

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

  reportPaymentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: paymentMethods.map(p => p.payment_method),
      datasets: [{
        data: paymentMethods.map(p => parseFloat(p.total_amount)),
        backgroundColor: colors.slice(0, paymentMethods.length),
        borderWidth: 2,
        borderColor: isDark ? '#111827' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isDark ? '#cbd5e1' : '#334155',
            font: { size: 11 },
            boxWidth: 12
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw)}`
          }
        }
      }
    }
  });
}

/**
 * Export Monthly Report as CSV
 */
function exportMonthlyReportCSV() {
  if (!currentReportData || !currentReportData.categories) {
    showToast('error', 'Export Failed', 'No report data available to export.');
    return;
  }

  const { month_name, summary, categories } = currentReportData;

  const lines = [
    `"Personal Expense Tracker - Monthly Financial Report"`,
    `"Report Period:", "${month_name}"`,
    `"Generated On:", "${new Date().toLocaleString()}"`,
    ``,
    `"SUMMARY METRICS"`,
    `"Total Expenses:","${summary.total_spent}"`,
    `"Total Transactions:","${summary.total_count}"`,
    `"Daily Average:","${summary.daily_average}"`,
    `"Highest Expense:","${summary.max_expense}"`,
    ``,
    `"CATEGORY BREAKDOWN"`,
    `"Category Name","Transactions","Total Spent (${AppState.currency})","Percentage (%)","Budget Limit"`
  ];

  categories.forEach(cat => {
    lines.push(`"${cat.category_name}",${cat.transaction_count},${cat.total_amount},${cat.percentage}%,${cat.budget_limit || 'N/A'}`);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Expense_Report_${currentReportData.month}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('success', 'Export Complete', `Monthly report for ${month_name} downloaded.`);
}

/**
 * Fallback Monthly Report Data
 */
function loadFallbackReport(month) {
  const expenses = getDemoExpenses();
  const total = expenses.reduce((s, i) => s + parseFloat(i.amount), 0);
  const count = expenses.length;
  const avg = count ? (total / 30).toFixed(2) : 0;
  const max = Math.max(...expenses.map(i => parseFloat(i.amount)));

  const catMap = {};
  const catCount = {};
  expenses.forEach(e => {
    catMap[e.category_id] = (catMap[e.category_id] || 0) + parseFloat(e.amount);
    catCount[e.category_id] = (catCount[e.category_id] || 0) + 1;
  });

  const categories = AppState.categories.map(c => ({
    category_name: c.name,
    category_color: c.color,
    total_amount: catMap[c.id] || 0,
    transaction_count: catCount[c.id] || 0,
    percentage: total > 0 ? (((catMap[c.id] || 0) / total) * 100).toFixed(1) : 0,
    budget_limit: 5000,
    budget_usage: Math.round(((catMap[c.id] || 0) / 5000) * 100)
  }));

  const mockDailyLabels = [];
  const mockDailyAmounts = [];
  for (let i = 1; i <= 30; i++) {
    mockDailyLabels.push(`Day ${i}`);
    mockDailyAmounts.push(Math.floor(Math.random() * 800) + 100);
  }

  const paymentMethods = [
    { payment_method: 'UPI', total_amount: total * 0.5 },
    { payment_method: 'Credit Card', total_amount: total * 0.3 },
    { payment_method: 'Debit Card', total_amount: total * 0.12 },
    { payment_method: 'Cash', total_amount: total * 0.08 }
  ];

  currentReportData = {
    month: month,
    month_name: 'October 2026',
    summary: {
      total_spent: total,
      total_count: count,
      daily_average: avg,
      max_expense: max,
      percent_change: 6.2
    },
    categories,
    daily_trend: { labels: mockDailyLabels, amounts: mockDailyAmounts },
    payment_methods: paymentMethods
  };

  renderReportMetrics(currentReportData.summary, currentReportData.month_name);
  renderReportCategoryTable(categories, total);
  renderReportDailyChart(currentReportData.daily_trend);
  renderReportCategoryChart(categories);
  renderReportPaymentChart(paymentMethods);
}

