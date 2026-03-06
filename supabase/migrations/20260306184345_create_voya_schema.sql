/*
  # Voya Luxury Travel Planner Schema

  1. New Tables
    - `journeys`
      - `id` (uuid, primary key)
      - `title` (text) - Journey title (e.g., "London Calling")
      - `destination` (text) - Full destination (e.g., "London, United Kingdom")
      - `category` (text) - Journey category (Leisure, Cultural, Adventure, etc.)
      - `tagline` (text) - Journey tagline
      - `depart_date` (date) - Departure date
      - `return_date` (date) - Return date
      - `created_at` (timestamptz)
    
    - `days`
      - `id` (uuid, primary key)
      - `journey_id` (uuid, foreign key to journeys)
      - `day_number` (int) - Day number in the journey
      - `date` (date) - Actual date of this day
      - `created_at` (timestamptz)
    
    - `experiences`
      - `id` (uuid, primary key)
      - `day_id` (uuid, foreign key to days)
      - `time` (text) - Time in format like "10:00"
      - `title` (text) - Experience title
      - `category` (text) - Category: dining, stay, excursion, cultural, wellness, transport, shopping
      - `concierge_details` (text) - Detailed notes from concierge
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since no auth is specified)
*/

CREATE TABLE IF NOT EXISTS journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  destination text NOT NULL,
  category text NOT NULL,
  tagline text NOT NULL,
  depart_date date NOT NULL,
  return_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid REFERENCES journeys(id) ON DELETE CASCADE NOT NULL,
  day_number int NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid REFERENCES days(id) ON DELETE CASCADE NOT NULL,
  time text NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  concierge_details text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to journeys"
  ON journeys FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to journeys"
  ON journeys FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to journeys"
  ON journeys FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from journeys"
  ON journeys FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to days"
  ON days FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to days"
  ON days FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to days"
  ON days FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from days"
  ON days FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to experiences"
  ON experiences FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to experiences"
  ON experiences FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to experiences"
  ON experiences FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from experiences"
  ON experiences FOR DELETE
  TO anon
  USING (true);