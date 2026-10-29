/**
 * Personal Expense Tracker - Expenses Page Logic & Filtering
 */

let currentFilters = {
  search: '',
  category_id: '',
  payment_method: 'all',
  period: 'all',
  date_from: '',
  date_to: '',
  sort_by: 'expense_date',
  order: 'DESC',
  page: 1,
  limit: 15
};

let debounceTimer = null;
let currentExpensesData = [];

document.addEventListener('DOMContentLoaded', () => {
  initExpensesPage();

  window.addEventListener('expenseChanged', () => {
    fetchExpenses();
  });
});

function initExpensesPage() {
  const searchInput = document.getElementById('filter-search');
  const categorySelect = document.getElementById('filter-category');
  const paymentSelect = document.getElementById('filter-payment');
  const sortSelect = document.getElementById('filter-sort');
  const periodChips = document.querySelectorAll('.filter-period-chip');
  const exportBtn = document.getElementById('export-expenses-csv-btn');

  // Search Debounce
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentFilters.search = e.target.value.trim();
        currentFilters.page = 1;
        fetchExpenses();
      }, 350);
    });
  }

  // Category Filter
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      currentFilters.category_id = e.target.value;
      currentFilters.page = 1;
      fetchExpenses();
    });
  }

  // Payment Filter
  if (paymentSelect) {
    paymentSelect.addEventListener('change', (e) => {
      currentFilters.payment_method = e.target.value;
      currentFilters.page = 1;
      fetchExpenses();
    });
  }

  // Sort Filter
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const [sortBy, order] = e.target.value.split(':');
      currentFilters.sort_by = sortBy;
      currentFilters.order = order;
      fetchExpenses();
    });
  }

  // Period Chips
  periodChips.forEach(chip => {
    chip.addEventListener('click', () => {
      periodChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilters.period = chip.dataset.period;
      currentFilters.page = 1;
      fetchExpenses();
    });
  });

  // Export to CSV
  if (exportBtn) {
    exportBtn.addEventListener('click', exportExpensesToCSV);
  }

  // Initial Fetch
  fetchExpenses();
}

/**
 * Fetch expenses from API or fallback
 */
async function fetchExpenses() {
  const params = new URLSearchParams();
  if (currentFilters.search) params.append('search', currentFilters.search);
  if (currentFilters.category_id) params.append('category_id', currentFilters.category_id);
  if (currentFilters.payment_method && currentFilters.payment_method !== 'all') {
    params.append('payment_method', currentFilters.payment_method);
  }
  if (currentFilters.period && currentFilters.period !== 'all') {
    params.append('period', currentFilters.period);
  }
  params.append('sort_by', currentFilters.sort_by);
  params.append('order', currentFilters.order);
  params.append('page', currentFilters.page);
  params.append('limit', currentFilters.limit);

  try {
    const res = await fetch(`api/expenses.php?${params.toString()}`);
    const json = await res.json();

    if (json.success) {
      currentExpensesData = json.data;
      renderExpensesTable(json.data);
      renderPagination(json.pagination);
      updateFilteredStats(json.data, json.pagination.total);
    } else {
      fetchFallbackExpenses();
    }
  } catch (e) {
    fetchFallbackExpenses();
  }
}

/**
 * Render Expense Rows into Table
 */
