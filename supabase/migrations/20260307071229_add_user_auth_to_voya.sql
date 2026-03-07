/*
  # Add User Authentication to Voya Schema

  1. Changes to Tables
    - Add `user_id` column to `journeys` table
      - Links each journey to the authenticated user who created it
      - Ensures data isolation between users
  
  2. Security Changes
    - Drop all existing public policies (anon access)
    - Enable strict RLS policies that require authentication
    - Add policies for authenticated users to manage their own data:
      - Users can only view their own journeys and related data
      - Users can only create, update, and delete their own data
      - Cascade permissions through foreign keys (days, experiences)
  
  3. Important Notes
    - All existing data will remain in the database
    - Existing journeys will have NULL user_id initially
    - New journeys will be automatically linked to the authenticated user
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journeys' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE journeys ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "Allow public read access to journeys" ON journeys;
DROP POLICY IF EXISTS "Allow public insert to journeys" ON journeys;
DROP POLICY IF EXISTS "Allow public update to journeys" ON journeys;
DROP POLICY IF EXISTS "Allow public delete from journeys" ON journeys;

DROP POLICY IF EXISTS "Allow public read access to days" ON days;
DROP POLICY IF EXISTS "Allow public insert to days" ON days;
DROP POLICY IF EXISTS "Allow public update to days" ON days;
DROP POLICY IF EXISTS "Allow public delete from days" ON days;

DROP POLICY IF EXISTS "Allow public read access to experiences" ON experiences;
DROP POLICY IF EXISTS "Allow public insert to experiences" ON experiences;
DROP POLICY IF EXISTS "Allow public update to experiences" ON experiences;
DROP POLICY IF EXISTS "Allow public delete from experiences" ON experiences;

CREATE POLICY "Users can view own journeys"
  ON journeys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journeys"
  ON journeys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journeys"
  ON journeys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journeys"
  ON journeys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view days of own journeys"
  ON days FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM journeys
      WHERE journeys.id = days.journey_id
      AND journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create days for own journeys"
  ON days FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM journeys
      WHERE journeys.id = days.journey_id
      AND journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update days of own journeys"
  ON days FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM journeys
      WHERE journeys.id = days.journey_id
      AND journeys.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM journeys
      WHERE journeys.id = days.journey_id
      AND journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete days of own journeys"
  ON days FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM journeys
      WHERE journeys.id = days.journey_id
      AND journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view experiences of own journeys"
  ON experiences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM days
      JOIN journeys ON journeys.id = days.journey_id
      WHERE days.id = experiences.day_id
      AND journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create experiences for own journeys"
  ON experiences FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM days
      JOIN journeys ON journeys.id = days.journey_id
      WHERE days.id = experiences.day_id
      AND journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update experiences of own journeys"
  ON experiences FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM days
      JOIN journeys ON journeys.id = days.journey_id
      WHERE days.id = experiences.day_id
      AND journeys.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM days
      JOIN journeys ON journeys.id = days.journey_id
      WHERE days.id = experiences.day_id
      AND journeys.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete experiences of own journeys"
  ON experiences FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM days
      JOIN journeys ON journeys.id = days.journey_id
      WHERE days.id = experiences.day_id
      AND journeys.user_id = auth.uid()
    )
  );
