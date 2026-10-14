-- Migration 002: Schemas + Enums (applied to project pdoznhmckwovmrerlcro)
CREATE SCHEMA IF NOT EXISTS directory;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS listings;
CREATE SCHEMA IF NOT EXISTS jobs;
CREATE SCHEMA IF NOT EXISTS events;
CREATE SCHEMA IF NOT EXISTS moderation;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS ads;
CREATE SCHEMA IF NOT EXISTS ai;

CREATE TYPE public.user_role AS ENUM ('user','business_owner','editor','moderator','admin','super_admin');
CREATE TYPE public.place_type AS ENUM ('business','restaurant','beach','trail','park','attraction','organization','nature_spot','real_estate');
CREATE TYPE public.place_status AS ENUM ('pending','active','rejected','suspended');
CREATE TYPE public.plan_type AS ENUM ('free','starter','pro','enterprise');
CREATE TYPE public.report_reason AS ENUM ('spam','fake','inappropriate','wrong_info','scam','offensive','duplicate','other');
CREATE TYPE public.report_status AS ENUM ('pending','reviewed','action_taken','dismissed');
CREATE TYPE public.listing_type AS ENUM ('marketplace','real_estate');
CREATE TYPE public.job_type AS ENUM ('full_time','part_time','freelance','internship');
CREATE TYPE public.location_type AS ENUM ('on_site','hybrid','remote');
