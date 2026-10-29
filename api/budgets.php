<?php
/**
 * Budgets API Endpoint
 * Handles Overall Monthly Budget & Category-level Allocations
 * Scoped by authenticated user for strict data isolation
 */

require_once __DIR__ . '/../config/db.php';

$pdo = getDBConnection();
$userId = getCurrentUserId();
$method = $_SERVER['REQUEST_METHOD'];

if (!$pdo) {
    jsonResponse([
        'success' => false,
        'status' => 'db_offline',
        'message' => 'Database connection failed.',
        'data' => []
    ], 503);
}

$month = isset($_GET['month']) && preg_match('/^\d{4}-\d{2}$/', $_GET['month']) 
    ? $_GET['month'] 
    : date('Y-m');

if ($method === 'GET') {
    handleGetBudgets($pdo, $userId, $month);
} elseif ($method === 'POST') {
    handleSaveBudgets($pdo, $userId, $month);
} else {
    jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

/**
 * Handle GET: Retrieve Total Monthly Budget & Category Allocations
 */
function handleGetBudgets($pdo, $userId, $month) {
    // 1. Fetch user's overall monthly budget
    $userBudgetStmt = $pdo->prepare("
        SELECT total_budget, budget_strategy 
        FROM user_monthly_budgets 
        WHERE user_id = ? AND month = ?
    ");
    $userBudgetStmt->execute([$userId, $month]);
    $userBudgetRow = $userBudgetStmt->fetch();

    $totalBudget = $userBudgetRow ? (float)$userBudgetRow['total_budget'] : 30000.00;
    $strategy = $userBudgetRow ? $userBudgetRow['budget_strategy'] : '50-30-20';

    // 2. Fetch category budgets with actual spending for current user
    $catStmt = $pdo->prepare("
        SELECT 
            c.id AS category_id,
            c.name AS category_name,
            c.icon AS category_icon,
            c.color AS category_color,
            c.default_percentage,
            COALESCE(b.monthly_limit, 0) AS monthly_limit,
            COALESCE(SUM(e.amount), 0) AS current_spent
        FROM categories c
        LEFT JOIN budgets b ON c.id = b.category_id AND b.month = ? AND b.user_id = ?
        LEFT JOIN expenses e ON c.id = e.category_id AND DATE_FORMAT(e.expense_date, '%Y-%m') = ? AND e.user_id = ?
        GROUP BY c.id, c.name, c.icon, c.color, c.default_percentage, b.monthly_limit
        ORDER BY c.id ASC
    ");
    $catStmt->execute([$month, $userId, $month, $userId]);
    $budgets = $catStmt->fetchAll();

    $totalSpent = 0;
    $totalAllocated = 0;

    foreach ($budgets as &$b) {
        $limit = (float)$b['monthly_limit'];
        $spent = (float)$b['current_spent'];
        $b['monthly_limit'] = $limit;
        $b['current_spent'] = $spent;
        $b['remaining'] = max(0, $limit - $spent);
        $b['percentage'] = $limit > 0 ? round(($spent / $limit) * 100, 1) : 0;
        $b['is_over_budget'] = $limit > 0 && ($spent > $limit);

        $totalSpent += $spent;
        $totalAllocated += $limit;
    }
    unset($b);

    // Days left in month for safe daily spend calculation
    $year = (int)substr($month, 0, 4);
    $monthNum = (int)substr($month, 5, 2);
    $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $monthNum, $year);
    $isCurrentMonth = ($month === date('Y-m'));
    $currentDay = $isCurrentMonth ? (int)date('j') : $daysInMonth;
    $daysLeft = max(1, $daysInMonth - $currentDay + 1);

    $remainingBudget = max(0, $totalBudget - $totalSpent);
    $safeDailySpend = round($remainingBudget / $daysLeft, 2);

    jsonResponse([
        'success' => true,
        'month' => $month,
        'overview' => [
            'total_budget' => $totalBudget,
            'total_spent' => $totalSpent,
            'total_allocated' => $totalAllocated,
            'remaining_budget' => $remainingBudget,
            'days_left' => $daysLeft,
            'safe_daily_spend' => $safeDailySpend,
            'budget_strategy' => $strategy,
            'utilization_rate' => $totalBudget > 0 ? round(($totalSpent / $totalBudget) * 100, 1) : 0
        ],
        'data' => $budgets
    ]);
}

/**
 * Handle POST: Set Total Budget with Auto-Allocation or Update Single Category
 */
function handleSaveBudgets($pdo, $userId, $month) {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $action = $input['action'] ?? 'single_update';

    if ($action === 'set_total_budget') {
        // User sets their overall monthly budget and auto-distributes
        $totalBudget = filter_var($input['total_budget'] ?? 0, FILTER_VALIDATE_FLOAT);
        $strategy = cleanInput($input['strategy'] ?? '50-30-20');
        $allocations = $input['allocations'] ?? [];

        if ($totalBudget === false || $totalBudget <= 0) {
            jsonResponse(['success' => false, 'message' => 'Please provide a valid total budget amount.'], 400);
        }

        try {
            $pdo->beginTransaction();

            // 1. Upsert overall monthly budget
            $stmt = $pdo->prepare("
                INSERT INTO user_monthly_budgets (user_id, month, total_budget, budget_strategy)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE total_budget = VALUES(total_budget), budget_strategy = VALUES(budget_strategy)
            ");
            $stmt->execute([$userId, $month, $totalBudget, $strategy]);

            // 2. If explicit allocations provided, update each category
            if (!empty($allocations) && is_array($allocations)) {
                $catStmt = $pdo->prepare("
                    INSERT INTO budgets (user_id, category_id, month, monthly_limit)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE monthly_limit = VALUES(monthly_limit)
                ");

                foreach ($allocations as $catId => $limit) {
                    $catStmt->execute([$userId, (int)$catId, $month, (float)$limit]);
                }
            }

            $pdo->commit();

            jsonResponse([
                'success' => true,
                'message' => 'Monthly budget & allocations applied successfully!'
            ]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    } else {
        // Update single category limit
        $categoryId = filter_var($input['category_id'] ?? 0, FILTER_VALIDATE_INT);
        $limit = filter_var($input['monthly_limit'] ?? 0, FILTER_VALIDATE_FLOAT);

        if (!$categoryId || $limit === false || $limit < 0) {
            jsonResponse(['success' => false, 'message' => 'Invalid budget parameters.'], 400);
        }

        try {
            $stmt = $pdo->prepare("
                INSERT INTO budgets (user_id, category_id, month, monthly_limit)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE monthly_limit = VALUES(monthly_limit)
            ");
            $stmt->execute([$userId, $categoryId, $month, $limit]);

            jsonResponse([
                'success' => true,
                'message' => 'Category budget updated successfully!'
            ]);
        } catch (PDOException $e) {
            jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
}
