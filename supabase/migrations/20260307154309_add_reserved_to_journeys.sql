/*
  # Add Reserved Status to Journeys

  1. Changes
    - Add `reserved` column to `journeys` table
      - Type: boolean
      - Default: false
      - Indicates whether a journey has been reserved by the user
    
  2. Notes
    - Uses IF NOT EXISTS pattern to prevent errors on re-run
    - Safe to run multiple times
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journeys' AND column_name = 'reserved'
  ) THEN
    ALTER TABLE journeys ADD COLUMN reserved boolean DEFAULT false;
  END IF;
END $$;
