-- ============================================
-- INVITATIONS TABLE
-- ============================================
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  used_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_created_by ON invitations(created_by_user_id);
CREATE INDEX idx_invitations_is_used ON invitations(is_used);

-- Trigger para updated_at
CREATE TRIGGER update_invitations_updated_at 
  BEFORE UPDATE ON invitations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

