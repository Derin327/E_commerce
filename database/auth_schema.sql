-- ============================================================
-- GORA Store - Auth Schema Additions (V2)
-- Run in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- 1. Extend the profiles table with customer-specific fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pincode VARCHAR(10),
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Indexes for fast lookup at login
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- 2. Pending OTP table — stores temporary phone OTPs before user is fully registered
--    We store hashed OTPs (never plaintext)
CREATE TABLE IF NOT EXISTS pending_phone_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Auto-delete expired OTPs (relies on a pg_cron job or periodic cleanup)
CREATE INDEX IF NOT EXISTS idx_pending_otps_phone ON pending_phone_otps(phone);
CREATE INDEX IF NOT EXISTS idx_pending_otps_expires ON pending_phone_otps(expires_at);

-- RLS: OTP table is only accessible server-side (service role)
ALTER TABLE pending_phone_otps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public access to pending_phone_otps" ON pending_phone_otps FOR ALL USING (false);

-- 3. Allow users to read/update their OWN profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
