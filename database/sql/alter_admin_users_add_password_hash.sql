-- database/sql/alter_admin_users_add_password_hash.sql

-- Add the password_hash column to store securely hashed passwords
ALTER TABLE admin_users
ADD COLUMN password_hash VARCHAR(255);

-- It's good practice to ensure this column is not null for new users,
-- but for existing users, we might need to update them separately.
-- For a new setup, we could set it to NOT NULL.
-- ALTER TABLE admin_users ALTER COLUMN password_hash SET NOT NULL;
