<?php
/**
 * Expenses API Endpoint
 * Handles CRUD operations with strict User Data Isolation & Security
 */

require_once __DIR__ . '/../config/db.php';

$pdo = getDBConnection();
$userId = getCurrentUserId();
$method = $_SERVER['REQUEST_METHOD'];

// Method overrides for PUT/DELETE
if ($method === 'POST') {
    if (isset($_POST['_method'])) {
        $method = strtoupper($_POST['_method']);
    } elseif (isset($_GET['action'])) {
        if ($_GET['action'] === 'delete') $method = 'DELETE';
        if ($_GET['action'] === 'update') $method = 'PUT';
    }
}

if (!$pdo) {
    jsonResponse([
        'success' => false,
        'status' => 'db_offline',
        'message' => 'Database connection failed. Please ensure MySQL is running.',
        'data' => []
    ], 503);
}

switch ($method) {
    case 'GET':
        handleGetExpenses($pdo, $userId);
        break;

    case 'POST':
        handleAddExpense($pdo, $userId);
        break;

    case 'PUT':
        handleUpdateExpense($pdo, $userId);
        break;

    case 'DELETE':
        handleDeleteExpense($pdo, $userId);
        break;

    default:
        jsonResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

/**
 * Handle GET: Scoped strictly by user_id
 */
function handleGetExpenses($pdo, $userId) {
    // If fetching single expense by ID
    if (isset($_GET['id']) && is_numeric($_GET['id'])) {
        $stmt = $pdo->prepare("
            SELECT e.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
            FROM expenses e
            JOIN categories c ON e.category_id = c.id
            WHERE e.id = ? AND e.user_id = ?
        ");
        $stmt->execute([(int)$_GET['id'], $userId]);
        $expense = $stmt->fetch();

        if ($expense) {
            jsonResponse(['success' => true, 'data' => $expense]);
        } else {
            jsonResponse(['success' => false, 'message' => 'Expense not found or unauthorized'], 404);
        }
    }

    $sql = "
        SELECT e.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
        FROM expenses e
        JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = ?
    ";
    $params = [$userId];

    // Search filter
    if (!empty($_GET['search'])) {
        $sql .= " AND (e.title LIKE ? OR e.notes LIKE ?)";
        $searchTerm = '%' . trim($_GET['search']) . '%';
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    // Category filter
    if (!empty($_GET['category_id']) && is_numeric($_GET['category_id'])) {
        $sql .= " AND e.category_id = ?";
        $params[] = (int)$_GET['category_id'];
    }

    // Payment method filter
    if (!empty($_GET['payment_method']) && $_GET['payment_method'] !== 'all') {
        $sql .= " AND e.payment_method = ?";
        $params[] = trim($_GET['payment_method']);
    }

    // Date range filter
    if (!empty($_GET['period'])) {
        $period = $_GET['period'];
        if ($period === 'today') {
            $sql .= " AND e.expense_date = CURRENT_DATE()";
        } elseif ($period === 'this_week') {
            $sql .= " AND YEARWEEK(e.expense_date, 1) = YEARWEEK(CURRENT_DATE(), 1)";
        } elseif ($period === 'this_month') {
            $sql .= " AND DATE_FORMAT(e.expense_date, '%Y-%m') = DATE_FORMAT(CURRENT_DATE(), '%Y-%m')";
        } elseif ($period === 'last_month') {
            $sql .= " AND DATE_FORMAT(e.expense_date, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), '%Y-%m')";
        }
    } elseif (!empty($_GET['date_from']) && !empty($_GET['date_to'])) {
        $sql .= " AND e.expense_date BETWEEN ? AND ?";
        $params[] = $_GET['date_from'];
        $params[] = $_GET['date_to'];
    } elseif (!empty($_GET['month'])) {
        $sql .= " AND DATE_FORMAT(e.expense_date, '%Y-%m') = ?";
        $params[] = $_GET['month'];
    }

    // Total count for pagination
    $countSql = preg_replace('/SELECT\s+.*?\s+FROM/is', 'SELECT COUNT(*) as total FROM', $sql);
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $totalCount = (int)$countStmt->fetch()['total'];

    // Sorting
    $allowedSort = ['expense_date' => 'e.expense_date', 'amount' => 'e.amount', 'title' => 'e.title', 'id' => 'e.id'];
    $sortBy = isset($_GET['sort_by']) && isset($allowedSort[$_GET['sort_by']]) ? $allowedSort[$_GET['sort_by']] : 'e.expense_date';
    $order = (isset($_GET['order']) && strtoupper($_GET['order']) === 'ASC') ? 'ASC' : 'DESC';
    $sql .= " ORDER BY {$sortBy} {$order}, e.id DESC";

    // Pagination
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 20;
    $offset = ($page - 1) * $limit;

    $sql .= " LIMIT {$limit} OFFSET {$offset}";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $expenses = $stmt->fetchAll();

    jsonResponse([
        'success' => true,
        'data' => $expenses,
        'pagination' => [
            'total' => $totalCount,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($totalCount / $limit)
        ]
    ]);
}

/**
 * Handle POST: Insert with user_id binding
 */
function handleAddExpense($pdo, $userId) {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $title = cleanInput($input['title'] ?? '');
    $amount = filter_var($input['amount'] ?? 0, FILTER_VALIDATE_FLOAT);
    $categoryId = filter_var($input['category_id'] ?? 0, FILTER_VALIDATE_INT);
    $expenseDate = cleanInput($input['expense_date'] ?? date('Y-m-d'));
    $paymentMethod = cleanInput($input['payment_method'] ?? 'UPI');
    $notes = cleanInput($input['notes'] ?? '');

    $errors = [];
    if (empty($title)) $errors[] = 'Title is required.';
    if ($amount === false || $amount <= 0) $errors[] = 'Amount must be greater than zero.';
    if ($categoryId <= 0) $errors[] = 'Valid category is required.';
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $expenseDate)) $errors[] = 'Valid date (YYYY-MM-DD) is required.';

    if (!empty($errors)) {
        jsonResponse(['success' => false, 'errors' => $errors, 'message' => $errors[0]], 400);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO expenses (user_id, title, amount, category_id, expense_date, payment_method, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $title, $amount, $categoryId, $expenseDate, $paymentMethod, $notes]);
        $newId = $pdo->lastInsertId();

        $fetchStmt = $pdo->prepare("
            SELECT e.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
            FROM expenses e
            JOIN categories c ON e.category_id = c.id
            WHERE e.id = ? AND e.user_id = ?
        ");
        $fetchStmt->execute([$newId, $userId]);
        $newExpense = $fetchStmt->fetch();

        jsonResponse([
            'success' => true,
            'message' => 'Expense added successfully!',
            'data' => $newExpense
        ], 201);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Handle PUT: Update strictly where user_id matches
 */
function handleUpdateExpense($pdo, $userId) {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $id = filter_var($input['id'] ?? ($_GET['id'] ?? 0), FILTER_VALIDATE_INT);
    $title = cleanInput($input['title'] ?? '');
    $amount = filter_var($input['amount'] ?? 0, FILTER_VALIDATE_FLOAT);
    $categoryId = filter_var($input['category_id'] ?? 0, FILTER_VALIDATE_INT);
    $expenseDate = cleanInput($input['expense_date'] ?? date('Y-m-d'));
    $paymentMethod = cleanInput($input['payment_method'] ?? 'UPI');
    $notes = cleanInput($input['notes'] ?? '');

    if (!$id || $id <= 0) {
        jsonResponse(['success' => false, 'message' => 'Valid Expense ID required.'], 400);
    }

    $errors = [];
    if (empty($title)) $errors[] = 'Title is required.';
    if ($amount === false || $amount <= 0) $errors[] = 'Valid positive amount required.';
    if ($categoryId <= 0) $errors[] = 'Category required.';
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $expenseDate)) $errors[] = 'Valid date required.';

    if (!empty($errors)) {
        jsonResponse(['success' => false, 'errors' => $errors, 'message' => $errors[0]], 400);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE expenses
            SET title = ?, amount = ?, category_id = ?, expense_date = ?, payment_method = ?, notes = ?
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$title, $amount, $categoryId, $expenseDate, $paymentMethod, $notes, $id, $userId]);

        if ($stmt->rowCount() === 0) {
            // Check if record exists
            $check = $pdo->prepare("SELECT id FROM expenses WHERE id = ?");
            $check->execute([$id]);
            if ($check->rowCount() > 0) {
                // Exists but different user! Unauthorized!
                jsonResponse(['success' => false, 'message' => 'Unauthorized action.'], 403);
            }
        }

        $fetchStmt = $pdo->prepare("
            SELECT e.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
            FROM expenses e
            JOIN categories c ON e.category_id = c.id
            WHERE e.id = ? AND e.user_id = ?
        ");
        $fetchStmt->execute([$id, $userId]);
        $updated = $fetchStmt->fetch();

        jsonResponse([
            'success' => true,
            'message' => 'Expense updated successfully!',
            'data' => $updated
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}

/**
 * Handle DELETE: Scoped by user_id
 */
function handleDeleteExpense($pdo, $userId) {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $id = filter_var($input['id'] ?? ($_GET['id'] ?? 0), FILTER_VALIDATE_INT);

    if (!$id || $id <= 0) {
        jsonResponse(['success' => false, 'message' => 'Invalid Expense ID.'], 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $userId]);

        if ($stmt->rowCount() > 0) {
            jsonResponse(['success' => true, 'message' => 'Expense deleted successfully.']);
        } else {
            jsonResponse(['success' => false, 'message' => 'Expense not found or unauthorized.'], 404);
        }
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Database error: ' . $e->getMessage()], 500);
    }
}
