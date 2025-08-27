// 引入必要的模組
const express = require('express');  // Web 框架
const initDatabase = require('./src/config/initDatabase');
const userRoutes = require('./src/routes/userRoutes');
require('dotenv').config();          // 載入環境變數

// 建立 Express 應用程式實例
const app = express();

// 從環境變數取得埠號，如果沒有設定就使用 3000
const PORT = process.env.PORT || 3000;

// === 中間件設定 ===
// 為什麼需要中間件？
// 中間件會在每個請求到達路由處理器之前執行

// 解析 JSON 格式的請求內容
// 沒有這個，你的 API 無法讀取 POST 請求中的 JSON 資料
app.use(express.json());

// 解析表單資料（application/x-www-form-urlencoded）
app.use(express.urlencoded({ extended: true }));

// === API 路由 ===
app.use('/api/users', userRoutes); // 新增這行

// === 基本路由 ===
app.get('/', (req, res) => {
    res.json({
        message: 'API 伺服器運行中',
        timestamp: new Date().toISOString(),
        status: 'success',
        endpoints: {
            users: {
                'GET /api/users': '取得所有用戶',
                'GET /api/users/:id': '取得特定用戶',
                'POST /api/users': '建立新用戶',
                'PUT /api/users/:id': '更新用戶',
                'DELETE /api/users/:id': '刪除用戶'
            }
        }
    });
});

// === 404 處理 ===
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `找不到路徑: ${req.method} ${req.originalUrl}`,
        data: null
    });
});

// === 錯誤處理中間件 ===
app.use((error, req, res, next) => {
    console.error('未處理的錯誤:', error);
    res.status(500).json({
        success: false,
        message: '伺服器內部錯誤',
        data: null
    });
});

// === 啟動伺服器 ===
// 為什麼要先初始化資料庫再啟動伺服器？
// 確保資料庫結構準備就緒，API 才能正常運作
const startServer = async () => {
    try {
        await initDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 伺服器在 http://localhost:${PORT} 運行中`);
            console.log(`📝 API 文件：http://localhost:${PORT}`);
            console.log(`🗄️  資料庫已準備就緒`);
            console.log(`🔗 API 端點：`);
            console.log(`   GET    /api/users     - 取得所有用戶`);
            console.log(`   GET    /api/users/:id - 取得特定用戶`);
            console.log(`   POST   /api/users     - 建立新用戶`);
            console.log(`   PUT    /api/users/:id - 更新用戶`);
            console.log(`   DELETE /api/users/:id - 刪除用戶`);
        });

    } catch (error) {
        console.error('❌ 伺服器啟動失敗:', error.message);
        process.exit(1);
    }
};

// 啟動應用程式
startServer();