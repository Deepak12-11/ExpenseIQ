-- ========================================================
-- Personal Expense Tracker Database Schema & Seed Data
-- Hardened for Multi-User Data Isolation & Security
-- ========================================================

CREATE DATABASE IF NOT EXISTS `expense_tracker` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `expense_tracker`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `budgets`;
DROP TABLE IF EXISTS `user_monthly_budgets`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Table: users (Data Isolation & Authentication)
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `default_monthly_budget` DECIMAL(10, 2) NOT NULL DEFAULT 25000.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: categories
-- --------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `icon` VARCHAR(50) NOT NULL DEFAULT 'fa-tags',
  `color` VARCHAR(20) NOT NULL DEFAULT '#6366f1',
  `default_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: user_monthly_budgets (User's overall monthly income/budget)
-- --------------------------------------------------------
CREATE TABLE `user_monthly_budgets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL DEFAULT 1,
  `month` VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  `total_budget` DECIMAL(10, 2) NOT NULL DEFAULT 25000.00,
  `budget_strategy` VARCHAR(50) NOT NULL DEFAULT '50-30-20',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_month` (`user_id`, `month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: budgets (Category-level limits per user & month)
-- --------------------------------------------------------
CREATE TABLE `budgets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL DEFAULT 1,
  `category_id` INT NOT NULL,
  `month` VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  `monthly_limit` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_cat_month` (`user_id`, `category_id`, `month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table: expenses (Strictly isolated by user_id)
-- --------------------------------------------------------
CREATE TABLE `expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL DEFAULT 1,
  `title` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `category_id` INT NOT NULL,
  `expense_date` DATE NOT NULL,
  `payment_method` ENUM('UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking') NOT NULL DEFAULT 'UPI',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_date` (`user_id`, `expense_date`),
  INDEX `idx_user_cat` (`user_id`, `category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Seed Data: Default Demo User
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `default_monthly_budget`) VALUES
(1, 'StudentDev', 'student@example.com', '$2y$10$wE8wB2VfWl1o5y4d1q4s5Oe2wW8sK1L8d5jF3k6L4k8jH1n9v6b3e', 30000.00);

-- --------------------------------------------------------
-- Seed Data: Categories with Recommended Budget Percentages
-- --------------------------------------------------------
INSERT INTO `categories` (`id`, `name`, `icon`, `color`, `default_percentage`) VALUES
(1, 'Food & Dining', 'fa-utensils', '#f97316', 25.00),
(2, 'Transportation', 'fa-car', '#06b6d4', 12.00),
(3, 'Shopping', 'fa-bag-shopping', '#ec4899', 15.00),
(4, 'Bills & Utilities', 'fa-file-invoice-dollar', '#8b5cf6', 18.00),
(5, 'Entertainment', 'fa-film', '#eab308', 8.00),
(6, 'Health & Fitness', 'fa-heart-pulse', '#10b981', 7.00),
(7, 'Education', 'fa-graduation-cap', '#3b82f6', 10.00),
(8, 'Groceries', 'fa-basket-shopping', '#14b8a6', 15.00),
(9, 'Other', 'fa-ellipsis', '#64748b', 5.00);

-- --------------------------------------------------------
-- Seed Data: Overall Monthly Budget for User 1
-- --------------------------------------------------------
INSERT INTO `user_monthly_budgets` (`user_id`, `month`, `total_budget`, `budget_strategy`) VALUES
(1, DATE_FORMAT(CURRENT_DATE(), '%Y-%m'), 30000.00, '50-30-20');

