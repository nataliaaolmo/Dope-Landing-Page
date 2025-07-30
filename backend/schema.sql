CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  name TEXT,
  interests TEXT[],
  goals TEXT,
  subscribed_at TIMESTAMP DEFAULT NOW()
);
