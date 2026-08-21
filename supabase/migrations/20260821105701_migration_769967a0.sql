CREATE TABLE IF NOT EXISTS review_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_votes" ON review_votes FOR SELECT USING (true);
CREATE POLICY "auth_insert_votes" ON review_votes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "own_delete_votes" ON review_votes FOR DELETE USING (auth.uid() = user_id);