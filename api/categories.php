<?php
/**
 * Categories API Endpoint
 */

require_once __DIR__ . '/../config/db.php';

$pdo = getDBConnection();

if (!$pdo) {
    jsonResponse([
        'success' => false,
        'status' => 'db_offline',
        'message' => 'Database connection failed.',
        'data' => []
    ], 503);
}

try {
    $stmt = $pdo->query("SELECT id, name, icon, color FROM categories ORDER BY id ASC");
    $categories = $stmt->fetchAll();

    jsonResponse([
        'success' => true,
        'data' => $categories
    ]);
} catch (PDOException $e) {
    jsonResponse([
        'success' => false,
        'message' => 'Error fetching categories: ' . $e->getMessage()
    ], 500);
}

