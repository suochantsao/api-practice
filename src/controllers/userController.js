const supabase = require('../config/database');

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

            // 插入 Supabase 資料庫
            const { data, error } = await supabase
                .from('users')
                .insert([{ name, email, age: age || null }])
                .select()
                .single();

            if (error) {
                throw error;
            }

            res.status(201).json({
                success: true,
                message: '用戶建立成功',
                data: data
            });

        } catch (error) {
            console.error('建立用戶錯誤:', error);

            // Supabase 唯一約束錯誤（Email 重複）
            if (error.code === '23505' || error.message?.includes('duplicate key')) {
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
            const { count: totalUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            // 取得用戶資料（分頁）
            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, age, created_at, updated_at')
                .order(sortBy, { ascending: sortOrder === 'ASC' })
                .range(offset, offset + limit - 1);

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                message: '取得用戶列表成功',
                data: data,
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

            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, age, created_at, updated_at')
                .eq('id', id)
                .single();

            if (error || !data) {
                return res.status(404).json({
                    success: false,
                    message: '找不到指定的用戶',
                    data: null
                });
            }

            res.json({
                success: true,
                message: '取得用戶資料成功',
                data: data
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
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();
            
            if (checkError || !existingUser) {
                return res.status(404).json({
                    success: false,
                    message: '找不到指定的用戶',
                    data: null
                });
            }

            // 準備更新資料
            const updateData = {};

            if (name) {
                updateData.name = name;
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
                updateData.email = email;
            }

            if (age !== undefined) {
                if (age < 0 || age > 150) {
                    return res.status(400).json({
                        success: false,
                        message: '年齡必須在 0-150 之間',
                        data: null
                    });
                }
                updateData.age = age;
            }

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '沒有提供要更新的欄位',
                    data: null
                });
            }

            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                message: '用戶資料更新成功',
                data: data
            });

        } catch (error) {
            console.error('更新用戶錯誤:', error);

            // Email 重複錯誤
            if (error.code === '23505' || error.message?.includes('duplicate key')) {
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
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();
            
            if (checkError || !existingUser) {
                return res.status(404).json({
                    success: false,
                    message: '找不到指定的用戶',
                    data: null
                });
            }

            // 刪除用戶
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

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