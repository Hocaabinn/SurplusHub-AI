import { createClient } from '@supabase/supabase-js';

// Tambahkan tanda ! di akhir untuk validasi tipe data TypeScript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Pastikan variabel di atas tidak undefined sebelum membuat client
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase Environment Variables');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'public' },
});