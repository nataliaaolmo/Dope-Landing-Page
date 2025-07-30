CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  name TEXT,
  interests TEXT[],
  subscribed_at TIMESTAMP DEFAULT NOW()
);
