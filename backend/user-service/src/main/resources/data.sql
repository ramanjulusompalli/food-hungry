INSERT INTO app_users (id, name, email, mobile, password, created_at)
VALUES (
  'demo-user-001',
  'Food Hungry Customer',
  'customer@foodhungry.com',
  '9876543210',
  'password123',
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;
