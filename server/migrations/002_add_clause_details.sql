-- -----------------------------------------------------------------------
-- Migration 002: Add missing clause detail fields
-- -----------------------------------------------------------------------
ALTER TABLE clauses ADD COLUMN IF NOT EXISTS scenario text;
ALTER TABLE clauses ADD COLUMN IF NOT EXISTS fairness_score int;
ALTER TABLE clauses ADD COLUMN IF NOT EXISTS negotiation_questions jsonb;
