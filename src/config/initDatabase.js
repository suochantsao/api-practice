const supabase = require('./database');

/**
 * Supabase 資料庫初始化函數
 * 由於 Supabase 自動管理資料庫結構，我們主要檢查連線和驗證表格存在
 * Table 結構應該在 Supabase Dashboard 或 SQL Editor 中建立
 */
const initDatabase = async () => {
    try {
        console.log('🔄 開始初始化 Supabase 資料庫...');

        // === 檢查 users 表格是否存在並可以存取 ===
        const { data, error } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Supabase 連線或表格存取失敗:', error.message);
            console.log('💡 請確認：');
            console.log('   1. 在 Supabase Dashboard 建立了 users 表格');
            console.log('   2. 表格結構包含：id, name, email, age, created_at, updated_at');
            console.log('   3. SUPABASE_URL 和 SUPABASE_ANON_KEY 設定正確');
            throw error;
        }

        console.log('✅ Supabase 連線成功，users 表格可正常存取');

        // === 新增測試資料（可選）===
        // 檢查是否已有資料，如果沒有則新增測試資料
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (checkError) {
            console.error('❌ 檢查現有資料失敗:', checkError.message);
            throw checkError;
        }

        if (!existingUsers || existingUsers.length === 0) {
            console.log('🔄 新增測試資料...');
            
            const testUsers = [
                { name: '測試用戶1', email: 'test1@example.com', age: 25 },
                { name: '測試用戶2', email: 'test2@example.com', age: 30 },
                { name: '張小明', email: 'ming@example.com', age: 28 }
            ];

            const { data: insertData, error: insertError } = await supabase
                .from('users')
                .insert(testUsers)
                .select();

            if (insertError) {
                console.log('⚠️ 測試資料新增失敗（可能已存在）:', insertError.message);
            } else {
                console.log('✅ 測試資料建立完成，新增了', insertData.length, '筆資料');
            }
        } else {
            console.log('✅ 資料庫已有資料，跳過測試資料新增');
        }

        // === 顯示資料庫資訊 ===
        const { count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        console.log('📋 Supabase 資料庫狀態：');
        console.log(`   總用戶數: ${count || 0}`);
        console.log('   表格: users');
        console.log('   連線狀態: 正常');

    } catch (error) {
        console.error('❌ Supabase 資料庫初始化失敗:', error.message);
        throw error; // 重新拋出錯誤，讓上層處理
    }
};

module.exports = initDatabase;