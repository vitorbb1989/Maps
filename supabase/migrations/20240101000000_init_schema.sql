-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create mindmaps table
CREATE TABLE IF NOT EXISTS mindmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Novo mindmap',
  current_doc_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for mindmaps
CREATE INDEX IF NOT EXISTS idx_mindmaps_user_id_updated_at
  ON mindmaps(user_id, updated_at DESC);

-- Enable RLS for mindmaps
ALTER TABLE mindmaps ENABLE ROW LEVEL SECURITY;

-- Policies (idempotente)
DROP POLICY IF EXISTS "Users can select their own mindmaps" ON mindmaps;
DROP POLICY IF EXISTS "Users can insert their own mindmaps" ON mindmaps;
DROP POLICY IF EXISTS "Users can update their own mindmaps" ON mindmaps;
DROP POLICY IF EXISTS "Users can delete their own mindmaps" ON mindmaps;
DROP POLICY IF EXISTS "mindmaps_select_own" ON mindmaps;
DROP POLICY IF EXISTS "mindmaps_insert_own" ON mindmaps;
DROP POLICY IF EXISTS "mindmaps_update_own" ON mindmaps;
DROP POLICY IF EXISTS "mindmaps_delete_own" ON mindmaps;

CREATE POLICY "mindmaps_select_own"
  ON mindmaps FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "mindmaps_insert_own"
  ON mindmaps FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "mindmaps_update_own"
  ON mindmaps FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "mindmaps_delete_own"
  ON mindmaps FOR DELETE
  USING (user_id = auth.uid());

-- Create mindmap_snapshots table
CREATE TABLE IF NOT EXISTS mindmap_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mindmap_id UUID NOT NULL REFERENCES mindmaps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  doc_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for snapshots
CREATE INDEX IF NOT EXISTS idx_snapshots_mindmap_id_created_at
  ON mindmap_snapshots(mindmap_id, created_at DESC);

-- Enable RLS for snapshots
ALTER TABLE mindmap_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies (idempotente)
DROP POLICY IF EXISTS "Users can select their own snapshots" ON mindmap_snapshots;
DROP POLICY IF EXISTS "Users can insert their own snapshots" ON mindmap_snapshots;
DROP POLICY IF EXISTS "snapshots_select_own_mindmap" ON mindmap_snapshots;
DROP POLICY IF EXISTS "snapshots_insert_own_mindmap" ON mindmap_snapshots;

CREATE POLICY "snapshots_select_own_mindmap"
  ON mindmap_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM mindmaps m
      WHERE m.id = mindmap_snapshots.mindmap_id
        AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "snapshots_insert_own_mindmap"
  ON mindmap_snapshots FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM mindmaps m
      WHERE m.id = mindmap_snapshots.mindmap_id
        AND m.user_id = auth.uid()
    )
  );

-- Grants (mínimo necessário)
REVOKE ALL ON TABLE mindmaps FROM authenticated;
REVOKE ALL ON TABLE mindmap_snapshots FROM authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE mindmaps TO authenticated;
GRANT SELECT, INSERT ON TABLE mindmap_snapshots TO authenticated;
