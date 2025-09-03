-- Remove phone column from users table
-- This migration demonstrates how to rollback previous changes

-- Drop the index first (good practice before dropping column)
DROP INDEX IF EXISTS idx_users_phone;

-- Remove the phone column from users table
ALTER TABLE users DROP COLUMN IF EXISTS phone;

-- Note: In real scenarios, you would typically backup data before dropping columns
-- This is just a demonstration of how rollback migrations work