-- Table for public status message
CREATE TABLE IF NOT EXISTS status (
  id TEXT PRIMARY KEY DEFAULT 'status',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
