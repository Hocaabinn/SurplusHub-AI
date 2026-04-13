import { createClient } from '@supabase/supabase-js';

// Add non-null assertions for TypeScript validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ensure the variables above are defined before creating the client
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase Environment Variables');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'public' },
});
