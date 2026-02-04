REVOKE ALL ON TABLE mindmaps FROM authenticated;
REVOKE ALL ON TABLE mindmap_snapshots FROM authenticated;

DROP POLICY IF EXISTS "Users can select their own mindmaps" ON mindmaps;
DROP POLICY IF EXISTS "Users can insert their own mindmaps" ON mindmaps;
DROP POLICY IF EXISTS "Users can update their own mindmaps" ON mindmaps;
DROP POLICY IF EXISTS "Users can delete their own mindmaps" ON mindmaps;

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

DROP POLICY IF EXISTS "Users can select their own snapshots" ON mindmap_snapshots;
DROP POLICY IF EXISTS "Users can insert their own snapshots" ON mindmap_snapshots;

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

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE mindmaps TO authenticated;
GRANT SELECT, INSERT ON TABLE mindmap_snapshots TO authenticated;

