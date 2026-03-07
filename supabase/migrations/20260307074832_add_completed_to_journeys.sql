/*
  # Add completed field to journeys

  1. Changes
    - Add `completed` boolean column to `journeys` table
    - Default value is false (active journeys)
    - Add index for better query performance on completed status
  
  2. Notes
    - This allows journeys to be marked as completed and moved to archive
    - Non-destructive change - all existing journeys remain active
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journeys' AND column_name = 'completed'
  ) THEN
    ALTER TABLE journeys ADD COLUMN completed boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add index for filtering by completed status
CREATE INDEX IF NOT EXISTS idx_journeys_completed ON journeys(completed);
