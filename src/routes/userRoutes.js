const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * 用戶路由
 * 定義所有與用戶相關的 API 端點
 */

// === RESTful API 端點 ===

// GET /api/users - 取得所有用戶（支援分頁和排序）
// 查詢參數：
// - page: 頁碼（預設 1）
// - limit: 每頁筆數（預設 10）
// - sortBy: 排序欄位（預設 created_at）
// - sortOrder: 排序方向 asc/desc（預設 desc）
router.get('/', userController.getAllUsers);

// GET /api/users/:id - 取得特定用戶
router.get('/:id', userController.getUserById);

// POST /api/users - 建立新用戶
router.post('/', userController.createUser);

// PUT /api/users/:id - 更新用戶（完整更新）
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - 刪除用戶
router.delete('/:id', userController.deleteUser);

module.exports = router;