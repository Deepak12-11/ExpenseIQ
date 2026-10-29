<?php
/**
 * Reports & Visualizations API Endpoint
 * Scoped strictly by user_id to prevent any cross-user data leakage
 */

require_once __DIR__ . '/../config/db.php';

$pdo = getDBConnection();
$userId = getCurrentUserId();

if (!$pdo) {
    jsonResponse([
        'success' => false,
        'status' => 'db_offline',
        'message' => 'Database connection failed.',
        'data' => null
    ], 503);
}

$month = isset($_GET['month']) && preg_match('/^\d{4}-\d{2}$/', $_GET['month']) 
    ? $_GET['month'] 
    : date('Y-m');

$year = (int)substr($month, 0, 4);
$monthNum = (int)substr($month, 5, 2);
$daysInMonth = cal_days_in_month(CAL_GREGORIAN, $monthNum, $year);

// 1. Current Month Summary Metrics for this user
$summaryStmt = $pdo->prepare("
    SELECT 
        COALESCE(SUM(amount), 0) AS total_spent,
        COUNT(id) AS total_count,
        COALESCE(MAX(amount), 0) AS max_expense,
        COALESCE(MIN(amount), 0) AS min_expense
    FROM expenses
    WHERE DATE_FORMAT(expense_date, '%Y-%m') = ? AND user_id = ?
");
$summaryStmt->execute([$month, $userId]);
$summary = $summaryStmt->fetch();

$totalSpent = (float)$summary['total_spent'];
$totalCount = (int)$summary['total_count'];
$maxExpense = (float)$summary['max_expense'];

// Calculate days elapsed for daily average
$currentMonth = date('Y-m');
if ($month === $currentMonth) {
    $daysElapsed = max(1, (int)date('j'));
    $daysLeft = max(1, $daysInMonth - (int)date('j') + 1);
} else {
    $daysElapsed = $daysInMonth;
    $daysLeft = 1;
}
$dailyAverage = $totalSpent > 0 ? round($totalSpent / $daysElapsed, 2) : 0;

// 2. Total Monthly Budget for user
$ubStmt = $pdo->prepare("SELECT total_budget, budget_strategy FROM user_monthly_budgets WHERE user_id = ? AND month = ?");
$ubStmt->execute([$userId, $month]);
$ubRow = $ubStmt->fetch();
$totalBudget = $ubRow ? (float)$ubRow['total_budget'] : 30000.00;
$budgetStrategy = $ubRow ? $ubRow['budget_strategy'] : '50-30-20';

$remainingBudget = max(0, $totalBudget - $totalSpent);
$safeDailySpend = round($remainingBudget / $daysLeft, 2);
$budgetUtilization = $totalBudget > 0 ? round(($totalSpent / $totalBudget) * 100, 1) : 0;

// 3. Previous Month Comparison
$prevMonth = date('Y-m', strtotime($month . '-01 -1 month'));
$prevStmt = $pdo->prepare("
    SELECT COALESCE(SUM(amount), 0) AS prev_total
    FROM expenses
    WHERE DATE_FORMAT(expense_date, '%Y-%m') = ? AND user_id = ?
");
$prevStmt->execute([$prevMonth, $userId]);
$prevSpent = (float)$prevStmt->fetch()['prev_total'];

$percentChange = 0;
if ($prevSpent > 0) {
    $percentChange = round((($totalSpent - $prevSpent) / $prevSpent) * 100, 1);
}

// 4. Today's Expenses for current user
$todayStmt = $pdo->prepare("
    SELECT COALESCE(SUM(amount), 0) AS today_spent
    FROM expenses
    WHERE expense_date = CURRENT_DATE() AND user_id = ?
");
$todayStmt->execute([$userId]);
$todaySpent = (float)$todayStmt->fetch()['today_spent'];

// 5. Highest Expense Details
$highestStmt = $pdo->prepare("
    SELECT e.title, e.amount, e.expense_date, c.name AS category_name, c.color AS category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE DATE_FORMAT(e.expense_date, '%Y-%m') = ? AND e.user_id = ?
    ORDER BY e.amount DESC
    LIMIT 1
");
$highestStmt->execute([$month, $userId]);
$highestExpense = $highestStmt->fetch() ?: null;

// 6. Category Breakdown with user limits
$catStmt = $pdo->prepare("
    SELECT 
        c.id,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        COALESCE(SUM(e.amount), 0) AS total_amount,
        COUNT(e.id) AS transaction_count,
        b.monthly_limit AS budget_limit
    FROM categories c
    LEFT JOIN expenses e ON c.id = e.category_id AND DATE_FORMAT(e.expense_date, '%Y-%m') = ? AND e.user_id = ?
    LEFT JOIN budgets b ON c.id = b.category_id AND b.month = ? AND b.user_id = ?
    GROUP BY c.id, c.name, c.icon, c.color, b.monthly_limit
    ORDER BY total_amount DESC
");
$catStmt->execute([$month, $userId, $month, $userId]);
$categoryBreakdown = $catStmt->fetchAll();

foreach ($categoryBreakdown as &$cat) {
    $catAmount = (float)$cat['total_amount'];
    $cat['total_amount'] = $catAmount;
    $cat['transaction_count'] = (int)$cat['transaction_count'];
    $cat['percentage'] = $totalSpent > 0 ? round(($catAmount / $totalSpent) * 100, 1) : 0;
    $cat['budget_limit'] = $cat['budget_limit'] !== null ? (float)$cat['budget_limit'] : 0;
    $cat['budget_usage'] = ($cat['budget_limit'] > 0) ? round(($catAmount / $cat['budget_limit']) * 100, 1) : null;
}
unset($cat);

// 7. Daily Spending Timeline
$dailyStmt = $pdo->prepare("
    SELECT 
        DAY(expense_date) AS day_num,
        COALESCE(SUM(amount), 0) AS day_total,
        COUNT(id) AS transaction_count
    FROM expenses
    WHERE DATE_FORMAT(expense_date, '%Y-%m') = ? AND user_id = ?
    GROUP BY DAY(expense_date)
    ORDER BY day_num ASC
");
$dailyStmt->execute([$month, $userId]);
$dailyRows = $dailyStmt->fetchAll();

$dailyMap = [];
foreach ($dailyRows as $row) {
    $dailyMap[(int)$row['day_num']] = [
        'amount' => (float)$row['day_total'],
        'count' => (int)$row['transaction_count']
    ];
}

$dailyLabels = [];
$dailyAmounts = [];
$dailyCounts = [];
for ($d = 1; $d <= $daysInMonth; $d++) {
    $dailyLabels[] = date('M j', strtotime("$year-$monthNum-$d"));
    $dailyAmounts[] = isset($dailyMap[$d]) ? $dailyMap[$d]['amount'] : 0;
    $dailyCounts[] = isset($dailyMap[$d]) ? $dailyMap[$d]['count'] : 0;
}

// 8. 6 Months Historical Trend
$historyStmt = $pdo->prepare("
    SELECT 
        DATE_FORMAT(expense_date, '%Y-%m') AS ym,
        DATE_FORMAT(expense_date, '%b %Y') AS month_label,
        COALESCE(SUM(amount), 0) AS monthly_total
    FROM expenses
    WHERE expense_date >= DATE_SUB(CONCAT(?, '-01'), INTERVAL 5 MONTH)
      AND expense_date <= LAST_DAY(CONCAT(?, '-01'))
      AND user_id = ?
    GROUP BY ym, month_label
    ORDER BY ym ASC
");
$historyStmt->execute([$month, $month, $userId]);
$historyRows = $historyStmt->fetchAll();

// 9. Payment Methods
$payStmt = $pdo->prepare("
    SELECT 
        payment_method,
        COALESCE(SUM(amount), 0) AS total_amount,
        COUNT(id) AS count
    FROM expenses
    WHERE DATE_FORMAT(expense_date, '%Y-%m') = ? AND user_id = ?
    GROUP BY payment_method
    ORDER BY total_amount DESC
");
$payStmt->execute([$month, $userId]);
$paymentMethods = $payStmt->fetchAll();

jsonResponse([
    'success' => true,
    'month' => $month,
    'month_name' => date('F Y', strtotime($month . '-01')),
    'budget' => [
        'total_budget' => $totalBudget,
        'remaining' => $remainingBudget,
        'utilization' => $budgetUtilization,
        'safe_daily_spend' => $safeDailySpend,
        'days_left' => $daysLeft,
        'strategy' => $budgetStrategy
    ],
    'summary' => [
        'total_spent' => $totalSpent,
        'total_count' => $totalCount,
        'daily_average' => $dailyAverage,
        'max_expense' => $maxExpense,
        'prev_spent' => $prevSpent,
        'percent_change' => $percentChange,
        'today_spent' => $todaySpent,
        'highest_expense' => $highestExpense
    ],
    'categories' => $categoryBreakdown,
    'daily_trend' => [
        'labels' => $dailyLabels,
        'amounts' => $dailyAmounts,
        'counts' => $dailyCounts
    ],
    'monthly_history' => $historyRows,
    'payment_methods' => $paymentMethods
]);
