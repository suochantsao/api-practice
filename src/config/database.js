const { Pool } = require('pg');
require('dotenv').config();

// Pool 是什麼？
// Pool 管理多個資料庫連線，避免每次請求都建立新連線
// 提高效能並防止連線數過多

const pool = new Pool({
    host: process.env.DB_HOST,        // 從 .env 檔案讀取資料庫主機
    port: process.env.DB_PORT,        // 從 .env 檔案讀取資料庫埠號
    database: process.env.DB_NAME,    // 從 .env 檔案讀取資料庫名稱
    user: process.env.DB_USER,        // 從 .env 檔案讀取用戶名
    password: process.env.DB_PASSWORD, // 從 .env 檔案讀取密碼
});

// 測試資料庫連線
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ 資料庫連線失敗:', err.stack);
    } else {
        console.log('✅ 資料庫連線成功');
        release(); // 釋放連線回連線池
    }
});

module.exports = pool;