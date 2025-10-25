-- =========================================================
-- Simple Collaborative To-Do App Schema + Sample Data
-- =========================================================

-- Drop old tables if testing repeatedly
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;

-- 1) Enum for task status
CREATE TYPE task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- 2) Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3) Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- 4) Tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'PENDING',
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  assignee_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_by_id INT REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  completed_at TIMESTAMP,
  version INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auto-update 'updated_at' field on modification
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

-- =========================================================
-- SAMPLE DATA
-- =========================================================

-- Users
INSERT INTO users (name, email) VALUES
('Alice', 'alice@example.com'),
('Bob', 'bob@example.com'),
('Carol', 'carol@example.com');

-- Categories
INSERT INTO categories (name) VALUES
('Work'),
('Personal'),
('School');

-- Tasks
INSERT INTO tasks (title, description, status, category_id, assignee_id, created_by_id, due_date)
VALUES
('Implement Task API', 'Develop REST endpoints for creating and updating tasks', 'IN_PROGRESS', 1, 2, 1, CURRENT_DATE + 2),
('Create Category Module', 'Add category management feature', 'PENDING', 1, 1, 1, CURRENT_DATE + 3),
('Test Concurrency', 'Write JUnit tests for optimistic locking', 'PENDING', 1, 3, 2, CURRENT_DATE + 5),
('Write README', 'Document project setup and API details', 'COMPLETED', 2, 3, 3, CURRENT_DATE - 1),
('Prepare Deliverable 1', 'Write schema and deliverable documentation', 'PENDING', 3, 2, 1, CURRENT_DATE + 1);

-- =========================================================
-- QUICK TEST QUERIES
-- =========================================================
-- SELECT * FROM users;
-- SELECT * FROM categories;
-- SELECT * FROM tasks;
-- SELECT t.id, t.title, t.status, c.name AS category, u.name AS assignee
-- FROM tasks t
-- LEFT JOIN categories c ON t.category_id = c.id
-- LEFT JOIN users u ON t.assignee_id = u.id
-- ORDER BY t.id;
