-- Add the is_suspended column to the users table
-- Default is false, meaning all existing users will be active.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
