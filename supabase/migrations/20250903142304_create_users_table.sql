-- Create users table
-- This is the first migration defining the user data table structure

CREATE TABLE users (
  -- Primary key: auto-incrementing unique identifier
  id BIGSERIAL PRIMARY KEY,
  
  -- Username: max 100 characters, not null
  name VARCHAR(100) NOT NULL,
  
  -- Email: max 150 characters, unique and not null
  email VARCHAR(150) UNIQUE NOT NULL,
  
  -- Age: integer, must be greater than 0 (optional field)
  age INTEGER CHECK (age > 0),
  
  -- Created timestamp: automatically record creation time
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Updated timestamp: record last modification time
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Insert initial test data
INSERT INTO users (name, email, age) VALUES 
  ('Test User 1', 'test1@example.com', 25),
  ('Test User 2', 'test2@example.com', 30),
  ('Zhang Xiaoming', 'ming@example.com', 28);