function renderExpensesTable(expenses) {
  const tbody = document.getElementById('expenses-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!expenses || expenses.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <i class="fa-solid fa-receipt"></i>
          <h4>No expenses found</h4>
          <p>Try clearing filters or search term</p>
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
    row.className = `table-row-hover animate-fadeInUp delay-${Math.min((index % 5) + 1, 5)}`;
    row.innerHTML = `
      <td>
        <div class="table-title-cell">
          <div class="cat-avatar-icon" style="background-color: ${cat.color}20; color: ${cat.color};">
            <i class="fa-solid ${cat.icon}"></i>
          </div>
          <div>
            <span class="title-primary">${escapeHtml(item.title)}</span>
            ${item.notes ? `<span class="title-sub">${escapeHtml(item.notes)}</span>` : ''}
          </div>
        </div>
      </td>
      <td>
        <span class="badge" style="background-color: ${cat.color}20; color: ${cat.color};">
          <i class="fa-solid ${cat.icon}"></i> ${escapeHtml(cat.name)}
        </span>
      </td>
      <td>
        <span class="badge badge-outline">${escapeHtml(item.payment_method)}</span>
      </td>
      <td>
        <span style="font-size: 0.85rem; color: var(--text-muted);">${formatDate(item.expense_date)}</span>
      </td>
      <td class="amount-cell">
        - ${formatCurrency(item.amount)}
      </td>
      <td>
        <div class="actions-wrap">
          <button class="action-btn" title="Edit Expense" onclick="editExpense(${item.id})">
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
          <button class="action-btn delete-btn" title="Delete Expense" onclick="deleteExpense(${item.id})">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Render Pagination Controls
 */
function renderPagination(pagination) {
  const container = document.getElementById('pagination-container');
  if (!container || !pagination) return;

  const { page, total_pages, total } = pagination;
  if (total_pages <= 1) {
    container.innerHTML = `<span style="font-size: 0.82rem; color: var(--text-muted);">Showing all ${total} entries</span>`;
    return;
  }

  let html = `
    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-top: 16px;">
      <span style="font-size: 0.82rem; color: var(--text-muted);">
        Page ${page} of ${total_pages} (${total} total)
      </span>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-secondary btn-sm" ${page <= 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : `onclick="changePage(${page - 1})"`}>
          <i class="fa-solid fa-chevron-left"></i> Prev
        </button>
        <button class="btn btn-secondary btn-sm" ${page >= total_pages ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : `onclick="changePage(${page + 1})"`}>
          Next <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

window.changePage = function(newPage) {
  currentFilters.page = newPage;
  fetchExpenses();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function updateFilteredStats(expenses, totalCount) {
  const countEl = document.getElementById('filtered-count');
  const sumEl = document.getElementById('filtered-sum');

  if (countEl) countEl.textContent = `${totalCount || expenses.length} expenses`;
  if (sumEl) {
    const sum = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    sumEl.textContent = formatCurrency(sum);
  }
}

/**
 * Export current filtered expenses as CSV
 */
function exportExpensesToCSV() {
  if (!currentExpensesData || currentExpensesData.length === 0) {
    showToast('error', 'Export Failed', 'No expenses to export.');
    return;
  }

  const headers = ['ID', 'Title', 'Category', 'Amount', 'Date', 'Payment Method', 'Notes'];
  const rows = currentExpensesData.map(item => {
    const cat = AppState.categories.find(c => c.id == item.category_id);
    return [
      item.id,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${(cat ? cat.name : item.category_name || '').replace(/"/g, '""')}"`,
      parseFloat(item.amount).toFixed(2),
      item.expense_date,
      item.payment_method,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Expenses_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('success', 'Export Complete', 'Expenses CSV downloaded successfully!');
}

/**
 * Fallback for offline demo mode
 */
function fetchFallbackExpenses() {
  let list = getDemoExpenses();

  if (currentFilters.search) {
    const q = currentFilters.search.toLowerCase();
    list = list.filter(i => i.title.toLowerCase().includes(q) || (i.notes && i.notes.toLowerCase().includes(q)));
  }

  if (currentFilters.category_id) {
    list = list.filter(i => i.category_id == currentFilters.category_id);
  }

  if (currentFilters.payment_method && currentFilters.payment_method !== 'all') {
    list = list.filter(i => i.payment_method === currentFilters.payment_method);
  }

  currentExpensesData = list;
  renderExpensesTable(list);
  renderPagination({ page: 1, total_pages: 1, total: list.length });
  updateFilteredStats(list, list.length);
}

