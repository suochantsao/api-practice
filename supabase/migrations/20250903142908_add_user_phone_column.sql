-- Add phone column to users table
-- This migration demonstrates how to modify existing table structure

-- Add new phone column to users table
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Add index for phone column for better search performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Optional: Update some existing records with sample phone numbers
-- (In production, you typically wouldn't include data updates in schema migrations)
UPDATE users SET phone = '+1-555-0101' WHERE email = 'test1@example.com';
UPDATE users SET phone = '+1-555-0102' WHERE email = 'test2@example.com';
UPDATE users SET phone = '+1-555-0103' WHERE email = 'ming@example.com';