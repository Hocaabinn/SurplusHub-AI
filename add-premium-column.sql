-- Migration: Add is_premium column to profiles table
-- Run this in your Supabase SQL editor

-- Add is_premium column (defaults to false)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Create index for premium status queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium);

-- Allow users to update their own premium status
-- (In production, this should be handled server-side via webhook/payment)
-- For now, we allow it for the beta free upgrade flow
CREATE POLICY "Users can update own premium status"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================================================
-- Done! The is_premium column has been added to the profiles table.
-- ============================================================================
