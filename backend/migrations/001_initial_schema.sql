-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('consumer', 'admin', 'worker');
CREATE TYPE transaction_status AS ENUM ('received', 'ordered', 'finished');
CREATE TYPE work_order_status AS ENUM ('assigned', 'finished');
CREATE TYPE package_type AS ENUM ('interior', 'exterior', 'complete');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(50),
    language VARCHAR(10) DEFAULT 'id',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(255) UNIQUE NOT NULL,
    consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consumer_name VARCHAR(255) NOT NULL,
    status transaction_status NOT NULL DEFAULT 'received',
    date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    location VARCHAR(255),
    whatsapp VARCHAR(50) NOT NULL,
    car_brand VARCHAR(255) NOT NULL,
    car_year VARCHAR(10) NOT NULL,
    car_color VARCHAR(100) NOT NULL,
    selected_package package_type NOT NULL,
    current_seat VARCHAR(100) NOT NULL,
    has_stain BOOLEAN DEFAULT false,
    workplace_available BOOLEAN DEFAULT false,
    canopy BOOLEAN DEFAULT false,
    parking BOOLEAN DEFAULT false,
    water_electricity BOOLEAN DEFAULT false,
    audio_system VARCHAR(255),
    special_complaints TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create work_orders table
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_number VARCHAR(255) UNIQUE NOT NULL,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    worker_name VARCHAR(255) NOT NULL,
    status work_order_status NOT NULL DEFAULT 'assigned',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create work_order_docs table
CREATE TABLE work_order_docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_consumer_id ON transactions(consumer_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_work_orders_worker_id ON work_orders(worker_id);
CREATE INDEX idx_work_orders_transaction_id ON work_orders(transaction_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_order_docs_work_order_id ON work_order_docs(work_order_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial users will be seeded using the seed script
-- Run: npm run seed (after setting up the seed script)
