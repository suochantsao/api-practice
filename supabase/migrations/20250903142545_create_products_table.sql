-- Create products table
-- This is the second migration demonstrating how to add a product data table

CREATE TABLE products (
  -- Primary key: auto-incrementing unique identifier
  id BIGSERIAL PRIMARY KEY,
  
  -- Product name: cannot be null
  name TEXT NOT NULL,
  
  -- Product description: optional
  description TEXT,
  
  -- Product price: decimal type, precise to 2 decimal places
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  
  -- Product category
  category VARCHAR(50),
  
  -- Stock quantity
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  
  -- Is active for sale
  is_active BOOLEAN DEFAULT true,
  
  -- Created timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Updated timestamp
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create update timestamp trigger for products table
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Insert sample product data
INSERT INTO products (name, description, price, category, stock, is_active) VALUES 
  ('iPhone 15', 'Latest iPhone smartphone', 999.00, 'Electronics', 100, true),
  ('MacBook Pro', 'High-performance laptop', 1999.00, 'Electronics', 50, true),
  ('Coffee Beans 500g', 'Premium Colombian coffee beans', 25.99, 'Food', 200, true),
  ('Wireless Bluetooth Headphones', 'Noise-canceling Bluetooth headphones', 199.99, 'Electronics', 75, true),
  ('Organic Green Tea', 'Taiwan high-mountain organic green tea', 15.50, 'Beverages', 150, true);