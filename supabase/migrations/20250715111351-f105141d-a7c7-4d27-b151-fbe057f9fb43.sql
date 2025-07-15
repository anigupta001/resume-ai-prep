-- Clean up duplicate tables in api schema and ensure everything is in public schema
-- Drop tables from api schema if they exist
DROP TABLE IF EXISTS api.interview_answers CASCADE;
DROP TABLE IF EXISTS api.interview_questions CASCADE;  
DROP TABLE IF EXISTS api.interview_reviews CASCADE;
DROP TABLE IF EXISTS api.interview_sessions CASCADE;
DROP TABLE IF EXISTS api.profiles CASCADE;

-- Drop the api schema completely if it exists and is empty
DROP SCHEMA IF EXISTS api CASCADE;