# Supabase Database Migrations

This directory contains database migrations for the Auto-GPT Supabase integration.

## Security

### Subscriptions Table Security

The `subscriptions` table has been secured with Row Level Security (RLS) policies to prevent unauthorized access to sensitive subscription data.

**Security measures implemented:**

1. **Row Level Security Enabled**: The table has RLS enabled to enforce access control at the database level.

2. **Deny Anonymous Access**: Anonymous users (not authenticated) cannot read any subscription data.

3. **User Isolation**: Authenticated users can only access their own subscription records, preventing data leakage between users.

4. **Protected Sensitive Data**: The following sensitive fields are protected:
   - Stripe customer IDs
   - Stripe subscription IDs
   - Payment status
   - Subscription periods

## Applying Migrations

To apply these migrations to your Supabase database:

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

Alternatively, you can run the SQL directly in the Supabase SQL Editor:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration file contents
4. Execute the SQL

## Migration Files

- `20260113_secure_subscriptions_table.sql`: Secures the subscriptions table with RLS policies

## Testing RLS Policies

You can test the RLS policies work correctly:

```sql
-- Test 1: Anonymous users should not be able to read subscriptions
SET request.jwt.claims TO '{}';
SELECT * FROM subscriptions; -- Should return no rows

-- Test 2: Authenticated users should only see their own subscriptions
SET request.jwt.claims TO '{"sub": "user-uuid-here"}';
SELECT * FROM subscriptions; -- Should only return rows for this user_id
```