-- --------------------------------------------------------
-- Seed Data: Category Budgets (Automatically Calculated)
-- --------------------------------------------------------
INSERT INTO `budgets` (`user_id`, `category_id`, `month`, `monthly_limit`) VALUES
(1, 1, DATE_FORMAT(CURRENT_DATE(), '%Y-%m'), 7500.00),
(1, 2, DATE_FORMAT(CURRENT_DATE(), '%Y-%m'), 3600.00),
(1, 3, DATE_FORMAT(CURRENT_DATE(), '%Y-%m'), 4500.00),
(1, 4, DATE_FORMAT(CURRENT_DATE(), '%Y-%m'), 5400.00),
(1, 5, DATE_FORMAT(CURRENT_DATE(), '%Y-%m'), 2400.00),
(1, 6, DATE_FORMAT(CURRENT_DATE(), '%Y-%m'), 2100.00),
(1, 7, DATE_FORMAT(CURRENT_DATE(), '%Y-%m'), 3000.00),
(1, 8, DATE_FORMAT(CURRENT_DATE(), '%Y-%m'), 4500.00),
(1, 9, DATE_FORMAT(CURRENT_DATE(), '%Y-%m'), 1500.00);

-- --------------------------------------------------------
-- Seed Data: User Expenses
-- --------------------------------------------------------
INSERT INTO `expenses` (`user_id`, `title`, `amount`, `category_id`, `expense_date`, `payment_method`, `notes`) VALUES
(1, 'Starbucks Coffee & Snacks', 380.00, 1, CURRENT_DATE(), 'UPI', 'Quick morning breakfast with friend'),
(1, 'Metro Card Recharge', 500.00, 2, CURRENT_DATE(), 'Debit Card', 'Monthly commute pass renewal'),
(1, 'Supermarket Grocery Run', 1450.50, 8, DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 'Credit Card', 'Vegetables, milk, fruits, and bread'),
(1, 'Netflix & Spotify Subscriptions', 649.00, 5, DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), 'Credit Card', 'Monthly auto-renewal'),
(1, 'Pharmacy - Vitamins & First Aid', 720.00, 6, DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), 'UPI', 'Multivitamins and pain relief cream'),
(1, 'Weekend Dinner at Bistro', 1850.00, 1, DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), 'Credit Card', 'Family weekend dinner'),
(1, 'Online Book Purchase (Algorithms)', 899.00, 7, DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), 'UPI', 'Data Structures & Algorithms textbook'),
(1, 'Electricity & Water Bill', 2150.00, 4, DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY), 'Net Banking', 'Apartment monthly utilities bill'),
(1, 'Casual T-Shirts Sale', 1299.00, 3, DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY), 'UPI', 'Autumn apparel collection'),
(1, 'Petrol / Fuel', 1200.00, 2, DATE_SUB(CURRENT_DATE(), INTERVAL 10 DAY), 'Cash', 'Car tank refill'),
(1, 'Movie Tickets & Popcorn', 850.00, 5, DATE_SUB(CURRENT_DATE(), INTERVAL 12 DAY), 'UPI', 'Weekend cinema IMAX show'),
(1, 'High-speed Fiber Internet', 999.00, 4, DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY), 'Net Banking', '200 Mbps broadband monthly payment'),
(1, 'Gym Membership Fee', 1500.00, 6, DATE_SUB(CURRENT_DATE(), INTERVAL 16 DAY), 'UPI', 'Monthly fitness club renewal'),
(1, 'Lunch with College Team', 620.00, 1, DATE_SUB(CURRENT_DATE(), INTERVAL 18 DAY), 'Cash', 'Project discussion lunch'),
(1, 'Grocery Supplies & Pantry Restock', 2340.00, 8, DATE_SUB(CURRENT_DATE(), INTERVAL 20 DAY), 'Debit Card', 'Monthly pantry dry groceries'),
(1, 'Ergonomic Laptop Stand', 1199.00, 3, DATE_SUB(CURRENT_DATE(), INTERVAL 22 DAY), 'Credit Card', 'Study desk ergonomic accessory'),
(1, 'Cab ride across town', 340.00, 2, DATE_SUB(CURRENT_DATE(), INTERVAL 24 DAY), 'UPI', 'Uber ride to tech meet-up');
