-- Migration to support Google OAuth and account linking
ALTER TABLE users MODIFY password_hash VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'LOCAL' NOT NULL;
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255) NULL;
