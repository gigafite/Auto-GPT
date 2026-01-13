-- Migration: Secure subscriptions table
-- Description: Add Row Level Security policy to prevent anonymous access to subscriptions table
-- This prevents exposure of sensitive data like Stripe customer IDs, subscription IDs,
-- payment status, and subscription periods.

-- Create subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    payment_status TEXT,
    subscription_period_start TIMESTAMPTZ,
    subscription_period_end TIMESTAMPTZ,
    plan_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on the subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Deny anonymous access" ON subscriptions;

-- Create policy to deny anonymous access
-- Only authenticated users can read subscription data
CREATE POLICY "Deny anonymous access"
    ON subscriptions
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Additional security: Users can only read their own subscription data
DROP POLICY IF EXISTS "Users can only read own subscriptions" ON subscriptions;

CREATE POLICY "Users can only read own subscriptions"
    ON subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for INSERT: Only authenticated users can insert their own subscriptions
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;

CREATE POLICY "Users can insert own subscriptions"
    ON subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE: Only authenticated users can update their own subscriptions
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

CREATE POLICY "Users can update own subscriptions"
    ON subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE: Only authenticated users can delete their own subscriptions
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON subscriptions;

CREATE POLICY "Users can delete own subscriptions"
    ON subscriptions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster user_id lookups
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);

-- Create index for stripe_customer_id lookups
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON subscriptions(stripe_customer_id);

-- Add comment to table for documentation
COMMENT ON TABLE subscriptions IS 'Stores user subscription data with RLS policies to prevent unauthorized access';
