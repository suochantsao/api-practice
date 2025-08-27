const pool = require('../config/database');

/**
 * 用戶控制器
 * 包含所有用戶相關的業務邏輯
 */
const userController = {

    // === CREATE - 建立新用戶 ===
    createUser: async (req, res) => {
        try {
            const { name, email, age } = req.body;

            // 資料驗證
            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    message: '姓名和 Email 為必填欄位',
                    data: null
                });
            }

            // Email 格式驗證
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Email 格式不正確',
                    data: null
                });
            }

            // 年齡驗證（如果提供）
            if (age && (age < 0 || age > 130)) {
                return res.status(400).json({
                    success: false,
                    message: '年齡必須在 0-130 之間',
                    data: null
                });
            }

            // 插入資料庫
            // RETURNING * 表示返回新建立的記錄
            const result = await pool.query(
                'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING *',
                [name, email, age || null]
            );

            res.status(201).json({
                success: true,
                message: '用戶建立成功',
                data: result.rows[0]
            });

        } catch (error) {
            console.error('建立用戶錯誤:', error);

            // PostgreSQL 唯一約束錯誤（Email 重複）
            if (error.code === '23505') {
                return res.status(409).json({
                    success: false,
                    message: 'Email 已存在',
                    data: null
                });
            }

            res.status(500).json({
                success: false,
                message: '伺服器內部錯誤',
                data: null
            });
        }
    },

    // === READ - 取得所有用戶 ===
    getAllUsers: async (req, res) => {
        try {
            // 查詢參數處理（分頁、排序）
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const sortBy = req.query.sortBy || 'created_at';
            const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';

            // 驗證排序欄位（防止 SQL 注入）
            const allowedSortFields = ['id', 'name', 'email', 'age', 'created_at'];
            if (!allowedSortFields.includes(sortBy)) {
                return res.status(400).json({
                    success: false,
                    message: '無效的排序欄位',
                    data: null
                });
            }

            // 取得總記錄數
            const countResult = await pool.query('SELECT COUNT(*) FROM users');
            const totalUsers = parseInt(countResult.rows[0].count);

            // 取得用戶資料（分頁）
            const result = await pool.query(
                `SELECT id, name, email, age, created_at, updated_at 
         FROM users 
         ORDER BY ${sortBy} ${sortOrder} 
         LIMIT $1 OFFSET $2`,
                [limit, offset]
            );

            res.json({
                success: true,
                message: '取得用戶列表成功',
                data: result.rows,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalUsers / limit),
                    totalUsers: totalUsers,
                    usersPerPage: limit
                }
            });

        } catch (error) {
            console.error('取得用戶列表錯誤:', error);
            res.status(500).json({
                success: false,
                message: '伺服器內部錯誤',
                data: null
            });
        }
    },

    // === READ - 取得單一用戶 ===
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;

            // 驗證 ID 是否為有效數字
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: '無效的用戶 ID',
                    data: null
                });
            }

            const result = await pool.query(
                'SELECT id, name, email, age, created_at, updated_at FROM users WHERE id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '找不到指定的用戶',
                    data: null
                });
            }

            res.json({
                success: true,
                message: '取得用戶資料成功',
                data: result.rows[0]
            });

        } catch (error) {
            console.error('取得用戶錯誤:', error);
            res.status(500).json({
                success: false,
                message: '伺服器內部錯誤',
                data: null
            });
        }
    },

    // === UPDATE - 更新用戶 ===
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, age } = req.body;

            // 驗證 ID
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: '無效的用戶 ID',
                    data: null
                });
            }

            // 檢查用戶是否存在
            const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            if (existingUser.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '找不到指定的用戶',
                    data: null
                });
            }

            // 動態建立更新查詢
            const updates = [];
            const values = [];
            let paramCount = 1;

            if (name) {
                updates.push(`name = $${paramCount}`);
                values.push(name);
                paramCount++;
            }

            if (email) {
                // Email 格式驗證
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email 格式不正確',
                        data: null
                    });
                }
                updates.push(`email = $${paramCount}`);
                values.push(email);
                paramCount++;
            }

            if (age !== undefined) {
                if (age < 0 || age > 150) {
                    return res.status(400).json({
                        success: false,
                        message: '年齡必須在 0-150 之間',
                        data: null
                    });
                }
                updates.push(`age = $${paramCount}`);
                values.push(age);
                paramCount++;
            }

            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '沒有提供要更新的欄位',
                    data: null
                });
            }

            // 添加 ID 到參數列表
            values.push(id);

            const updateQuery = `
        UPDATE users 
        SET ${updates.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING *
      `;

            const result = await pool.query(updateQuery, values);

            res.json({
                success: true,
                message: '用戶資料更新成功',
                data: result.rows[0]
            });

        } catch (error) {
            console.error('更新用戶錯誤:', error);

            // Email 重複錯誤
            if (error.code === '23505') {
                return res.status(409).json({
                    success: false,
                    message: 'Email 已存在',
                    data: null
                });
            }

            res.status(500).json({
                success: false,
                message: '伺服器內部錯誤',
                data: null
            });
        }
    },

    // === DELETE - 刪除用戶 ===
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            // 驗證 ID
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: '無效的用戶 ID',
                    data: null
                });
            }

            // 先檢查用戶是否存在
            const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            if (existingUser.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: '找不到指定的用戶',
                    data: null
                });
            }

            // 刪除用戶
            await pool.query('DELETE FROM users WHERE id = $1', [id]);

            res.json({
                success: true,
                message: '用戶刪除成功',
                data: { deletedUserId: id }
            });

        } catch (error) {
            console.error('刪除用戶錯誤:', error);
            res.status(500).json({
                success: false,
                message: '伺服器內部錯誤',
                data: null
            });
        }
    }
};

module.exports = userController;