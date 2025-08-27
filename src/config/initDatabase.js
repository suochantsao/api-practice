const pool = require('./database');

/**
 * 資料庫初始化函數
 * 為什麼要程式化建立資料表？
 * 1. 版本控制：資料庫結構變更可以追蹤
 * 2. 自動化：新環境部署時自動建立資料庫結構
 * 3. 一致性：確保所有開發者的資料庫結構相同
 */
const initDatabase = async () => {
    try {
        console.log('🔄 開始初始化資料庫...');

        // === 建立 users 資料表 ===
        const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        -- 主鍵：自動遞增的唯一識別碼
        id SERIAL PRIMARY KEY,
        
        -- 用戶姓名：最多100字元，不可為空
        name VARCHAR(100) NOT NULL,
        
        -- 電子郵件：最多150字元，必須唯一且不可為空
        email VARCHAR(150) UNIQUE NOT NULL,
        
        -- 年齡：整數，必須大於0（可選欄位）
        age INTEGER CHECK (age > 0),
        
        -- 建立時間：自動記錄資料建立時間
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- 更新時間：記錄資料最後修改時間
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

        await pool.query(createUsersTable);
        console.log('✅ users 資料表建立成功');

        // === 建立更新時間觸發器 ===
        // 為什麼需要觸發器？
        // 當資料更新時，自動更新 updated_at 欄位
        const createUpdateTrigger = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

        await pool.query(createUpdateTrigger);
        console.log('✅ 自動更新時間觸發器建立成功');

        // === 建立索引提高查詢效能 ===
        // 為什麼需要索引？
        // email 欄位經常用於查詢，建立索引可以提高查詢速度
        const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    `;

        await pool.query(createIndexes);
        console.log('✅ 資料庫索引建立成功');

        // === 新增測試資料（可選）===
        // 開發階段方便測試用的資料
        const insertTestData = `
      INSERT INTO users (name, email, age) 
      VALUES 
        ('測試用戶1', 'test1@example.com', 25),
        ('測試用戶2', 'test2@example.com', 30),
        ('張小明', 'ming@example.com', 28)
      ON CONFLICT (email) DO NOTHING
    `;

        const result = await pool.query(insertTestData);
        console.log('✅ 測試資料建立完成');

        // === 顯示資料表資訊 ===
        const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

        console.log('📋 users 資料表結構：');
        tableInfo.rows.forEach(col => {
            console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(必填)' : '(可選)'}`);
        });

    } catch (error) {
        console.error('❌ 資料庫初始化失敗:', error.message);
        throw error; // 重新拋出錯誤，讓上層處理
    }
};

module.exports = initDatabase;