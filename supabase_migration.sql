-- Run this in your Supabase SQL Editor

ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS domain text,
ADD COLUMN IF NOT EXISTS logo text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS language text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS persona text,
ADD COLUMN IF NOT EXISTS schedule text,
ADD COLUMN IF NOT EXISTS accent_color text DEFAULT '#8b5cf6',
ADD COLUMN IF NOT EXISTS competitors jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS keywords jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tracked_ai_models jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS models jsonb DEFAULT '[]'::jsonb;
